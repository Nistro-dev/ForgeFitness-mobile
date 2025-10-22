package fr.forgefitness.android.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import fr.forgefitness.android.R

private val BarHeight = 100.dp
private val CenterCircle = 70.dp
private val CenterOffset = 10.dp
private val DarkBackground = Color(0xFF0A0A0A)
private val InactiveGray = Color(0xFF666666)
private val InactiveCircle = Color(0xFFE0E0E0)

@Composable
fun CustomTabBar(
    selected: MainTab,
    onTabSelected: (MainTab) -> Unit,
    modifier: Modifier = Modifier
) {
    val view = LocalView.current
    
    val centerButtonScale by animateFloatAsState(
        targetValue = if (selected == MainTab.QR) 1.07f else 1.0f,
        animationSpec = spring(
            dampingRatio = 0.9f,
            stiffness = Spring.StiffnessMedium
        ),
        label = "center_button_scale"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(BarHeight)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(BarHeight)
                .background(DarkBackground)
                .padding(top = 1.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight()
                    .background(DarkBackground)
            )
        }

        Box(
            modifier = Modifier
                .size(CenterCircle)
                .offset(y = -CenterOffset)
                .align(Alignment.TopCenter)
                .graphicsLayer {
                    scaleX = centerButtonScale
                    scaleY = centerButtonScale
                },
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape)
                    .background(if (selected == MainTab.QR) Color.White else InactiveCircle)
            )
            
            Icon(
                painter = painterResource(R.drawable.ic_qr_code),
                contentDescription = "QR Scanner",
                tint = Color.Black,
                modifier = Modifier.size(36.dp)
            )
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(BarHeight)
                .padding(horizontal = 0.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TabButton(MainTab.Shop, selected == MainTab.Shop, onTabSelected, view)
            TabButton(MainTab.Coaching, selected == MainTab.Coaching, onTabSelected, view)
            
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) {
                        view.performHapticFeedback(android.view.HapticFeedbackConstants.CONTEXT_CLICK)
                        onTabSelected(MainTab.QR)
                    }
            )
            
            TabButton(MainTab.Programs, selected == MainTab.Programs, onTabSelected, view)
            TabButton(MainTab.Events, selected == MainTab.Events, onTabSelected, view)
        }
    }
}


@Composable
private fun RowScope.TabButton(
    tab: MainTab,
    isSelected: Boolean,
    onTabSelected: (MainTab) -> Unit,
    view: android.view.View
) {
    val iconColor by animateColorAsState(
        targetValue = if (isSelected) Color.White else InactiveGray,
        animationSpec = spring(
            dampingRatio = 0.9f,
            stiffness = Spring.StiffnessMedium
        ),
        label = "icon_color"
    )
    
    val iconScale by animateFloatAsState(
        targetValue = if (isSelected) 1.15f else 1.0f,
        animationSpec = spring(
            dampingRatio = 0.9f,
            stiffness = Spring.StiffnessMedium
        ),
        label = "icon_scale"
    )
    
    Column(
        modifier = Modifier
            .weight(1f)
            .fillMaxHeight()
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) {
                view.performHapticFeedback(android.view.HapticFeedbackConstants.CLOCK_TICK)
                onTabSelected(tab)
            },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            painter = painterResource(tab.iconRes),
            contentDescription = tab.label,
            tint = iconColor,
            modifier = Modifier
                .size(24.dp)
                .graphicsLayer {
                    scaleX = iconScale
                    scaleY = iconScale
                }
        )
        Text(
            text = tab.label,
            color = iconColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1,
            modifier = Modifier.padding(top = 0.dp)
        )
    }
}

