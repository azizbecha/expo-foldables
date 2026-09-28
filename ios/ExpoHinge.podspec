require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

# The hinge APIs (UIHinge, UIHingeInteraction, UIView.ReservedRegion) ship in the iOS 27.1 SDK.
# Older Xcode versions cannot compile this pod, so warn at `pod install` time instead of failing
# later with missing-symbol errors.
MIN_XCODE_VERSION = '27.1'
xcode_version = `xcodebuild -version 2>/dev/null`[/Xcode (\d+(\.\d+)*)/, 1]
if xcode_version && Gem::Version.new(xcode_version) < Gem::Version.new(MIN_XCODE_VERSION)
  message = "[expo-hinge] Xcode #{MIN_XCODE_VERSION} or newer is required to build ExpoHinge " \
            "(found Xcode #{xcode_version}). The iOS build will fail with missing UIHinge symbols."
  defined?(Pod::UI) ? Pod::UI.warn(message) : warn(message)
end

Pod::Spec.new do |s|
  s.name           = 'ExpoHinge'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = {
    :ios => '16.4'
  }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://github.com/azizbecha/expo-hinge.git', tag: s.version.to_s }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
