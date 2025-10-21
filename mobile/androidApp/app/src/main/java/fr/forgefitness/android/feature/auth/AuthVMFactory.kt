package fr.forgefitness.android.feature.auth

import android.app.Application
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import fr.forgefitness.shared.Defaults
import fr.forgefitness.shared.auth.AndroidDeviceInfoProvider
import fr.forgefitness.shared.auth.AndroidTokenStorage
import fr.forgefitness.shared.network.ApiClient

class AuthVMFactory(
    private val app: Application
) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        val api = ApiClient(baseUrl = Defaults.baseUrl)
        val tokenStorage = AndroidTokenStorage(app)
        val deviceInfo = AndroidDeviceInfoProvider(app)

        return AuthViewModel(
            context = app,
            api = api,
            tokenStorage = tokenStorage,
            deviceInfoProvider = deviceInfo
        ) as T
    }
}