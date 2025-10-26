import SwiftUI

struct QrScreen: View {
    @ObservedObject var viewModel: QrViewModel
    @Binding var hasStarted: Bool
    @State private var isBlinking = false
    
    var body: some View {
        ZStack {
            GeometryReader { geometry in
                Image("background_qr")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: geometry.size.width, height: geometry.size.height)
                    .clipped()
            }
            .ignoresSafeArea()
            contentView
        }
        .refreshable {
            await viewModel.refreshNow()
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true)) {
                isBlinking = true
            }
        }
    }
    
    private var contentView: some View {
        VStack(spacing: 12) {
            Spacer(minLength: 0)
            qrCardContainer
            Spacer(minLength: 80)
        }
        .padding(.horizontal, 12)
    }
    
    private var qrCardContainer: some View {
        GeometryReader { geo in
            let cardSide = min(geo.size.width, geo.size.height) * 0.985
            let innerPadding: CGFloat = 8
            let qrSide = max(1, cardSide - innerPadding * 5)
            qrCard(cardSide: cardSide, qrSide: qrSide, innerPadding: innerPadding)
                .onAppear {
                    if !hasStarted {
                        hasStarted = true
                        viewModel.start()
                    }
                    viewModel.update(side: qrSide, logo: UIImage(named: "LOGO"))
                }
                .onChange(of: geo.size) {
                    viewModel.update(side: qrSide, logo: UIImage(named: "LOGO"))
                }
        }
    }
    
    private func qrCard(cardSide: CGFloat, qrSide: CGFloat, innerPadding: CGFloat) -> some View {
        VStack(spacing: 8) {
            statusBadge
            qrCardBackground(cardSide: cardSide, qrSide: qrSide, innerPadding: innerPadding)
            if viewModel.userStatus == "ACTIVE" {
                qrLabel
            } else {
                inactiveLabel
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    private var statusBadge: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(viewModel.userStatus == "ACTIVE" ? Color.green : Color.red)
                .frame(width: 8, height: 8)
                .opacity(isBlinking ? 0.3 : 1.0)
            
            Text(viewModel.userStatus == "ACTIVE" ? "Actif" : "Inactif")
                .foregroundColor(viewModel.userStatus == "ACTIVE" ? Color.green : Color.red)
                .font(.system(size: 14, weight: .medium))
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(Color.black.opacity(0.6))
        .cornerRadius(16)
    }
    
    private func qrCardBackground(cardSide: CGFloat, qrSide: CGFloat, innerPadding: CGFloat) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: max(16, cardSide * 0.06), style: .continuous)
                .fill(Color.clear)
                .frame(width: cardSide, height: cardSide)
                .overlay(
                    qrCardContent(cardSide: cardSide, qrSide: qrSide)
                        .padding(innerPadding)
                )
        }
    }
    
    @ViewBuilder
    private func qrCardContent(cardSide: CGFloat, qrSide: CGFloat) -> some View {
        if viewModel.isLoading && viewModel.image == nil {
            shimmerView(size: cardSide)
        } else if let img = viewModel.image {
            qrImageView(image: img, qrSide: qrSide)
        } else if let error = viewModel.error {
            errorView(error: error, cardSide: cardSide)
        }
    }
    
    private func qrImageView(image: UIImage, qrSide: CGFloat) -> some View {
        Image(uiImage: image)
            .resizable()
            .interpolation(.none)
            .antialiased(false)
            .frame(width: qrSide, height: qrSide)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .shadow(color: Color.black.opacity(0.35), radius: 75, x: 0, y: 25)
            .shadow(color: Color.black.opacity(0.25), radius: 140, x: 0, y: 70)
            .shadow(color: Color.black.opacity(0.22), radius: 50, x: 0, y: 50)
            .transition(.opacity.combined(with: .scale(scale: 0.95)))
            .animation(.easeInOut(duration: 0.3), value: viewModel.image)
    }
    
    private var qrLabel: some View {
        Text("Présentez le QR à la borne")
            .foregroundColor(.white.opacity(0.9))
            .font(.system(size: 14, weight: .regular))
            .padding(.top, 2)
    }
    
    private var inactiveLabel: some View {
        Text("Rendez-vous à l'accueil")
            .foregroundColor(.white.opacity(0.9))
            .font(.system(size: 14, weight: .regular))
            .padding(.top, 2)
    }
    
    private func shimmerView(size: CGFloat) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.15))
            shimmerEffect
                .mask(RoundedRectangle(cornerRadius: 12))
        }
        .frame(width: size * 0.8, height: size * 0.8)
    }
    
    private var shimmerEffect: some View {
        GeometryReader { geo in
            LinearGradient(
                colors: [.clear, .white.opacity(0.3), .clear],
                startPoint: .leading,
                endPoint: .trailing
            )
            .offset(x: -geo.size.width)
            .animation(.linear(duration: 1.5).repeatForever(autoreverses: false), value: true)
        }
    }
    
    private func errorView(error: AppError, cardSide: CGFloat) -> some View {
        VStack(spacing: 12) {
            errorIcon
            errorMessage(error: error)
            if error.isRetryable {
                retryButton
            }
        }
        .frame(width: cardSide * 0.8, height: cardSide * 0.8)
        .animation(.easeInOut(duration: 0.3), value: viewModel.error)
    }
    
    private var errorIcon: some View {
        Image(systemName: "exclamationmark.triangle.fill")
            .font(.system(size: 40))
            .foregroundColor(.red.opacity(0.8))
    }
    
    private func errorMessage(error: AppError) -> some View {
        Text(error.localizedDescription)
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.black.opacity(0.7))
            .multilineTextAlignment(.center)
            .padding(.horizontal, 20)
    }
    
    private var retryButton: some View {
        Button(action: { Task { await viewModel.refreshNow() } }) {
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
