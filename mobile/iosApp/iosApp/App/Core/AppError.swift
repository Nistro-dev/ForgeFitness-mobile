import Foundation

enum AppError: LocalizedError, Equatable {
    case auth(AuthError)
    
    case qr(QrError)
    
    case networkError(String)
    case noConnection
    
    case unauthorized(String?)
    case forbidden(String?)
    case notFound(String?)
    case conflict(String?)
    case badRequest(String?)
    case serverError(String?)
    case validationFailed([String])
    
    case unknown(String)
    
    var errorDescription: String? {
        switch self {
        case .auth(let authError):
            return authError.localizedDescription
        case .qr(let qrError):
            return qrError.localizedDescription
        case .networkError(let msg):
            return "Erreur réseau : \(msg)"
        case .noConnection:
            return "Aucune connexion internet"
        case .unauthorized(let msg):
            return msg ?? "Session expirée. Reconnectez-vous."
        case .forbidden(let msg):
            return msg ?? "Accès refusé"
        case .notFound(let msg):
            return msg ?? "Ressource non trouvée"
        case .conflict(let msg):
            return msg ?? "Conflit détecté"
        case .badRequest(let msg):
            return msg ?? "Requête invalide"
        case .serverError(let msg):
            return msg ?? "Erreur serveur. Réessayez plus tard."
        case .validationFailed(let issues):
            return "Validation échouée : \(issues.joined(separator: ", "))"
        case .unknown(let msg):
            return msg
        }
    }
    
    var isRetryable: Bool {
        switch self {
        case .networkError, .noConnection, .serverError:
            return true
        case .qr(let qrError):
            return qrError.isRetryable
        default:
            return false
        }
    }
    
    var shouldLogout: Bool {
        switch self {
        case .unauthorized:
            return true
        default:
            return false
        }
    }
    
    static func from(statusCode: Int, body: [String: Any]?) -> AppError {
        let errorDict = body?["error"] as? [String: Any]
        let code = errorDict?["code"] as? String
        let message = errorDict?["message"] as? String
        let details = errorDict?["detail"]
        
        if code == "BAD_REQUEST", let issues = details as? [[String: Any]] {
            let messages = issues.compactMap { $0["message"] as? String }
            if !messages.isEmpty {
                return .validationFailed(messages)
            }
        }
        
        if code == "USER_INACTIVE" {
            return .qr(.userInactive)
        }
        
        switch statusCode {
        case 400:
            if let code = code {
                if let authError = AuthError.from(code: code, message: message) {
                    return .auth(authError)
                }
            }
            return .badRequest(message ?? "Requête invalide")
            
        case 401:
            if code == "UNAUTHORIZED_DEVICE" {
                return .unauthorized("Appareil non autorisé")
            }
            return .unauthorized(message)
            
        case 403:
            return .forbidden(message)
            
        case 404:
            return .notFound(message)
            
        case 409:
            return .conflict(message)
            
        case 500...599:
            return .serverError(message)
            
        default:
            return .unknown(message ?? "Erreur inconnue")
        }
    }
    
    static func fromError(_ error: Error) -> AppError {
        if let appError = error as? AppError {
            return appError
        }
        
        let nsError = error as NSError
        
        if nsError.domain == NSURLErrorDomain {
            switch nsError.code {
            case NSURLErrorNotConnectedToInternet,
                 NSURLErrorNetworkConnectionLost:
                return .noConnection
            case NSURLErrorTimedOut:
                return .networkError("Délai d'attente dépassé")
            case NSURLErrorCannotConnectToHost:
                return .networkError("Impossible de se connecter au serveur")
            default:
                return .networkError(error.localizedDescription)
            }
        }
        
        return .networkError(error.localizedDescription)
    }
}
