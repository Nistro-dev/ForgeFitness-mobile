package fr.forgefitness.android.feature.home

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import fr.forgefitness.android.ui.components.CustomTabBar
import fr.forgefitness.android.ui.components.MainTab

@Composable
fun HomeRoute(vm: HomeViewModel = viewModel()) {
    val state by vm.ui.collectAsState()
    HomeScreen(state = state, onRetry = vm::refresh)
}

@Composable
fun HomeScreen(state: HomeUiState, onRetry: () -> Unit) {
    var selectedTab by remember { mutableStateOf(MainTab.QR) }

    Surface(Modifier.fillMaxSize(), color = Color.Black) {
        Box(Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp)
                    .windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Top)),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                when (selectedTab) {
                    MainTab.Shop -> Text("Boutique", style = MaterialTheme.typography.headlineMedium, color = Color.White)
                    MainTab.Coaching -> Text("Coaching", style = MaterialTheme.typography.headlineMedium, color = Color.White)
                    MainTab.QR -> {
                        if (state.greeting.isNotBlank()) {
                            Text(state.greeting, style = MaterialTheme.typography.titleMedium, color = Color.White)
                            Spacer(Modifier.height(24.dp))
                        }

                        when {
                            state.error != null -> { }
                            state.healthStatus != null -> {
                                Text("✅ Backend : ${state.healthStatus}", color = Color.Green)
                            }
                            else -> {
                                Spacer(Modifier.height(1.dp))
                            }
                        }
                    }
                    MainTab.Programs -> Text("Programmes", style = MaterialTheme.typography.headlineMedium, color = Color.White)
                    MainTab.Events -> Text("Événements", style = MaterialTheme.typography.headlineMedium, color = Color.White)
                }
            }

            CustomTabBar(
                selected = selectedTab,
                onTabSelected = { selectedTab = it },
                modifier = Modifier.align(Alignment.BottomCenter)
            )
        }
    }
}