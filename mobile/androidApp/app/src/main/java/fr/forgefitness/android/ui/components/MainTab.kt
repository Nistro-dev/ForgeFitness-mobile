package fr.forgefitness.android.ui.components

import androidx.annotation.DrawableRes
import fr.forgefitness.android.R

enum class MainTab(
    @DrawableRes val iconRes: Int,
    val label: String
) {
    Shop(R.drawable.ic_shopping_cart, "Boutique"),
    Coaching(R.drawable.ic_biceps_flexed, "Coaching"),
    QR(R.drawable.ic_qr_code, "QR Code"),
    Programs(R.drawable.ic_book_open, "Programmes"),
    Events(R.drawable.ic_calendar, "Événements")
}

