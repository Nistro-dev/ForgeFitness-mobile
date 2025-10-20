import SwiftUI

struct ContentView: View {
    @StateObject var bridge = KMMBridge()

    var body: some View {
        VStack(spacing: 16) {
            Text("🏋️ ForgeFitness").font(.largeTitle)
            if let s = bridge.status {
                Text("✅ Backend : \(s)")
            } else if let e = bridge.error {
                Text("❌ Erreur : \(e)")	
            } else {
                ProgressView()
            }
        }
        .onAppear { bridge.loadHealth() }
        .padding()
    }
}
