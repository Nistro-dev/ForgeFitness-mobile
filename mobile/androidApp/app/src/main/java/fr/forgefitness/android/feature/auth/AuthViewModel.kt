package fr.forgefitness.android.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import fr.forgefitness.shared.network.ApiClient
import fr.forgefitness.shared.network.ApiError
import fr.forgefitness.shared.auth.ActivateRequest
import fr.forgefitness.shared.auth.AndroidTokenStorage
import fr.forgefitness.shared.auth.AndroidDeviceInfoProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import android.content.Context

data class AuthUiState(
    val code: String = "",
    val loading: Boolean = false,
    val error: String? = null,
    val done: Boolean = false
)

class AuthViewModel(
    private val context: Context,
    private val api: ApiClient,
    private val tokenStorage: AndroidTokenStorage,
    private val deviceInfoProvider: AndroidDeviceInfoProvider
) : ViewModel() {

    private val _ui = MutableStateFlow(AuthUiState())
    val ui = _ui.asStateFlow()

    fun onCodeChange(v: String) {
        _ui.value = _ui.value.copy(
            code = v.filter { it.isLetterOrDigit() }.uppercase(),
            error = null
        )
    }

    fun trySetFullCode(raw: String?) {
        val cleaned = raw?.filter { it.isLetterOrDigit() }?.uppercase() ?: return
        if (cleaned.length == 6) _ui.value = _ui.value.copy(code = cleaned, error = null)
    }

    fun activate() {
        val key = _ui.value.code.filter { it.isLetterOrDigit() }
        if (key.length != 6) {
            _ui.value = _ui.value.copy(error = "Code invalide", loading = false)
            return
        }

        viewModelScope.launch {
            try {
                _ui.value = _ui.value.copy(loading = true, error = null)

                val di = deviceInfoProvider.get().copy(platform = "ANDROID")
                val res = api.activate(ActivateRequest(key = key, device = di))

                tokenStorage.saveToken(res.token)
                _ui.value = _ui.value.copy(loading = false, done = true)

            } catch (t: Throwable) {
                val msg = when (t) {
                    is ApiError -> when (t.message) {
                        "INVALID_KEY"      -> "Code invalide"
                        "KEY_ALREADY_USED" -> "Ce code a déjà été utilisé"
                        "USER_NOT_FOUND"   -> "Compte introuvable"
                        "KEY_EXPIRED"      -> "Ce code a expiré"
                        else               -> "Erreur: ${t.message} (HTTP ${t.httpStatus ?: 0})"
                    }
                    else -> t.message ?: "Échec de l'activation"
                }
                _ui.value = _ui.value.copy(loading = false, error = msg)
            }
        }
    }
}