package fr.forgefitness.shared.auth

import android.content.Context
import fr.forgefitness.shared.network.ApiClient

fun provideAuthRepository(
    context: Context,
    baseUrl: String
): AuthRepository {
    val api = ApiClient(baseUrl)
    val storage = AndroidTokenStorage(context)
    val deviceProvider = AndroidDeviceInfoProvider(context)
    return AuthRepository(api, storage, deviceProvider)
}