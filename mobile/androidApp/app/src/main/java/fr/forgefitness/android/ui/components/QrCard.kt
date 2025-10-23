package fr.forgefitness.android.ui.components

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
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
import kotlin.math.min
import kotlin.math.roundToInt
import android.graphics.Color as AColor

enum class QrStyle { Classic, Rounded, Dots }

@Composable
fun QrCard(
    code: String,
    squareSize: Dp = 340.dp,
    cornerRadius: Dp = 28.dp,
    qrStyle: QrStyle = QrStyle.Classic,
    @DrawableRes logoRes: Int = R.drawable.forgefitness_logo,
    logoScale: Float = 0.30f,
    marginModules: Int = 4,
) {
    BoxWithConstraints(
        modifier = Modifier
            .size(squareSize)
            .clip(RoundedCornerShape(cornerRadius))
            .background(Color.White)
    ) {
        val density = LocalDensity.current
        val cardWidth = maxWidth
        val px = with(density) { cardWidth.toPx().roundToInt() }

        val qrBitmap = produceState<Bitmap?>(initialValue = null, code, px, qrStyle, logoScale, marginModules) {
            value = withContext(Dispatchers.Default) {
                generateStyledQrBitmap(
                    data = code,
                    sizePx = px,
                    qrStyle = qrStyle,
                    moduleColor = AColor.BLACK,
                    bgColor = AColor.WHITE,
                    ecl = ErrorCorrectionLevel.H,
                    marginModules = marginModules,
                    logoRelativeSize = logoScale,
                )
            }
        }.value

        Crossfade(
            targetState = code,
            label = "qrCrossfade"
        ) { _ ->
            if (qrBitmap != null) {
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

                    val logoPx = (px * logoScale).roundToInt()
                    val maskCornerPx = with(density) { 12.dp.toPx() }

                    ComposeCanvas(modifier = Modifier.fillMaxSize()) {
                        val cx = size.width / 2f
                        val cy = size.height / 2f
                        val rOuter = logoPx / 2f + 10f

                        drawRoundRect(
                            color = Color.Black,
                            topLeft = Offset(cx - rOuter, cy - rOuter),
                            size = Size(rOuter * 2f, rOuter * 2f),
                            cornerRadius = CornerRadius(maskCornerPx, maskCornerPx),
                            style = Stroke(width = 3f)
                        )
                        drawRoundRect(
                            color = Color.White,
                            topLeft = Offset(cx - logoPx / 2f, cy - logoPx / 2f),
                            size = Size(logoPx.toFloat(), logoPx.toFloat()),
                            cornerRadius = CornerRadius(maskCornerPx, maskCornerPx)
                        )
                    }

                    Image(
                        painter = painterResource(id = logoRes),
                        contentDescription = "Logo",
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.size(cardWidth * logoScale)
                    )
                }
            } else {
                ComposeCanvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height
                    val pad = w * 0.08f
                    val corner = w * 0.06f

                    drawRoundRect(
                        color = Color.White,
                        topLeft = Offset.Zero,
                        size = Size(w, h),
                        cornerRadius = CornerRadius(corner, corner)
                    )
                    fun finder(x: Float, y: Float) {
                        val s = w * 0.2f
                        drawRoundRect(Color(0xFFEDEDED), Offset(x, y), Size(s, s), CornerRadius(s*0.18f, s*0.18f))
                        drawRoundRect(Color.White, Offset(x + s*0.12f, y + s*0.12f), Size(s*0.76f, s*0.76f), CornerRadius(s*0.12f, s*0.12f))
                        drawRoundRect(Color(0xFFEDEDED), Offset(x + s*0.26f, y + s*0.26f), Size(s*0.48f, s*0.48f), CornerRadius(s*0.08f, s*0.08f))
                    }
                    finder(pad, pad)
                    finder(w - pad - w*0.2f, pad)
                    finder(pad, h - pad - w*0.2f)

                    val cw = w * 0.26f
                    val ch = w * 0.09f
                    drawRoundRect(
                        color = Color(0xFFEDEDED),
                        topLeft = Offset((w - cw) / 2f, (h - ch) / 2f),
                        size = Size(cw, ch),
                        cornerRadius = CornerRadius(ch/2, ch/2)
                    )
                }
            }
        }
    }
}


private data class MatrixData(
    val width: Int,
    val height: Int,
    val bits: (x: Int, y: Int) -> Boolean
)

private fun generateStyledQrBitmap(
    data: String,
    sizePx: Int,
    qrStyle: QrStyle,
    moduleColor: Int,
    bgColor: Int,
    ecl: ErrorCorrectionLevel,
    marginModules: Int,
    logoRelativeSize: Float
): Bitmap {
    val hints = hashMapOf<EncodeHintType, Any>(
        EncodeHintType.ERROR_CORRECTION to ecl,
        EncodeHintType.MARGIN to marginModules,
        EncodeHintType.CHARACTER_SET to "ISO-8859-1"
    )

    val matrix = QRCodeWriter().encode(data, BarcodeFormat.QR_CODE, sizePx, sizePx, hints)
    val md = MatrixData(matrix.width, matrix.height) { x, y -> matrix.get(x, y) }

    val bmp = Bitmap.createBitmap(md.width, md.height, Bitmap.Config.ARGB_8888)
    val c = Canvas(bmp)
    c.drawColor(bgColor)

    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = moduleColor
        style = Paint.Style.FILL
        isFilterBitmap = false
        isDither = false
    }

    val moduleSize = 1f

    val logoModules = (min(md.width, md.height) * logoRelativeSize).toInt()
    val safePad = (logoModules * 0.58f).toInt()
    val safeLeft = md.width / 2 - safePad
    val safeTop  = md.height / 2 - safePad
    val safeRight = md.width / 2 + safePad
    val safeBottom = md.height / 2 + safePad
    fun isInLogoSafeZone(x: Int, y: Int) =
        x in safeLeft..safeRight && y in safeTop..safeBottom

    for (y in 0 until md.height) for (x in 0 until md.width) {
        if (!md.bits(x, y)) continue
        if (isInLogoSafeZone(x, y)) continue
        c.drawRect(
            x * moduleSize, y * moduleSize,
            (x + 1) * moduleSize, (y + 1) * moduleSize, paint
        )
    }

    return bmp
}