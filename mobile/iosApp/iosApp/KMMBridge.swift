import Foundation
import shared

@MainActor
final class KMMBridge: ObservableObject {
    @Published var status: String?
    @Published var error: String?

    private let client = ApiClient(baseUrl: "http://127.0.0.1:3001")

    func loadHealth() {
        Task {
            do {
                let health = try await client.healthCheckOrNull()
                if let h = health {
                    self.status = h.status
                } else {
                    self.error = "Erreur de connexion"
                }
            } catch {
                self.error = error.localizedDescription
            }
        }
    }
}
