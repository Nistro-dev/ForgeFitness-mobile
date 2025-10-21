package fr.forgefitness.shared.network

import fr.forgefitness.shared.auth.ActivateRequest
import fr.forgefitness.shared.auth.ActivateResponse
import io.ktor.client.*
import io.ktor.client.call.body
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.isSuccess
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

expect fun createHttpClient(): HttpClient

class ApiClient(
    private val baseUrl: String = "http://10.0.2.2:3001"
) {
    private val client: HttpClient = createHttpClient()
    private val json = Json { ignoreUnknownKeys = true }

    suspend fun healthCheckOrNull(): HealthStatus? = try {
        client.get("$baseUrl/health").body()
    } catch (_: Exception) {
        null
    }

    suspend fun activate(req: ActivateRequest): ActivateResponse {
        val resp = client.post("$baseUrl/auth/activate") {
            contentType(ContentType.Application.Json)
            setBody(req)
        }

        val raw = try { resp.bodyAsText() } catch (_: Throwable) { "<no-body>" }

        // Log propre (println pour commonMain, visible dans Logcat sur Android)
        println("ForgeFitness/Network: POST /auth/activate -> ${resp.status.value} ${resp.status.description}. body=$raw")

        if (resp.status.isSuccess()) {
            return json.decodeFromString(ActivateResponse.serializer(), raw)
        } else {
            // Essaie de parser l'enveloppe d'erreur connue
            val env = runCatching {
                json.decodeFromString(ErrorEnvelope.serializer(), raw)
            }.getOrNull()

            if (env != null) {
                // apiCode = message (INVALID_KEY), httpCode = code (BAD_REQUEST)
                throw ApiError(apiCode = env.error.message, httpCode = env.error.code, message = env.error.message)
            } else {
                throw ApiError(apiCode = "HTTP_${resp.status.value}", httpCode = resp.status.toString(), message = raw)
            }
        }
    }

    var tokenProvider: (suspend () -> String?)? = null
}

@Serializable
data class HealthStatus(
    val status: String,
    val timestamp: String? = null
)

// Enveloppe d'erreur du backend
@Serializable data class ErrorEnvelope(val error: ErrorBody)
@Serializable data class ErrorBody(val code: String, val message: String)