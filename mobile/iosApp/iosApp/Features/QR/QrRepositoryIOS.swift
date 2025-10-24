import Foundation
import shared

final class QrRepositoryIOS {
    private let api = ApiClient(baseUrl: DefaultsBridge().baseUrl())
    private let tokenStorage = IOSUserDefaultsTokenStorage()

    func issueQrCode(audience: String = "entrance_main", scope: String? = "entry") async throws -> QrPayload {
        guard let token = try await tokenStorage.getToken(), !token.isEmpty else {
            throw NSError(domain: "QR", code: 401, userInfo: [NSLocalizedDescriptionKey: "Missing token"])
        }
        let res = try await api.issueQrCode(bearerToken: token, audience: audience, scope: scope)
        return QrPayload(code: res.code, expiresAt: res.expiresAt, serverNow: res.serverNow, ttlSeconds: res.ttlSeconds)
    }
}
