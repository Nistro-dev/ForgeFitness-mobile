import SwiftUI

struct QrScreen: View {
    @StateObject private var vm = QrViewModel()
    
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            
            VStack(spacing: 12) {
                Spacer(minLength: 0)
                
                GeometryReader { geo in
                    let cardSide = min(geo.size.width, geo.size.height) * 0.985
                    let innerPadding: CGFloat = 6
                    let qrSide = max(1, cardSide - innerPadding * 2)
                    
                    VStack(spacing: 8) {
                        ZStack {
                            RoundedRectangle(cornerRadius: max(16, cardSide * 0.06), style: .continuous)
                                .fill(Color.white)
                                .frame(width: cardSide, height: cardSide)
                                .overlay(
                                    Group {
                                        if vm.isLoading && vm.image == nil {
                                            shimmerView(size: cardSide)
                                        } else if let img = vm.image {
                                            Image(uiImage: img)
                                                .resizable()
                                                .interpolation(.none)
                                                .antialiased(false)
                                                .frame(width: qrSide, height: qrSide)
                                                .transition(.opacity.combined(with: .scale(scale: 0.95)))
                                        } else if let error = vm.error {
                                            errorView(error: error, cardSide: cardSide)
                                        }
                                    }
                                    .padding(innerPadding)
                                    .animation(.easeInOut(duration: 0.3), value: vm.image)
                                    .animation(.easeInOut(duration: 0.3), value: vm.error)
                                )
                        }
                        
                        Text("Présentez le QR à la borne")
                            .foregroundColor(.white.opacity(0.9))
                            .font(.system(size: 14, weight: .regular))
                            .padding(.top, 2)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .onAppear {
                        vm.start()
                        vm.update(side: qrSide, logo: UIImage(named: "LOGO"))
                    }
                    .onChange(of: geo.size) { _ in
                        vm.update(side: qrSide, logo: UIImage(named: "LOGO"))
                    }
                }
                
                Spacer(minLength: 80)
            }
            .padding(.horizontal, 12)
        }
        .refreshable {
            await vm.refreshNow()
        }
    }
    
    @ViewBuilder
    private func shimmerView(size: CGFloat) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.15))
            
            shimmerEffect()
                .mask(
                    RoundedRectangle(cornerRadius: 12)
                )
        }
        .frame(width: size * 0.8, height: size * 0.8)
    }
    
    @ViewBuilder
    private func shimmerEffect() -> some View {
        GeometryReader { geo in
            LinearGradient(
                colors: [.clear, .white.opacity(0.3), .clear],
                startPoint: .leading,
                endPoint: .trailing
            )
            .offset(x: -geo.size.width)
            .animation(
                .linear(duration: 1.5).repeatForever(autoreverses: false),
                value: true
            )
        }
    }
    
    @ViewBuilder
    private func errorView(error: QrError, cardSide: CGFloat) -> some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 40))
                .foregroundColor(.red.opacity(0.8))
            
            Text(error.localizedDescription)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.black.opacity(0.7))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)
            
            if error.isRetryable {
                Button(action: { Task { await vm.refreshNow() } }) {
                    Text("Réessayer")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 10)
                        .background(Color.black)
                        .cornerRadius(8)
                }
                .padding(.top, 8)
            }
        }
        .frame(width: cardSide * 0.8, height: cardSide * 0.8)
    }
}