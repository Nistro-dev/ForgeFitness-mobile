import Foundation

enum Environment {
    case dev
    case staging
    case prod
    
    static var current: Environment {
        #if DEBUG
        return .dev
        #else
        return .prod
        #endif
    }
    
    var baseURL: String {
        switch self {
        case .dev:
            return "http://127.0.0.1:3001"
        case .staging:
            return "https://staging-api.forgefitness.fr"
        case .prod:
            return "https://api.forgefitness.fr"
        }
    }
    
    var displayName: String {
        switch self {
        case .dev: return "Development"
        case .staging: return "Staging"
        case .prod: return "Production"
        }
    }
}