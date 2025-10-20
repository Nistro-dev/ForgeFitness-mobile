package fr.forgefitness.shared

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import kotlinx.serialization.Serializable

expect fun createHttpClient(): HttpClient

class ApiClient(
    private val baseUrl: String = "http://127.0.0.1:3000"
) {
    private val client: HttpClient = createHttpClient()

    suspend fun healthCheckOrNull(): HealthStatus? {
        return try {
            client.get("$baseUrl/health").body()
        } catch (_: Exception) {
            null
        }
    }
}

@Serializable
data class HealthStatus(
    val status: String,
    val timestamp: String? = null
)