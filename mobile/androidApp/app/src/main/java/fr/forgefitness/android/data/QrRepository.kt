package fr.forgefitness.android.data

import android.content.Context
import fr.forgefitness.shared.auth.AndroidTokenStorage
import fr.forgefitness.shared.network.ApiClient

class QrRepository(
    context: Context,
    baseUrl: String = "http://10.0.2.2:3001"
) {
    private val api = ApiClient(baseUrl)
    private val storage = AndroidTokenStorage(context)

    suspend fun issueQrCode(
        audience: String = "entrance_main",
        scope: String? = "entry"
    ): ApiClient.IssueQrCodeResponse {
        val token = storage.getToken()
            ?: throw IllegalStateException("User not authenticated: missing token")
        return api.issueQrCode(bearerToken = token, audience = audience, scope = scope)
    }
}
