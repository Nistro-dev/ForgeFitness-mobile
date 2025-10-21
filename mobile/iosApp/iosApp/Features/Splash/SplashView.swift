import SwiftUI

struct SplashView: View {
    let onFinished: () -> Void
    private let scaleFactor: CGFloat = 2
    private let fadeInDur: Double = 0.45
    private let holdAfter: Double = 0.25
    private let fadeOutDur: Double = 0.55
    private let popScaleIn: CGFloat = 1.05
    private let popScaleOut: CGFloat = 0.93
    @State private var opacity: CGFloat = 0
    @State private var scale: CGFloat = 0.94

    var body: some View {
        GeometryReader { geo in
            let side = min(geo.size.width, geo.size.height) * 0.9 * scaleFactor

            ZStack {
                Color.white.ignoresSafeArea()

                LottieView(name: "splash_logo", loop: .playOnce) {
                    DispatchQueue.main.asyncAfter(deadline: .now() + holdAfter) {
                        withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                            scale = popScaleOut
                        }
                        withAnimation(.easeInOut(duration: fadeOutDur).delay(0.05)) {
                            opacity = 0
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + fadeOutDur) {
                            onFinished()
                        }
                    }
                }
                .frame(width: side, height: side)
                .clipped()
                .scaleEffect(scale)
                .opacity(opacity)
                .position(x: geo.size.width / 2, y: geo.size.height / 2)
                .onAppear {
                    withAnimation(.easeOut(duration: fadeInDur)) {
                        opacity = 1
                        scale = popScaleIn
                    }
                    withAnimation(.spring(response: 0.6, dampingFraction: 0.85, blendDuration: 0)
                        .delay(fadeInDur * 0.6)) {
                        scale = 1.0
                    }
                }
            }
        }
    }
}
