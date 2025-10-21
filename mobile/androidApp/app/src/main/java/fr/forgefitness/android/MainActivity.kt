package fr.forgefitness.android

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import fr.forgefitness.android.feature.home.HomeRoute
import fr.forgefitness.android.ui.theme.ForgeFitnessTheme
import fr.forgefitness.shared.auth.AndroidTokenStorage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ForgeFitnessTheme {
                Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    TokenGate(
                        loadToken = {
                            withContext(Dispatchers.IO) {
                                AndroidTokenStorage(applicationContext).getToken()
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun TokenGate(
    loadToken: suspend () -> String?
) {
    val ctx = LocalContext.current
    var loading by remember { mutableStateOf(true) }
    var hasToken by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        val token = loadToken()
        hasToken = !token.isNullOrBlank()
        loading = false
    }

    LaunchedEffect(loading, hasToken) {
        if (!loading && !hasToken) {
            ctx.startActivity(Intent(ctx, fr.forgefitness.android.feature.auth.ActivateActivity::class.java))
            (ctx as? Activity)?.finish()
        }
    }

    when {
        loading -> {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }
        hasToken -> {
            HomeRoute()
        }
        else -> {
            Box(Modifier.fillMaxSize()) {}
        }
    }
}