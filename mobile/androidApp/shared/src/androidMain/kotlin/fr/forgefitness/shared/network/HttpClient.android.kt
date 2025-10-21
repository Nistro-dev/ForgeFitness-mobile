package fr.forgefitness.shared.network

import io.ktor.client.*
import io.ktor.client.engine.android.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

actual fun createHttpClient(): HttpClient {
    val json = Json {
        explicitNulls = false
        prettyPrint = false
        isLenient = true
        ignoreUnknownKeys = true
    }

    return HttpClient(Android) {
        expectSuccess = false

        install(ContentNegotiation) { json(json) }

        install(Logging) {
            logger = object : Logger {
                override fun log(message: String) {
                    android.util.Log.d("Ktor", message)
                }
            }
            level = LogLevel.ALL
        }
    }
}