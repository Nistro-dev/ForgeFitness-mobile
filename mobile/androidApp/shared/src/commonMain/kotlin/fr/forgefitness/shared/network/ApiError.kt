package fr.forgefitness.shared.network

class ApiError(
    val code: String,
    val httpStatus: Int? = null,
    override val message: String = code
) : Exception(message)