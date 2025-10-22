package fr.forgefitness.shared.network

import io.ktor.client.*
import io.ktor.client.engine.darwin.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.client.statement.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

actual fun createHttpClient(): HttpClient {
    val json = Json {
        explicitNulls = false
        prettyPrint = false
        isLenient = true
        ignoreUnknownKeys = true
    }

    return HttpClient(Darwin) {
        expectSuccess = false

        install(ContentNegotiation) { json(json) }
        install(Logging) {
            logger = Logger.DEFAULT
            level = LogLevel.BODY
        }
    }
}