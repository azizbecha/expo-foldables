import ExpoModulesCore

public class ExpoHingeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoHinge")

    Events("onChange")

    Constant("PI") {
      Double.pi
    }

    Function("hello") {
      return "Hello world! 👋"
    }

    AsyncFunction("setValueAsync") { (value: String) in
      self.sendEvent("onChange", [
        "value": value
      ])
    }
  }
}
