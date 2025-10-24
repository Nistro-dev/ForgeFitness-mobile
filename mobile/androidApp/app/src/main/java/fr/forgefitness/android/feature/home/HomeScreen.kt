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
import fr.forgefitness.android.ui.components.QrCard
import fr.forgefitness.android.ui.components.QrStyle

@Composable
fun HomeRoute() {
    HomeScreen()
}

@Composable
fun HomeScreen() {
    var selectedTab by remember { mutableStateOf(MainTab.QR) }

    Scaffold(
        bottomBar = {
            CustomTabBar(
                selected = selectedTab,
                onTabSelected = { selectedTab = it }
            )
        },
        contentWindowInsets = WindowInsets(0)
    ) { innerPadding ->
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            color = Color.Black
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Top)),
                contentAlignment = Alignment.Center
            ) {
                when (selectedTab) {
                    MainTab.Shop -> Text("Boutique", style = MaterialTheme.typography.headlineMedium, color = Color.White)
                    MainTab.Coaching -> Text("Coaching", style = MaterialTheme.typography.headlineMedium, color = Color.White)
                    MainTab.QR -> {
                        val qvm: QrViewModel = viewModel()
                        val qstate by qvm.ui.collectAsState()

                        when {
                            qstate.isLoading -> {
                                CircularProgressIndicator(color = Color.White)
                            }
                            qstate.error != null -> {
                                Text(qstate.error ?: "Erreur", color = Color.Red)
                            }
                            qstate.code != null -> {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    QrCard(
                                        code = qstate.code!!,
                                        squareSize = 350.dp,
                                        cornerRadius = 20.dp,
                                        qrStyle = QrStyle.Classic,
                                        logoScale = 0.25f,
                                        marginModules = 5f
                                    )
                                    Spacer(Modifier.height(12.dp))
                                    Text(
                                        text = "Présentez le QR à la borne",
                                        color = Color.White,
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                }
                            }
                            else -> Text("QR indisponible", color = Color.Gray)
                        }
                    }
                    MainTab.Programs -> Text("Programmes", style = MaterialTheme.typography.headlineMedium, color = Color.White)
                    MainTab.Events -> Text("Événements", style = MaterialTheme.typography.headlineMedium, color = Color.White)
                }
            }
        }
    }
}