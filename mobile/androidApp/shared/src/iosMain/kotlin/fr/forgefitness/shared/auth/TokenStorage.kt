package fr.forgefitness.shared.auth

import fr.forgefitness.shared.TokenStorage
import platform.Foundation.NSUserDefaults

private const val KEY_TOKEN = "ff_auth_token"

class IOSUserDefaultsTokenStorage : TokenStorage {
    private val defaults: NSUserDefaults = NSUserDefaults.standardUserDefaults()

    override suspend fun saveToken(token: String) {
        defaults.setObject(token, KEY_TOKEN)
        defaults.synchronize()
    }

    override suspend fun getToken(): String? {
        return defaults.stringForKey(KEY_TOKEN)
    }

    override suspend fun clear() {
        defaults.removeObjectForKey(KEY_TOKEN)
        defaults.synchronize()
    }
}
