import SwiftUI

struct CustomTabBar: View {
    @Binding var selected: MainTab

    private let barHeight: CGFloat = 70
    private let centerCircle: CGFloat = 70
    private let centerOffset: CGFloat = 25

    var body: some View {
        ZStack {
            Rectangle()
                .fill(Color(red: 0.04, green: 0.04, blue: 0.04))
                .frame(height: barHeight)

            ZStack {
                Circle()
                    .fill(selected == .qr ? Color.white : Color(red: 224/255, green: 224/255, blue: 224/255))
                
                Image("qrcode-lucide")
                    .renderingMode(.template)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 36, height: 36)
                    .foregroundColor(.black)
            }
            .frame(width: centerCircle, height: centerCircle)
            .scaleEffect(selected == .qr ? 1.07 : 1.0)
            .animation(.spring(response: 0.28, dampingFraction: 0.9), value: selected)
            .offset(y: -centerOffset)
            .allowsHitTesting(false)

            HStack(spacing: 0) {
                tabButton(.shop)
                tabButton(.coaching)

                Button {
                    let impact = UIImpactFeedbackGenerator(style: .heavy)
                    impact.impactOccurred()
                    withAnimation(.spring(response: 0.28, dampingFraction: 0.9)) {
                        selected = .qr
                    }
                } label: {
                    Color.clear
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)

                tabButton(.programs)
                tabButton(.events)
            }
            .frame(height: barHeight)
            .padding(.horizontal, 0)
            .padding(.vertical, 16)
        }
        .frame(maxWidth: .infinity)
        .background(
            Color(red: 0.04, green: 0.04, blue: 0.04)
                .ignoresSafeArea(edges: .bottom)
        )
    }

    @ViewBuilder
    private func tabButton(_ tab: MainTab) -> some View {
        let isSelected = selected == tab
        Button {
            let impact = UIImpactFeedbackGenerator(style: .medium)
            impact.impactOccurred()
            withAnimation(.spring(response: 0.28, dampingFraction: 0.9)) {
                selected = tab
            }
        } label: {
            VStack(spacing: 4) {
                Image(tab.imageName)
                    .renderingMode(.template)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 24, height: 24)
                    .foregroundColor(isSelected ? .white : Color(red: 0.4, green: 0.4, blue: 0.4))
                    .scaleEffect(isSelected ? 1.15 : 1.0)
                    .animation(.spring(response: 0.28, dampingFraction: 0.9), value: isSelected)
                
                Text(tab.label)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(isSelected ? .white : Color(red: 0.4, green: 0.4, blue: 0.4))
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
