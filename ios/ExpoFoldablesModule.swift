import ExpoModulesCore
import UIKit

private let stateChangeEvent = "onStateChange"
private let angleChangeEvent = "onAngleChange"

public class ExpoFoldablesModule: Module {
  private let lock = NSLock()
  private var hingeState: HingeState?
  private var angleDegrees: Double?
  private var isObservingState = false
  private var isObservingAngle = false

  @MainActor private var observerView: HingeObserverView?

  public func definition() -> ModuleDefinition {
    Name("ExpoFoldables")

    Events(stateChangeEvent, angleChangeEvent)

    Property("isAvailable") {
      self.withLock { self.hingeState != nil }
    }

    // UIHinge always reports an angle alongside its status.
    Property("isAngleAvailable") {
      self.withLock { self.hingeState != nil }
    }

    Function("getState") { () -> [String: Any]? in
      self.withLock { self.hingeState?.toDictionary() }
    }

    // Latest reading, so new JS listeners get the current angle without waiting for a change.
    Function("getAngleDegrees") { () -> Double? in
      self.withLock { self.angleDegrees }
    }

    OnStartObserving(stateChangeEvent) { self.withLock { self.isObservingState = true } }
    OnStopObserving(stateChangeEvent) { self.withLock { self.isObservingState = false } }
    OnStartObserving(angleChangeEvent) { self.withLock { self.isObservingAngle = true } }
    OnStopObserving(angleChangeEvent) { self.withLock { self.isObservingAngle = false } }

    OnCreate {
      self.onMain { self.attachObserverIfNeeded() }
    }

    // The key window may not exist yet when the module is created.
    OnAppBecomesActive {
      self.onMain { self.attachObserverIfNeeded() }
    }

    OnDestroy {
      self.onMain {
        self.observerView?.removeFromSuperview()
        self.observerView = nil
      }
    }
  }

  private func withLock<T>(_ body: () -> T) -> T {
    lock.lock()
    defer { lock.unlock() }
    return body()
  }

  private func onMain(_ body: @escaping @MainActor () -> Void) {
    DispatchQueue.main.async {
      MainActor.assumeIsolated(body)
    }
  }

  @MainActor
  private func attachObserverIfNeeded() {
    guard let window = Self.keyWindow() else {
      return
    }
    if let observerView, observerView.window === window {
      return
    }
    observerView?.removeFromSuperview()

    let view = HingeObserverView(frame: window.bounds)
    view.onStateChange = { [weak self] state in
      self?.update(state)
    }
    view.onAngleChange = { [weak self] angleDegrees in
      guard let self else {
        return
      }
      let shouldSend = self.withLock { () -> Bool in
        self.angleDegrees = angleDegrees
        return self.isObservingAngle
      }
      if shouldSend {
        self.sendEvent(angleChangeEvent, ["angleDegrees": angleDegrees])
      }
    }
    window.insertSubview(view, at: 0)
    observerView = view
  }

  private func update(_ state: HingeState?) {
    let shouldSend = withLock { () -> Bool in
      if state == nil {
        angleDegrees = nil
      }
      guard hingeState != state else {
        return false
      }
      hingeState = state
      return isObservingState
    }
    if shouldSend {
      sendEvent(stateChangeEvent, ["state": state?.toDictionary() as Any])
    }
  }

  @MainActor
  private static func keyWindow() -> UIWindow? {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap(\.windows)
      .first(where: \.isKeyWindow)
  }
}

/// Snapshot of the hinge sent to JavaScript. Mirrors the `HingeState` TypeScript type.
struct HingeState: Equatable {
  struct Fold: Equatable {
    /// Fold area in window coordinates.
    let frame: CGRect
    let isSeparating: Bool
  }

  let posture: String
  let fold: Fold?

  func toDictionary() -> [String: Any] {
    var dictionary: [String: Any] = ["posture": posture]
    if let fold {
      dictionary["fold"] = [
        "bounds": [
          "x": fold.frame.origin.x,
          "y": fold.frame.origin.y,
          "width": fold.frame.width,
          "height": fold.frame.height,
        ],
        "orientation": fold.frame.width >= fold.frame.height ? "horizontal" : "vertical",
        "isSeparating": fold.isSeparating,
        // iPhone Duo folds a continuous display, so the fold never hides content.
        "occlusion": "none",
      ]
    }
    return dictionary
  }
}

/// Invisible, window-sized view that hosts the hinge interaction. UIKit only delivers hinge updates
/// and reserved regions to views in a window, and has no change notification for reserved regions,
/// so they are re-read on every hinge update and layout pass.
final class HingeObserverView: UIView {
  var onStateChange: ((HingeState?) -> Void)?
  var onAngleChange: ((Double) -> Void)?

  /// `nil` until the first update, and when the device has no hinge.
  private var posture: String?
  private var lastAngleDegrees: Double?

  override init(frame: CGRect) {
    super.init(frame: frame)
    autoresizingMask = [.flexibleWidth, .flexibleHeight]
    isUserInteractionEnabled = false
    backgroundColor = .clear

    if #available(iOS 27.1, *) {
      addInteraction(UIHingeInteraction { [weak self] _, update in
        self?.hingeDidUpdate(update.hinge)
      })
    }
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) {
    fatalError("init(coder:) is not supported")
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    // Rotation and window resizing move the fold.
    publishState()
  }

  @available(iOS 27.1, *)
  private func hingeDidUpdate(_ hinge: UIHinge?) {
    guard let hinge else {
      posture = nil
      lastAngleDegrees = nil
      publishState()
      return
    }

    let newPosture = Self.posture(for: hinge.status)
    if newPosture != posture {
      posture = newPosture
      publishState()
      setNeedsLayout()
    }

    let angleDegrees = Double(hinge.angle) * 180 / .pi
    if angleDegrees != lastAngleDegrees {
      lastAngleDegrees = angleDegrees
      onAngleChange?(angleDegrees)
    }
  }

  private func publishState() {
    guard let posture else {
      onStateChange?(nil)
      return
    }
    onStateChange?(HingeState(posture: posture, fold: currentFold()))
  }

  private func currentFold() -> HingeState.Fold? {
    guard #available(iOS 27.1, *), let window else {
      return nil
    }
    // Include inactive regions so the fold is still reported, as non-separating, when flat.
    let region = reservedRegions(kind: .division, options: .includeInactive).first
    return region.map {
      HingeState.Fold(frame: convert($0.frame, to: window), isSeparating: $0.isActive)
    }
  }

  @available(iOS 27.1, *)
  private static func posture(for status: UIHinge.Status) -> String {
    switch status {
    case .closed:
      return "closed"
    case .partiallyOpen:
      return "partially-open"
    case .fullyOpen:
      return "fully-open"
    case .unknown:
      return "unknown"
    @unknown default:
      return "unknown"
    }
  }
}
