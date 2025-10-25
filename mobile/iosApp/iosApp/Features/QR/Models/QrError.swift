import Foundation

enum QrError: LocalizedError, Equatable {
    case networkError(String)
    case unauthorized
    case userInactive
    case invalidAudience
    case badRequest(String)
    case serverError
    case invalidResponse
    case missingToken
    case decodingFailed
    case unknown(String)
    
    var errorDescription: String? {
        switch self {
        case .networkError(let msg):
            return "Erreur réseau : \(msg)"
        case .unauthorized:
            return "Session expirée. Reconnectez-vous."
        case .userInactive:
            return "Votre compte est inactif"
        case .invalidAudience:
            return "Configuration invalide"
        case .badRequest(let msg):
            return msg
        case .serverError:
            return "Erreur serveur. Réessayez plus tard."
        case .invalidResponse:
            return "Réponse invalide du serveur"
        case .missingToken:
            return "Authentification requise"
        case .decodingFailed:
            return "Erreur de décodage"
        case .unknown(let msg):
            return msg
        }
    }
    
    var isRetryable: Bool {
        switch self {
        case .networkError, .serverError:
            return true
        default:
            return false
        }
    }
    
    static func from(statusCode: Int, body: [String: Any]?) -> QrError {
        let errorDict = body?["error"] as? [String: Any]
        let code = errorDict?["code"] as? String
        let message = errorDict?["message"] as? String ?? "Erreur inconnue"
        
        switch statusCode {
        case 401:
            return .unauthorized
        case 403:
            return code == "USER_INACTIVE" ? .userInactive : .badRequest(message)
        case 400:
            return .badRequest(message)
        case 500...599:
            return .serverError
        default:
            return .unknown(message)
        }
    }
    
    static func fromError(_ error: Error) -> QrError {
        return .networkError(error.localizedDescription)
    }
}
