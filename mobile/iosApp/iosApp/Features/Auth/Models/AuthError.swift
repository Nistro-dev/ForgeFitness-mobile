import Foundation

enum AuthError: LocalizedError, Equatable {
    case invalidKey
    case keyAlreadyUsed
    case userNotFound
    case keyExpired
    case invalidDevice
    case missingToken
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
        case .invalidDevice:
            return "Appareil non autorisé"
        case .missingToken:
            return "Authentification requise"
        case .networkError(let msg):
            return "Erreur réseau : \(msg)"
        case .unknown(let msg):
            return msg
        }
    }
    
    static func from(code: String, message: String?) -> AuthError? {
        switch code {
        case "INVALID_KEY":
            return .invalidKey
        case "KEY_ALREADY_USED":
            return .keyAlreadyUsed
        case "USER_NOT_FOUND":
            return .userNotFound
        case "KEY_EXPIRED":
            return .keyExpired
        case "UNAUTHORIZED_DEVICE":
            return .invalidDevice
        default:
            return nil
        }
    }
}