package fr.forgefitness.shared.auth

import kotlinx.serialization.Serializable

@Serializable
data class DeviceInfo(
    val platform: String,
    val model: String,
    val deviceId: String,
    val appVersion: String? = null
)

@Serializable
data class ActivateRequest(
    val key: String,
    val device: DeviceInfo
)

@Serializable
data class ActivateResponse(
    val token: String,
    val expiresAt: String,
    val user: UserSummary
)

@Serializable
data class UserSummary(
    val id: String,
    val email: String,
    val firstName: String,
    val lastName: String
)