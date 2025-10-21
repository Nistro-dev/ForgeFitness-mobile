package fr.forgefitness.android.data

import fr.forgefitness.shared.ApiClient
import fr.forgefitness.android.core.util.Result

class HealthRepository(
    private val client: ApiClient = ApiClient(baseUrl = "http://10.0.2.2:3001")
) {
    suspend fun health(): Result<String> = try {
        val res = client.healthCheckOrNull()
        if (res != null) Result.Ok(res.status) else Result.Err("Connexion au backend impossible")
    } catch (t: Throwable) {
        Result.Err("Erreur réseau", t)
    }
}