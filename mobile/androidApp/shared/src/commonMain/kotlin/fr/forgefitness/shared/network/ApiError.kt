package fr.forgefitness.shared.network

class ApiError(
    val apiCode: String,
    val httpCode: String? = null,
    override val message: String = apiCode
) : Exception(message)