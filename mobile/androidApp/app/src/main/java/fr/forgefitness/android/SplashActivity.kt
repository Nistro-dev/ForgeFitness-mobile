package fr.forgefitness.android

import android.animation.Animator
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.activity.ComponentActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.airbnb.lottie.LottieAnimationView

class SplashActivity : ComponentActivity() {
    private val ui = Handler(Looper.getMainLooper())
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setTheme(R.style.Theme_ForgeFitness_NoActionBar)
        setContentView(R.layout.activity_splash)

        val view = findViewById<LottieAnimationView>(R.id.lottie_logo)
        view.playAnimation()
        view.addAnimatorListener(object : android.animation.Animator.AnimatorListener {
            override fun onAnimationEnd(animation: Animator) {
                view.animate().alpha(0f).setDuration(120).withEndAction {
                    startActivity(Intent(this@SplashActivity, MainActivity::class.java))
                    finish()
                }.start()
            }
            override fun onAnimationStart(animation: Animator) {}
            override fun onAnimationCancel(animation: Animator) {}
            override fun onAnimationRepeat(animation: Animator) {}
        })
    }
}