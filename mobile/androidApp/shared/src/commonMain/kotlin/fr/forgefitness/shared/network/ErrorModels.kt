package fr.forgefitness.shared.network

import kotlinx.serialization.Serializable

@Serializable
data class ErrorEnvelope(val error: ErrorBody)

@Serializable
data class ErrorBody(val code: String, val message: String)