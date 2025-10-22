import SwiftUI

@main
struct iosAppApp: App {
    @State private var showSplash = true
    @StateObject private var coordinator = AppCoordinator()

    init() { AppTheme.apply() }

    var body: some Scene {
        WindowGroup {
            ZStack {
                Group {
                    switch coordinator.route {
                    case .splash:
                        Color.white
                    case .activate:
                        ActivateView()
                            .environmentObject(coordinator)
                    case .main:
                        MainView()
                            .environmentObject(coordinator)
                    }
                }
                .opacity(showSplash ? 0 : 1)

                if showSplash {
                    SplashView {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            showSplash = false
                        }
                        coordinator.start()
                    }
                    .transition(.opacity)
                    .zIndex(1)
                }
            }
            .background(Color.white)
            .ignoresSafeArea()
            .preferredColorScheme(.light)
        }
    }
}
