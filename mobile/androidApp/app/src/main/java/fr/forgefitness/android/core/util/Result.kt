package fr.forgefitness.android.core.util

sealed interface Result<out T> {
    data class Ok<T>(val value: T) : Result<T>
    data class Err(val message: String, val cause: Throwable? = null) : Result<Nothing>
}