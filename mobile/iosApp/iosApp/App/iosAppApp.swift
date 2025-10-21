import SwiftUI

@main
struct iosAppApp: App {
    @State private var showSplash = true

    var body: some Scene {
        WindowGroup {
            ZStack {
                ContentView()
                    .opacity(showSplash ? 0 : 1)
                if showSplash {
                    SplashView {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            showSplash = false
                        }
                    }
                    .transition(.opacity)
                }
            }
            .background(Color.white)
            .ignoresSafeArea()
        }
    }
}
