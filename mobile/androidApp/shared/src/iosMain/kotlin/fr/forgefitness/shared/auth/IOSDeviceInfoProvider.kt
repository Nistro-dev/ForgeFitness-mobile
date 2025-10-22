package fr.forgefitness.shared.auth

import platform.UIKit.*
import platform.Foundation.NSUUID

class IOSDeviceInfoProvider {
    fun get(): DeviceInfo {
        val model = UIDevice.currentDevice.model ?: "iOS"
        val id = "ios-${NSUUID().UUIDString}"
        // à adapter si tu veux la vraie version app côté iOS
        val appVersion = "1.0 (1)"
        return DeviceInfo(platform = "IOS", model = model, deviceId = id, appVersion = appVersion)
    }
}