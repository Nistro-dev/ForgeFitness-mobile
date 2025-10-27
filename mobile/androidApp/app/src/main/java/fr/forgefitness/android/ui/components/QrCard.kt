package fr.forgefitness.android.ui.components

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import androidx.annotation.DrawableRes
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.Canvas as ComposeCanvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTag
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import fr.forgefitness.android.R
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlin.math.roundToInt
import android.graphics.Color as AColor

@Composable
fun QrCard(
    code: String,
    squareSize: Dp = 340.dp,
    cornerRadius: Dp = 28.dp,
    @DrawableRes logoRes: Int = R.drawable.forgefitness_logo,
    logoScale: Float = 0.30f,
    marginModules: Float = 5f,
    shadowIntensity: Float = 1.0f
) {
    Box(
        modifier = Modifier.size(squareSize),
        contentAlignment = Alignment.Center
    ) {
        ComposeCanvas(modifier = Modifier.size(squareSize)) {
            val cornerPx = cornerRadius.toPx()
            val shadowRadius = 40f * shadowIntensity
            val shadowLayers = 25

            for (i in 0..shadowLayers) {
                val spreadOffset = (shadowRadius / shadowLayers) * i
                val alpha = ((0.12f / shadowLayers) * (shadowLayers - i)) * shadowIntensity

                drawRoundRect(
                    color = Color.Black.copy(alpha = alpha.coerceAtMost(0.5f)),
                    topLeft = Offset(-spreadOffset / 2f, -spreadOffset / 2f),
                    size = Size(size.width + spreadOffset, size.height + spreadOffset),
                    cornerRadius = CornerRadius(cornerPx + spreadOffset / 2f)
                )
            }
        }

        BoxWithConstraints(
            modifier = Modifier
                .size(squareSize)
                .clip(RoundedCornerShape(cornerRadius))
                .background(Color.White)
        ) {
            val density = LocalDensity.current
            val cardWidth = maxWidth
            val px = with(density) { cardWidth.toPx().roundToInt() }

            val qrBitmap = produceState<Bitmap?>(
                initialValue = null,
                code,
                px,
                logoScale,
                marginModules
            ) {
                value = withContext(Dispatchers.Default) {
                    generateQrBitmap(
                        data = code,
                        sizePx = px,
                        logoRelativeSize = logoScale,
                        marginModules = marginModules
                    )
                }
            }.value

            Crossfade(
                targetState = code,
                label = "qrCrossfade"
            ) { _ ->
                if (qrBitmap != null) {
                    val logoSize = cardWidth * logoScale

                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Image(
                            bitmap = qrBitmap.asImageBitmap(),
                            contentDescription = "QR",
                            contentScale = ContentScale.FillBounds,
                            filterQuality = FilterQuality.None,
                            modifier = Modifier
                                .fillMaxSize()
                                .semantics { testTag = code }
                        )

                        Box(
                            modifier = Modifier
                                .size(logoSize * 1.30f)
                                .background(Color.White)
                                .border(2.dp, Color.Black),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = logoRes),
                                contentDescription = "Logo",
                                contentScale = ContentScale.Fit,
                                modifier = Modifier.size(logoSize)
                            )
                        }
                    }
                } else {
                    ComposeCanvas(modifier = Modifier.fillMaxSize()) {
                        val w = size.width
                        val h = size.height

                        val pad = w * (marginModules / 100f)
                        val corner = w * 0.06f

                        drawRoundRect(
                            color = Color.White,
                            topLeft = Offset.Zero,
                            size = Size(w, h),
                            cornerRadius = CornerRadius(corner, corner)
                        )

                        fun finder(x: Float, y: Float) {
                            val s = w * 0.2f
                            drawRoundRect(
                                Color(0xFFEDEDED),
                                Offset(x, y),
                                Size(s, s),
                                CornerRadius(s * 0.18f, s * 0.18f)
                            )
                            drawRoundRect(
                                Color.White,
                                Offset(x + s * 0.12f, y + s * 0.12f),
                                Size(s * 0.76f, s * 0.76f),
                                CornerRadius(s * 0.12f, s * 0.12f)
                            )
                            drawRoundRect(
                                Color(0xFFEDEDED),
                                Offset(x + s * 0.26f, y + s * 0.26f),
                                Size(s * 0.48f, s * 0.48f),
                                CornerRadius(s * 0.08f, s * 0.08f)
                            )
                        }
                        finder(pad, pad)
                        finder(w - pad - w * 0.2f, pad)
                        finder(pad, h - pad - w * 0.2f)

                        val cw = w * 0.26f
                        val ch = w * 0.09f
                        drawRoundRect(
                            color = Color(0xFFEDEDED),
                            topLeft = Offset((w - cw) / 2f, (h - ch) / 2f),
                            size = Size(cw, ch),
                            cornerRadius = CornerRadius(ch / 2, ch / 2)
                        )
                    }
                }
            }
        }
    }
}

private fun generateQrBitmap(
    data: String,
    sizePx: Int,
    logoRelativeSize: Float,
    marginModules: Float
): Bitmap {
    val hints = hashMapOf<EncodeHintType, Any>(
        EncodeHintType.ERROR_CORRECTION to ErrorCorrectionLevel.H,
        EncodeHintType.MARGIN to 0,
        EncodeHintType.CHARACTER_SET to "ISO-8859-1"
    )

    val tempMatrix = QRCodeWriter().encode(data, BarcodeFormat.QR_CODE, 100, 100, hints)
    val qrModulesCount = tempMatrix.width
    val totalModules = qrModulesCount + marginModules * 2
    val moduleSize = (sizePx / totalModules).toInt().coerceAtLeast(1)

    val bmp = Bitmap.createBitmap(sizePx, sizePx, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bmp)
    canvas.drawColor(AColor.WHITE)

    val paint = Paint().apply {
        color = AColor.BLACK
        style = Paint.Style.FILL
        isAntiAlias = false
    }

    val logoModules = (qrModulesCount * logoRelativeSize).toInt()
    val safePad = (logoModules * 0.75f).toInt()
    val center = qrModulesCount / 2

    fun isInLogoSafeZone(x: Int, y: Int): Boolean {
        return x in (center - safePad)..(center + safePad) &&
                y in (center - safePad)..(center + safePad)
    }

    val qrPixelSize = qrModulesCount * moduleSize
    val offsetX = (sizePx - qrPixelSize) / 2f
    val offsetY = (sizePx - qrPixelSize) / 2f

    for (y in 0 until qrModulesCount) {
        for (x in 0 until qrModulesCount) {
            if (!tempMatrix.get(x, y) || isInLogoSafeZone(x, y)) continue

            val left = offsetX + x * moduleSize
            val top = offsetY + y * moduleSize
            canvas.drawRect(left, top, left + moduleSize, top + moduleSize, paint)
        }
    }

    return bmp
}