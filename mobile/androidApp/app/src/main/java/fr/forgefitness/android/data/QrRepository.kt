package fr.forgefitness.android.data

import android.content.Context
import fr.forgefitness.shared.auth.AndroidDeviceInfoProvider
import fr.forgefitness.shared.auth.AndroidTokenStorage
import fr.forgefitness.shared.network.ApiClient

class QrRepository(
    context: Context,
    baseUrl: String = "http://10.0.2.2:3001"
) {
    private val api = ApiClient(baseUrl)
    private val storage = AndroidTokenStorage(context)
    @Suppress("unused")
    private val deviceProvider = AndroidDeviceInfoProvider(context) // prêt si besoin

    suspend fun issueQrCode(
        audience: String = "entrance_main",
        scope: String? = "entry"
    ): ApiClient.IssueQrCodeResponse {
        val token = storage.getToken()
            ?: throw IllegalStateException("User not authenticated: missing token")
        return api.issueQrCode(bearerToken = token, audience = audience, scope = scope)
    }
}
