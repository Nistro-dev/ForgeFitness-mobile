package fr.forgefitness.android.feature.home

data class HomeUiState(
    val greeting: String = "",
    val isLoading: Boolean = true,
    val healthStatus: String? = null,
    val error: String? = null
)