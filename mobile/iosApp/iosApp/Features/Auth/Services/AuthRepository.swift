import Foundation
import shared

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
            throw AppError.auth(.invalidKey)
        }
        
        do {
            let req = ActivateRequest(key: key, device: deviceInfo)
            let res = try await api.activate(req: req)
            try await tokenStorage.saveToken(token: res.token)
            return res.token
        } catch {
            let nsError = error as NSError
            
            if nsError.domain == "KotlinException",
               let apiError = nsError.userInfo["KotlinException"] as? ApiError {
                
                if let authError = AuthError.from(code: apiError.code, message: apiError.message) {
                    throw AppError.auth(authError)
                }
                
                switch apiError.code {
                case "BAD_REQUEST":
                    throw AppError.badRequest(apiError.message)
                case "UNAUTHORIZED":
                    throw AppError.unauthorized(apiError.message)
                case "FORBIDDEN":
                    throw AppError.forbidden(apiError.message)
                case "NOT_FOUND":
                    throw AppError.notFound(apiError.message)
                default:
                    throw AppError.unknown(apiError.message)
                }
            }
            
            throw AppError.fromError(error)
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
