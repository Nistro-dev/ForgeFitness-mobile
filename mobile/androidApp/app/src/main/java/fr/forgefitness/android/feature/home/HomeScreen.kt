package fr.forgefitness.android.feature.home

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun HomeRoute(vm: HomeViewModel = viewModel()) {
    val state by vm.ui.collectAsState()
    HomeScreen(state = state, onRetry = vm::refresh)
}

@Composable
fun HomeScreen(state: HomeUiState, onRetry: () -> Unit) {
    Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
                .windowInsetsPadding(WindowInsets.safeDrawing),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            if (state.greeting.isNotBlank()) {
                Text(state.greeting, style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(24.dp))
            }

            when {
                state.error != null -> { /* message + bouton Réessayer */ }
                state.healthStatus != null -> {
                    Text("✅ Backend : ${state.healthStatus}", color = MaterialTheme.colorScheme.primary)
                }
                else -> {
                    Spacer(Modifier.height(1.dp))
                }
            }
        }
    }
}