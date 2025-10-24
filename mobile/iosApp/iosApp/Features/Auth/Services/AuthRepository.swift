import Foundation
import shared

enum ActivationError: LocalizedError, Equatable {
    case invalidKey
    case keyAlreadyUsed
    case userNotFound
    case keyExpired
    case networkError(String)
    case unknown(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidKey:
            return "Code invalide"
        case .keyAlreadyUsed:
            return "Ce code a déjà été utilisé"
        case .userNotFound:
            return "Compte introuvable"
        case .keyExpired:
            return "Ce code a expiré"
        case .networkError(let msg):
            return "Erreur réseau : \(msg)"
        case .unknown(let msg):
            return msg
        }
    }
    
    static func from(_ apiError: ApiError) -> ActivationError {
        switch apiError.code {
        case "INVALID_KEY":
            return .invalidKey
        case "KEY_ALREADY_USED":
            return .keyAlreadyUsed
        case "USER_NOT_FOUND":
            return .userNotFound
        case "KEY_EXPIRED":
            return .keyExpired
        default:
            return .unknown("Erreur: \(apiError.code)")
        }
    }
}

final class AuthRepository {
    private let api: ApiClient
    private let tokenStorage: IOSUserDefaultsTokenStorage
    private let deviceInfo: DeviceInfo
    
    init(
        api: ApiClient = ApiClient(baseUrl: Environment.current.baseURL),
        tokenStorage: IOSUserDefaultsTokenStorage = IOSUserDefaultsTokenStorage(),
        deviceInfo: DeviceInfo = IOSDeviceInfoProvider().get()
    ) {
        self.api = api
        self.tokenStorage = tokenStorage
        self.deviceInfo = deviceInfo
    }
    
    func activate(key: String) async throws -> String {
        guard key.count == 6 else {
            throw ActivationError.invalidKey
        }
        
        do {
            let req = ActivateRequest(key: key, device: deviceInfo)
            let res = try await api.activate(req: req)
            try await tokenStorage.saveToken(token: res.token)
            return res.token
        } catch let apiError as ApiError {
            throw ActivationError.from(apiError)
        } catch {
            throw ActivationError.networkError(error.localizedDescription)
        }
    }
    
    func logout() async throws {
        try await tokenStorage.saveToken(token: "")
    }
    
    func hasValidToken() async -> Bool {
        guard let token = try? await tokenStorage.getToken() else {
            return false
        }
        return !token.isEmpty
    }
}
