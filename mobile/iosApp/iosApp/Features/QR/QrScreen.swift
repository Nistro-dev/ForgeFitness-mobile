import SwiftUI

struct QrScreen: View {
    @StateObject private var vm = QrViewModelIOS.shared

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
                                        if let img = vm.image {
                                            Image(uiImage: img)
                                                .resizable()
                                                .interpolation(.none)
                                                .antialiased(false)
                                                .frame(width: qrSide, height: qrSide)
                                        } else {
                                            ProgressView().tint(.black)
                                        }
                                    }
                                    .padding(innerPadding)
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
    }
}
