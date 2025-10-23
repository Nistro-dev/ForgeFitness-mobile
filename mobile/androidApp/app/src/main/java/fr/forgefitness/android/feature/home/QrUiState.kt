package fr.forgefitness.android.feature.home

import java.time.Instant

data class QrUiState(
    val code: String? = null,
    val expiresAt: Instant? = null,
    val serverNow: Instant? = null,
    val ttlSeconds: Int? = null,
    val isLoading: Boolean = true,
    val error: String? = null
)
