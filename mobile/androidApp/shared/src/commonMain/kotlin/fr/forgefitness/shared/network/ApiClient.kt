package fr.forgefitness.shared.network

import fr.forgefitness.shared.auth.ActivateRequest
import fr.forgefitness.shared.auth.ActivateResponse
import io.ktor.client.*
import io.ktor.client.call.body
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put

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

    @Throws(ApiError::class, Exception::class)
    suspend fun activate(req: ActivateRequest): ActivateResponse {
        val resp = client.post("$baseUrl/auth/activate") {
            contentType(ContentType.Application.Json)
            setBody(req)
        }

        val raw = try { resp.bodyAsText() } catch (_: Throwable) { "<no-body>" }
        println("ForgeFitness/Network: POST /auth/activate -> ${resp.status.value} ${resp.status.description}. body=$raw")

        if (resp.status.isSuccess()) {
            return json.decodeFromString(ActivateResponse.serializer(), raw)
        } else {
            val env = runCatching {
                json.decodeFromString(ErrorEnvelope.serializer(), raw)
            }.getOrNull()

            if (env != null) {
                throw ApiError(
                    code = env.error.code,
                    httpStatus = resp.status.value,
                    message = env.error.message
                )
            } else {
                throw ApiError(
                    code = "HTTP_${resp.status.value}",
                    httpStatus = resp.status.value,
                    message = raw
                )
            }
        }
    }

    @Serializable
    data class HealthStatus(
        val status: String,
        val timestamp: String? = null
    )

    @Serializable
    data class IssueQrCodeResponse(
        val code: String,
        val expiresAt: String,
        val serverNow: String,
        val ttlSeconds: Int,
        val userStatus: String
    )

    @Throws(ApiError::class, Exception::class)
    suspend fun issueQrCode(
        bearerToken: String,
        audience: String = "entrance_main",
        scope: String? = "entry"
    ): IssueQrCodeResponse {
        val resp = client.post("$baseUrl/api/qr/code") {
            contentType(ContentType.Application.Json)
            header(HttpHeaders.Authorization, "Bearer $bearerToken")
            setBody(buildJsonObject {
                put("audience", audience)
                scope?.let { put("scope", it) }
            })
        }

        val raw = try { resp.bodyAsText() } catch (_: Throwable) { "<no-body>" }

        if (resp.status.isSuccess()) {
            return json.decodeFromString(IssueQrCodeResponse.serializer(), raw)
        } else {
            val env = runCatching {
                json.decodeFromString(ErrorEnvelope.serializer(), raw)
            }.getOrNull()

            if (env != null) {
                val error = ApiError(env.error.code, resp.status.value, env.error.message)
                error.statusCode = resp.status.value
                error.responseBody = raw
                throw error
            } else {
                val error = ApiError("HTTP_${resp.status.value}", resp.status.value, raw)
                error.statusCode = resp.status.value
                error.responseBody = raw
                throw error
            }
        }
    }
}