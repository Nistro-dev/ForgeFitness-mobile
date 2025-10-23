package fr.forgefitness.android.ui.components

import android.graphics.Bitmap
import androidx.lifecycle.ViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class QrBitmapViewModel : ViewModel() {
    private val cache = LinkedHashMap<String, Bitmap>() // simple LRU si tu veux limiter

    fun get(key: String): Bitmap? = cache[key]

    suspend fun getOrCreate(key: String, render: suspend () -> Bitmap): Bitmap {
        val hit = cache[key]
        if (hit != null) return hit
        val bmp = withContext(Dispatchers.Default) { render() }
        cache[key] = bmp
        return bmp
    }

    fun clear() {
        cache.values.forEach { it.recycle() }
        cache.clear()
    }

    override fun onCleared() {
        super.onCleared()
        clear()
    }
}