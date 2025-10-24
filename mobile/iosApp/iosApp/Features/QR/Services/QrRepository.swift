import Foundation
import shared

final class QrRepository {
    private let api: ApiClient
    private let tokenStorage: IOSUserDefaultsTokenStorage
    private let maxRetries = 3
    private let retryDelay: TimeInterval = 1.0
    
    init(api: ApiClient = ApiClient(baseUrl: DefaultsBridge().baseUrl()),
         tokenStorage: IOSUserDefaultsTokenStorage = IOSUserDefaultsTokenStorage()) {
        self.api = api
        self.tokenStorage = tokenStorage
    }
    
    func issueQrCode(audience: String = "entrance_main", scope: String? = "entry") async throws -> QrPayload {
        guard let token = try await tokenStorage.getToken(), !token.isEmpty else {
            throw QrError.missingToken
        }
        
        return try await withRetry(maxAttempts: maxRetries) {
            do {
                let res = try await self.api.issueQrCode(bearerToken: token, audience: audience, scope: scope)
                return QrPayload(code: res.code, expiresAt: res.expiresAt, serverNow: res.serverNow, ttlSeconds: res.ttlSeconds)
            } catch let error as NSError {
                if let statusCode = error.userInfo["statusCode"] as? Int {
                    throw QrError.from(statusCode: statusCode, body: error.userInfo["body"] as? [String: Any])
                }
                throw QrError.networkError(error)
            }
        }
    }
    
    private func withRetry<T>(maxAttempts: Int, operation: @escaping () async throws -> T) async throws -> T {
        var lastError: Error?
        
        for attempt in 1...maxAttempts {
            do {
                return try await operation()
            } catch let error as QrError where !error.isRetryable {
                throw error
            } catch {
                lastError = error
                if attempt < maxAttempts {
                    try await Task.sleep(nanoseconds: UInt64(retryDelay * Double(attempt) * 1_000_000_000))
                }
            }
        }
        
        throw lastError ?? QrError.unknown("Retry failed")
    }
}