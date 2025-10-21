package fr.forgefitness.shared.network

class ApiError(
    val apiCode: String,          // Code applicatif (ex: "INVALID_KEY")
    val httpCode: String? = null, // Code HTTP (ex: "BAD_REQUEST")
    override val message: String = apiCode
) : Exception(message)