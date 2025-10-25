import Foundation
import shared

final class QrRepository {
    private let api: ApiClient
    private let tokenStorage: IOSUserDefaultsTokenStorage
    
    init(api: ApiClient = ApiClient(baseUrl: Environment.current.baseURL),
         tokenStorage: IOSUserDefaultsTokenStorage = IOSUserDefaultsTokenStorage()) {
        self.api = api
        self.tokenStorage = tokenStorage
    }
    
    func issueQrCode(audience: String = "entrance_main", scope: String? = "entry") async throws -> QrPayload {
        guard let token = try await tokenStorage.getToken(), !token.isEmpty else {
            throw AppError.qr(.missingToken)
        }
        
        do {
            let res = try await self.api.issueQrCode(bearerToken: token, audience: audience, scope: scope)
            return QrPayload(
                code: res.code,
                expiresAt: res.expiresAt,
                serverNow: res.serverNow,
                ttlSeconds: res.ttlSeconds,
                userStatus: res.userStatus
            )
        } catch let error as NSError {
            if error.domain == "KotlinException" {
                if let apiError = error.userInfo["KotlinException"] as? ApiError {
                    if apiError.code == "USER_INACTIVE" {
                        throw AppError.qr(.userInactive)
                    }
                    
                    if apiError.httpStatus == 401 {
                        throw AppError.qr(.unauthorized)
                    }
                    
                    if apiError.httpStatus >= 500 {
                        throw AppError.qr(.serverError)
                    }
                    
                    throw AppError.qr(.badRequest(apiError.message))
                }
            }
            
            throw AppError.fromError(error)
        }
    }
}
