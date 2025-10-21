package fr.forgefitness.android.feature.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import fr.forgefitness.android.data.HealthRepository
import fr.forgefitness.android.core.util.Result
import fr.forgefitness.shared.Greeting
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class HomeViewModel(
    private val repo: HealthRepository = HealthRepository()
) : ViewModel() {

    private val _ui = MutableStateFlow(
        HomeUiState(greeting = Greeting().greet(), isLoading = true)
    )
    val ui: StateFlow<HomeUiState> = _ui

    init { refresh() }

    fun refresh() {
        _ui.value = _ui.value.copy(isLoading = true, error = null, healthStatus = null)
        viewModelScope.launch {
            when (val r = repo.health()) {
                is Result.Ok  -> _ui.value = _ui.value.copy(isLoading = false, healthStatus = r.value)
                is Result.Err -> _ui.value = _ui.value.copy(isLoading = false, error = r.message)
            }
        }
    }
}