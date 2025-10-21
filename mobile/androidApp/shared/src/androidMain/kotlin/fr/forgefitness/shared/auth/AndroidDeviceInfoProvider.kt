package fr.forgefitness.shared.auth

import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.util.UUID

private const val PREFS = "auth_prefs"
private const val KEY_DEVICE_ID = "device_id"

class AndroidDeviceInfoProvider(private val context: Context) : DeviceInfoProvider {

    override suspend fun get(): DeviceInfo {
        val deviceId = getOrCreateDeviceId()
        return DeviceInfo(
            platform = "ANDROID",
            model = "${Build.MANUFACTURER} ${Build.MODEL}".trim(),
            deviceId = deviceId,
            appVersion = appVersion()
        )
    }

    private fun appVersion(): String? {
        return try {
            val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            val versionName = pInfo.versionName ?: return null
            val versionCode = if (Build.VERSION.SDK_INT >= 28) {
                pInfo.longVersionCode.toString()
            } else {
                @Suppress("DEPRECATION") pInfo.versionCode.toString()
            }
            "$versionName ($versionCode)"
        } catch (_: PackageManager.NameNotFoundException) { null }
    }

    private fun prefs(): SharedPreferences {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        return EncryptedSharedPreferences.create(
            context,
            PREFS,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    private fun getOrCreateDeviceId(): String {
        val p = prefs()
        val existing = p.getString(KEY_DEVICE_ID, null)
        if (!existing.isNullOrBlank()) return existing
        val fresh = "and-${UUID.randomUUID()}"
        p.edit().putString(KEY_DEVICE_ID, fresh).apply()
        return fresh
    }
}