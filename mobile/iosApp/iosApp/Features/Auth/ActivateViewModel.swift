import Foundation
import shared
import Combine

final class ActivateViewModel: ObservableObject {
    @Published var digits: [String] = Array(repeating: "", count: 6)
    @Published var loading = false
    @Published var error: String?
    @Published var done = false

    private let api = ApiClient(baseUrl: DefaultsBridge().baseUrl())
    private let tokenStorage = IOSUserDefaultsTokenStorage()
    private let deviceInfo = IOSDeviceInfoProvider().get()

    var code: String { digits.joined() }

    func onDigitChange(_ idx: Int, _ value: String) {
        let clean = value.uppercased().filter { $0.isLetter || $0.isNumber }
        let capped = String(clean.prefix(1))
        digits[idx] = capped
        error = nil
    }

    func activate() {
        let key = code.filter { $0.isLetter || $0.isNumber }
        guard key.count == 6 else {
            self.error = "Code invalide"
            return
        }
        loading = true
        error = nil

        Task {
            do {
                let req = ActivateRequest(key: key, device: deviceInfo)
                let res = try await api.activate(req: req)
                try await tokenStorage.saveToken(token: res.token)
                await MainActor.run {
                    self.loading = false
                    self.done = true
                }
            } catch let apiErr as ApiError {
                await MainActor.run {
                    self.loading = false
                    switch apiErr.code {
                    case "INVALID_KEY":      self.error = "Code invalide"
                    case "KEY_ALREADY_USED": self.error = "Ce code a déjà été utilisé"
                    case "USER_NOT_FOUND":   self.error = "Compte introuvable"
                    case "KEY_EXPIRED":      self.error = "Ce code a expiré"
                    default:                 self.error = "Erreur: \(apiErr.code)"
                    }
                }
            } catch {
                await MainActor.run {
                    self.loading = false
                    self.error = "Échec de l'activation"
                }
            }
        }
    }
}
