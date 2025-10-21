package fr.forgefitness.shared.auth

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import fr.forgefitness.shared.TokenStorage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AndroidTokenStorage(private val context: Context) : TokenStorage {
    private val prefs by lazy {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            "auth_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }
    override suspend fun saveToken(token: String) = withContext(Dispatchers.IO) {
        prefs.edit().putString("jwt", token).apply()
    }
    override suspend fun getToken(): String? = withContext(Dispatchers.IO) { prefs.getString("jwt", null) }
    override suspend fun clear() = withContext(Dispatchers.IO) { prefs.edit().remove("jwt").apply() }
}