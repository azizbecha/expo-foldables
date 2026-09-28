package expo.modules.foldables

import android.app.Activity
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import androidx.window.layout.FoldingFeature
import androidx.window.layout.WindowInfoTracker
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

private const val STATE_CHANGE_EVENT = "onStateChange"
private const val ANGLE_CHANGE_EVENT = "onAngleChange"

// Used to derive a posture from the hinge sensor when no fold crosses the window,
// for example when the app runs on the cover display.
private const val CLOSED_MAX_DEGREES = 10f
private const val FULLY_OPEN_MIN_DEGREES = 170f

class ExpoFoldablesModule : Module(), SensorEventListener {
  private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
  private var layoutJob: Job? = null
  private var isSensorRegistered = false

  @Volatile private var foldingFeature: FoldingFeature? = null
  @Volatile private var density = 1f
  @Volatile private var angleDegrees: Float? = null
  @Volatile private var hasSeenFold = false
  @Volatile private var lastState: Map<String, Any>? = null
  @Volatile private var isObservingState = false
  @Volatile private var isObservingAngle = false

  private val sensorManager: SensorManager?
    get() = appContext.reactContext?.getSystemService(Context.SENSOR_SERVICE) as? SensorManager

  private val hingeSensor: Sensor? by lazy {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      sensorManager?.getDefaultSensor(Sensor.TYPE_HINGE_ANGLE)
    } else {
      null
    }
  }

  private val isAvailable: Boolean
    get() = hingeSensor != null || hasSeenFold

  override fun definition() = ModuleDefinition {
    Name("ExpoFoldables")

    Events(STATE_CHANGE_EVENT, ANGLE_CHANGE_EVENT)

    Property("isAvailable") { isAvailable }

    Property("isAngleAvailable") { hingeSensor != null }

    Function("getState") { currentState() }

    OnStartObserving(STATE_CHANGE_EVENT) { isObservingState = true }
    OnStopObserving(STATE_CHANGE_EVENT) { isObservingState = false }
    OnStartObserving(ANGLE_CHANGE_EVENT) { isObservingAngle = true }
    OnStopObserving(ANGLE_CHANGE_EVENT) { isObservingAngle = false }

    OnCreate { scope.launch { appContext.currentActivity?.let(::startTracking) } }
    OnActivityEntersForeground { scope.launch { appContext.currentActivity?.let(::startTracking) } }
    OnActivityEntersBackground { scope.launch { stopTracking() } }
    OnActivityDestroys { scope.launch { stopTracking() } }
    OnDestroy {
      stopTracking()
      scope.cancel()
    }
  }

  // Tracking state is only touched on the main thread, through `scope`.
  private fun startTracking(activity: Activity) {
    density = activity.resources.displayMetrics.density
    if (layoutJob == null) {
      layoutJob = scope.launch {
        WindowInfoTracker.getOrCreate(activity).windowLayoutInfo(activity).collect { info ->
          val feature = info.displayFeatures.filterIsInstance<FoldingFeature>().firstOrNull()
          if (feature != null) {
            hasSeenFold = true
          }
          foldingFeature = feature
          emitStateIfChanged()
        }
      }
    }
    val sensor = hingeSensor
    if (!isSensorRegistered && sensor != null) {
      isSensorRegistered =
        sensorManager?.registerListener(this, sensor, SensorManager.SENSOR_DELAY_UI) == true
    }
  }

  private fun stopTracking() {
    layoutJob?.cancel()
    layoutJob = null
    if (isSensorRegistered) {
      sensorManager?.unregisterListener(this)
      isSensorRegistered = false
    }
  }

  override fun onSensorChanged(event: SensorEvent) {
    val angle = event.values.firstOrNull() ?: return
    if (angle == angleDegrees) {
      return
    }
    angleDegrees = angle
    if (isObservingAngle) {
      sendEvent(ANGLE_CHANGE_EVENT, mapOf("angleDegrees" to angle.toDouble()))
    }
    // Without a fold in the window, the posture is derived from the angle.
    if (foldingFeature == null) {
      emitStateIfChanged()
    }
  }

  override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) = Unit

  private fun emitStateIfChanged() {
    val state = currentState()
    if (state == lastState) {
      return
    }
    lastState = state
    if (isObservingState) {
      sendEvent(STATE_CHANGE_EVENT, mapOf("state" to state))
    }
  }

  private fun currentState(): Map<String, Any>? {
    if (!isAvailable) {
      return null
    }
    val feature = foldingFeature
    val state = mutableMapOf<String, Any>("posture" to posture(feature))
    // Omit `fold` rather than sending null: the JS type is `fold?: Fold`.
    feature?.let { state["fold"] = foldToMap(it) }
    return state
  }

  private fun posture(feature: FoldingFeature?): String {
    if (feature != null) {
      return when (feature.state) {
        FoldingFeature.State.FLAT -> "fully-open"
        FoldingFeature.State.HALF_OPENED -> "partially-open"
        else -> "unknown"
      }
    }
    val angle = angleDegrees ?: return "unknown"
    return when {
      angle <= CLOSED_MAX_DEGREES -> "closed"
      angle >= FULLY_OPEN_MIN_DEGREES -> "fully-open"
      else -> "partially-open"
    }
  }

  private fun foldToMap(feature: FoldingFeature): Map<String, Any> {
    val bounds = feature.bounds
    return mapOf(
      "bounds" to mapOf(
        "x" to bounds.left / density.toDouble(),
        "y" to bounds.top / density.toDouble(),
        "width" to bounds.width() / density.toDouble(),
        "height" to bounds.height() / density.toDouble()
      ),
      "orientation" to if (feature.orientation == FoldingFeature.Orientation.HORIZONTAL) "horizontal" else "vertical",
      "isSeparating" to feature.isSeparating,
      "occlusion" to if (feature.occlusionType == FoldingFeature.OcclusionType.FULL) "full" else "none"
    )
  }
}
