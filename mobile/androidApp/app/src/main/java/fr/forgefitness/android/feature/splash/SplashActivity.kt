package fr.forgefitness.android.feature.splash

import android.animation.Animator
import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.animation.PathInterpolator
import androidx.activity.ComponentActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.airbnb.lottie.LottieAnimationView
import fr.forgefitness.android.MainActivity
import fr.forgefitness.android.R

class SplashActivity : ComponentActivity() {

    // mêmes valeurs que sur iOS
    private val scaleFactor = 2.0f          // idem SwiftUI
    private val fadeInDur  = 450L           // ms
    private val holdAfter  = 250L
    private val fadeOutDur = 550L
    private val popIn      = 1.05f
    private val popOut     = 0.93f
    private val startScale = 0.94f

    // bezier équivalents aux easings iOS
    private val easeOut   = PathInterpolator(0.0f, 0.0f, 0.2f, 1f)
    private val easeInOut = PathInterpolator(0.4f, 0f, 0.2f, 1f)

    override fun onCreate(savedInstanceState: Bundle?) {
        if (Build.VERSION.SDK_INT >= 31) installSplashScreen()
        super.onCreate(savedInstanceState)
        setTheme(R.style.Theme_ForgeFitness_NoActionBar)
        setContentView(R.layout.activity_splash)

        val logo = findViewById<LottieAnimationView>(R.id.lottie_logo)
        val root = findViewById<View>(R.id.splash_root)

        // responsive: même formule que iOS (0.9 * min * scaleFactor)
        root.post {
            val side = (minOf(root.width, root.height) * 0.9f * scaleFactor).toInt()
            logo.layoutParams.width = side
            logo.layoutParams.height = side
            logo.requestLayout()
        }

        logo.scaleX = startScale
        logo.scaleY = startScale
        logo.alpha = 0f

        // fade-in + pop-in (identique iOS)
        val fadeIn = ObjectAnimator.ofFloat(logo, View.ALPHA, 0f, 1f).apply {
            duration = fadeInDur
            interpolator = easeOut
        }
        val scaleUp1X = ObjectAnimator.ofFloat(logo, View.SCALE_X, startScale, popIn).apply {
            duration = fadeInDur
            interpolator = easeOut
        }
        val scaleUp1Y = ObjectAnimator.ofFloat(logo, View.SCALE_Y, startScale, popIn).apply {
            duration = fadeInDur
            interpolator = easeOut
        }

        // petit “settle” vers 1.0 (spring-like)
        val settleX = ObjectAnimator.ofFloat(logo, View.SCALE_X, 1.0f).apply {
            duration = 500
            startDelay = (fadeInDur * 0.6f).toLong()
            interpolator = easeOut
        }
        val settleY = ObjectAnimator.ofFloat(logo, View.SCALE_Y, 1.0f).apply {
            duration = 500
            startDelay = (fadeInDur * 0.6f).toLong()
            interpolator = easeOut
        }

        AnimatorSet().apply {
            playTogether(fadeIn, scaleUp1X, scaleUp1Y, settleX, settleY)
            start()
        }.addListener(object : Animator.AnimatorListener {
            override fun onAnimationStart(animation: Animator) {}
            override fun onAnimationCancel(animation: Animator) {}
            override fun onAnimationRepeat(animation: Animator) {}
            override fun onAnimationEnd(animation: Animator) {
                logo.playAnimation()
            }
        })

        // quand la Lottie se termine : pop-out + fade-out (comme iOS)
        logo.addAnimatorListener(object : Animator.AnimatorListener {
            override fun onAnimationStart(animation: Animator) {}
            override fun onAnimationCancel(animation: Animator) {}
            override fun onAnimationRepeat(animation: Animator) {}

            override fun onAnimationEnd(animation: Animator) {
                val popOutX = ObjectAnimator.ofFloat(logo, View.SCALE_X, popOut).apply {
                    duration = 300
                    interpolator = easeOut
                }
                val popOutY = ObjectAnimator.ofFloat(logo, View.SCALE_Y, popOut).apply {
                    duration = 300
                    interpolator = easeOut
                }
                val fadeOut = ObjectAnimator.ofFloat(logo, View.ALPHA, 0f).apply {
                    duration = fadeOutDur
                    startDelay = 50
                    interpolator = easeInOut
                }

                AnimatorSet().apply {
                    playTogether(popOutX, popOutY, fadeOut)
                    start()
                }.addListener(object : Animator.AnimatorListener {
                    override fun onAnimationStart(animation: Animator) {}
                    override fun onAnimationCancel(animation: Animator) {}
                    override fun onAnimationRepeat(animation: Animator) {}
                    override fun onAnimationEnd(animation: Animator) {
                        startActivity(Intent(this@SplashActivity, MainActivity::class.java))
                        overridePendingTransition(0, 0)
                        finish()
                    }
                })
            }
        })
    }
}