package fr.forgefitness.android.feature.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import fr.forgefitness.android.data.QrRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.time.Duration
import java.time.Instant
import java.time.format.DateTimeParseException
import kotlin.time.Duration.Companion.seconds

class QrViewModel(app: Application) : AndroidViewModel(app) {

    private val repo = QrRepository(app.applicationContext)

    private val _ui = MutableStateFlow(QrUiState(isLoading = true))
    val ui: StateFlow<QrUiState> = _ui

    private var refreshJob: Job? = null

    init {
        refreshNow()
    }

    fun refreshNow(audience: String = "entrance_main", scope: String? = "entry") {
        refreshJob?.cancel()
        _ui.value = _ui.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            try {
                val res = repo.issueQrCode(audience, scope)
                val expiresAt = parseInstant(res.expiresAt)
                val serverNow = parseInstant(res.serverNow)

                _ui.value = QrUiState(
                    code = res.code,
                    expiresAt = expiresAt,
                    serverNow = serverNow,
                    ttlSeconds = res.ttlSeconds,
                    isLoading = false,
                    error = null
                )
                scheduleAutoRefresh(expiresAt, serverNow, res.ttlSeconds)
            } catch (e: Exception) {
                _ui.value = _ui.value.copy(isLoading = false, error = e.message ?: "Erreur inconnue")
            }
        }
    }

    fun resetQr() {
        refreshJob?.cancel()
        _ui.value = QrUiState(isLoading = false, error = null, code = null)
    }

    private fun scheduleAutoRefresh(expiresAt: Instant?, serverNow: Instant?, ttlSeconds: Int) {
        val nowClient = Instant.now()
        val serverNowInstant = serverNow ?: nowClient

        val marginSec = 15L
        val msUntilRefresh = if (expiresAt != null) {
            val driftMs = Duration.between(serverNowInstant, nowClient).toMillis()
            Duration.between(nowClient, expiresAt).toMillis() - marginSec * 1000 - driftMs
        } else {
            (ttlSeconds - marginSec).coerceAtLeast(1).toLong() * 1000L
        }

        refreshJob?.cancel()
        refreshJob = viewModelScope.launch {
            delay(msUntilRefresh.coerceAtLeast(0))
            refreshNow()
        }
    }

    private fun parseInstant(iso: String?): Instant? = try { iso?.let(Instant::parse) } catch (_: Exception) { null }

    override fun onCleared() {
        refreshJob?.cancel()
        super.onCleared()
    }
}
