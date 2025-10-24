import Foundation
import UIKit

@MainActor
final class QrViewModelIOS: ObservableObject {
    static let shared = QrViewModelIOS()

    @Published var image: UIImage?
    @Published var code: String?
    private let repo = QrRepositoryIOS()
    private var refreshTask: Task<Void, Never>?
    private var lastSide: CGFloat = .zero
    private var lastLogo: UIImage?
    private var started = false
    private var expiresAt: Date?
    private static let cache = NSCache<NSString, UIImage>()

    func start() {
        guard !started else { return }
        started = true
        Task { await ensureValid() }
    }

    func update(side: CGFloat, logo: UIImage?) {
        lastSide = side
        lastLogo = logo
        guard let code else { return }
        render(code, side: side, logo: logo)
    }

    func ensureValid() async {
        if let e = expiresAt, e.timeIntervalSinceNow > 20, code != nil { return }
        await refreshNow()
    }

    func refreshNow() async {
        do {
            let payload = try await repo.issueQrCode()
            code = payload.code
            expiresAt = payload.expiresDate
            scheduleRefresh(expires: payload.expiresDate)
            let side = lastSide > 0 ? lastSide : 640
            let logo = lastLogo ?? UIImage(named: "LOGO")
            render(payload.code, side: side, logo: logo)
        } catch {
            image = nil
        }
    }

    private func cacheKey(_ code: String, side: CGFloat, logo: UIImage?) -> NSString {
        let lw = logo?.cgImage?.width ?? Int((logo?.size.width ?? 0) * (logo?.scale ?? 1))
        let lh = logo?.cgImage?.height ?? Int((logo?.size.height ?? 0) * (logo?.scale ?? 1))
        return NSString(string: "\(code)|\(Int(side.rounded()))|\(lw)x\(lh)")
    }

    private func render(_ code: String, side: CGFloat, logo: UIImage?) {
        let key = cacheKey(code, side: side, logo: logo)
        if let cached = Self.cache.object(forKey: key) {
            image = cached
            return
        }
        let desiredSide = side
        Task.detached(priority: .userInitiated) { [weak self] in
            let img = QrGenerator.make(text: code, side: desiredSide, logo: logo)
            guard let img else { return }
            Self.cache.setObject(img, forKey: key)
            await MainActor.run { self?.image = img }
        }
    }

    private func scheduleRefresh(expires: Date?) {
        guard let exp = expires else { return }
        let delay = max(0, exp.timeIntervalSinceNow - 15)
        refreshTask?.cancel()
        refreshTask = Task { [weak self] in
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            await self?.refreshNow()
        }
    }
}
