import Foundation

struct QrPayload: Sendable {
    let code: String
    let expiresAt: String
    let serverNow: String
    let ttlSeconds: Int32
    let userStatus: String
}

extension QrPayload {
    var expiresDate: Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: expiresAt)
    }
    
    var serverNowDate: Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter.date(from: serverNow)
    }
    
    var isActive: Bool {
        return userStatus == "ACTIVE"
    }
}
