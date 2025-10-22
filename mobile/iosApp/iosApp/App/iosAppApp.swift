import SwiftUI

@main
struct iosAppApp: App {
    @State private var showSplash = true
    @StateObject private var coordinator = AppCoordinator()

    init() { AppTheme.apply() }

    var body: some Scene {
        WindowGroup {
            ZStack {
                // Contenu piloté par le coordinator
                Group {
                    switch coordinator.route {
                    case .splash:
                        // on ne l’affiche pas ici, le vrai splash est en overlay (juste pour sécurité)
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

                // Splash en overlay pour l’anim
                if showSplash {
                    SplashView {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            showSplash = false
                        }
                        coordinator.start()   // décide: .activate ou .main
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
