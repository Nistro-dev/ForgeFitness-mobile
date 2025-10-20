package fr.forgefitness.shared

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform