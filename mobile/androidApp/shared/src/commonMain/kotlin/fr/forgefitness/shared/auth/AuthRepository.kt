package fr.forgefitness.shared.auth

import fr.forgefitness.shared.TokenStorage
import fr.forgefitness.shared.network.ApiClient

interface DeviceInfoProvider {
    suspend fun get(): DeviceInfo
}

class AuthRepository(
    private val api: ApiClient,
    private val storage: TokenStorage,
    private val deviceInfoProvider: DeviceInfoProvider
) {
    suspend fun isLoggedIn(): Boolean = storage.getToken()?.isNotBlank() == true

    suspend fun getToken(): String? = storage.getToken()

    suspend fun logout() {
        storage.clear()
    }

    suspend fun activate(code: String): ActivateResponse {
        val device = deviceInfoProvider.get()
        val res = api.activate(ActivateRequest(key = code, device = device))
        storage.saveToken(res.token)
        return res
    }
}