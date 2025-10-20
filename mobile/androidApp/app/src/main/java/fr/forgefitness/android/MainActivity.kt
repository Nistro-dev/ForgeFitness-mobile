package fr.forgefitness.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import fr.forgefitness.android.ui.theme.ForgeFitnessTheme
import fr.forgefitness.shared.ApiClient
import fr.forgefitness.shared.Greeting
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ForgeFitnessTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    HomeScreen()
                }
            }
        }
    }
}

@Composable
fun HomeScreen() {
    val greeting = remember { Greeting().greet() }
    val apiClient = remember { ApiClient(baseUrl = "http://10.0.2.2:3001") }
    val scope = rememberCoroutineScope()

    var healthStatus by remember { mutableStateOf<String?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        isLoading = true
        errorMessage = null
        healthStatus = null

        val health = apiClient.healthCheckOrNull()

        if (health != null) {
            healthStatus = health.status
        } else {
            errorMessage = "Erreur de connexion au backend."
        }

        isLoading = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("🏋️ ForgeFitness", style = MaterialTheme.typography.headlineLarge)
        Spacer(Modifier.height(24.dp))
        Text(greeting, style = MaterialTheme.typography.bodyLarge)
        Spacer(Modifier.height(32.dp))

        when {
            isLoading -> {
                CircularProgressIndicator()
            }
            errorMessage != null -> {
                Text(
                    text = "❌ Erreur : $errorMessage",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
            healthStatus != null -> {
                Text(
                    text = "✅ Backend : $healthStatus",
                    color = MaterialTheme.colorScheme.primary,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}