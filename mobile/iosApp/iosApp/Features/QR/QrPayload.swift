import Foundation

struct QrPayload: Sendable {
    let code: String
    let expiresAt: String
    let serverNow: String
    let ttlSeconds: Int32
}

extension QrPayload {
    var expiresDate: Date? { ISO8601DateFormatter().date(from: expiresAt) }
    var serverNowDate: Date? { ISO8601DateFormatter().date(from: serverNow) }
}
