package fr.forgefitness.android.feature.home

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import fr.forgefitness.android.R
import fr.forgefitness.android.ui.components.CustomTabBar
import fr.forgefitness.android.ui.components.MainTab
import fr.forgefitness.android.ui.components.QrCard

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
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (selectedTab) {
                MainTab.Shop -> DefaultTabContent("Boutique")
                MainTab.Coaching -> DefaultTabContent("Coaching")
                MainTab.QR -> QrTabContent()
                MainTab.Programs -> DefaultTabContent("Programmes")
                MainTab.Events -> DefaultTabContent("Événements")
            }
        }
    }
}

@Composable
fun QrTabContent() {
    val qvm: QrViewModel = viewModel()
    val qstate by qvm.ui.collectAsState()

    Box(modifier = Modifier.fillMaxSize()) {
        Image(
            painter = painterResource(id = R.drawable.background_qr),
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Top)),
            contentAlignment = Alignment.Center
        ) {
            when {
                qstate.isLoading -> {
                    CircularProgressIndicator(color = Color.White)
                }
                qstate.error != null -> {
                    ErrorContent(error = qstate.error ?: "Erreur", onRetry = { qvm.refreshNow() })
                }
                qstate.code != null -> {
                    QrContent(qstate = qstate)
                }
                else -> {
                    Text("QR indisponible", color = Color.Gray)
                }
            }
        }
    }
}

@Composable
fun QrContent(qstate: QrUiState) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Spacer(Modifier.weight(1f))

        StatusBadge(isActive = qstate.isActive)

        Spacer(Modifier.height(32.dp))

        QrCard(
            code = qstate.code!!,
            squareSize = 380.dp,
            cornerRadius = 12.dp,
            logoScale = 0.25f,
            marginModules = if (qstate.isActive) 5f else -2.5f,
            shadowIntensity = 1.0f
        )

        Spacer(Modifier.height(40.dp))

        Text(
            text = if (qstate.isActive) "Présentez le QR à la borne" else "Rendez-vous à l'accueil",
            color = Color.White.copy(alpha = 0.9f),
            style = MaterialTheme.typography.bodyLarge
        )

        Spacer(Modifier.height(80.dp))
        Spacer(Modifier.weight(1f))
    }
}

@Composable
fun ErrorContent(error: String, onRetry: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = error,
            color = Color.Red,
            style = MaterialTheme.typography.bodyMedium
        )
        Spacer(Modifier.height(16.dp))
        Button(onClick = onRetry) {
            Text("Réessayer")
        }
    }
}

@Composable
fun DefaultTabContent(title: String) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .windowInsetsPadding(WindowInsets.safeDrawing.only(WindowInsetsSides.Top)),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineMedium,
            color = Color.White
        )
    }
}

@Composable
fun StatusBadge(isActive: Boolean) {
    val infiniteTransition = rememberInfiniteTransition(label = "blink")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )

    val bgColor = Color.Black.copy(alpha = 0.6f)
    val textColor = if (isActive) Color(0xFF00C853) else Color.Red
    val dotColor = if (isActive) Color(0xFF00C853) else Color.Red

    Row(
        modifier = Modifier
            .background(bgColor, RoundedCornerShape(16.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .alpha(alpha)
                .background(dotColor, CircleShape)
        )
        Spacer(Modifier.width(6.dp))
        Text(
            text = if (isActive) "Actif" else "Inactif",
            color = textColor,
            style = MaterialTheme.typography.bodyLarge
        )
    }
}