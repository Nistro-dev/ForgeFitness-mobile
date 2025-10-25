package fr.forgefitness.shared.network

class ApiError(
    val code: String,
    val httpStatus: Int,
    override val message: String
) : Exception(message) {
    var statusCode: Int = httpStatus
    var responseBody: String? = null
}