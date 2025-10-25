import Foundation
import UIKit

@MainActor
final class QrViewModel: ObservableObject {
    @Published var image: UIImage?
    @Published var error: AppError?
    @Published var isLoading = false
    @Published var userStatus: String = "ACTIVE"
    
    private var code: String?
    private let repo: QrRepository
    private let cache: QrCache
    private let generator = QrGenerator.self
    private var refreshTask: Task<Void, Never>?
    private var expiresAt: Date?
    private var lastSide: CGFloat = 640
    private var lastLogo: UIImage?
    private var hasStarted = false
    
    init(repo: QrRepository = QrRepository(), cache: QrCache = QrCache()) {
        self.repo = repo
        self.cache = cache
    }
    
    func start() {
        guard !hasStarted else { return }
        hasStarted = true
        Task { await refreshNow() }
    }
    
    func update(side: CGFloat, logo: UIImage?) {
        lastSide = side
        lastLogo = logo
        guard let code else { return }
        if userStatus == "ACTIVE" {
            render(code, side: side, logo: logo)
        } else {
            renderInactiveQr(side: side, logo: logo)
        }
    }
    
    func refreshNow() async {
        guard !isLoading else { return }
        isLoading = true
        error = nil
        
        do {
            let payload = try await repo.issueQrCode()
            code = payload.code
            userStatus = payload.userStatus
            expiresAt = payload.expiresDate
            scheduleRefresh(expires: payload.expiresDate)
            
            if payload.isActive {
                render(payload.code, side: lastSide, logo: lastLogo ?? UIImage(named: "LOGO"))
            } else {
                renderInactiveQr(side: lastSide, logo: lastLogo ?? UIImage(named: "LOGO"))
            }
        } catch let appError as AppError {
            if case .qr(let qrError) = appError, qrError == .userInactive {
                userStatus = "DISABLED"
                renderInactiveQr(side: lastSide, logo: lastLogo ?? UIImage(named: "LOGO"))
            } else {
                error = appError
                image = nil
            }
        } catch {
            self.error = AppError.fromError(error)
            image = nil
        }
        
        isLoading = false
    }
    
    private func render(_ code: String, side: CGFloat, logo: UIImage?) {
        let key = cacheKey(code, side: side, logo: logo)
        
        if let cached = cache.get(key) {
            image = cached
            return
        }
        
        Task.detached(priority: .userInitiated) { [weak self] in
            guard let img = QrGenerator.make(text: code, side: side, logo: logo) else { return }
            await MainActor.run {
                self?.cache.set(key, image: img)
                self?.image = img
            }
        }
    }
    
    private func renderInactiveQr(side: CGFloat, logo: UIImage?) {
        Task.detached(priority: .userInitiated) { [weak self] in
            guard let img = QrGenerator.make(text: "COMPTE_INACTIF", side: side, logo: logo) else { return }
            await MainActor.run {
                self?.image = img
            }
        }
    }
    
    private func scheduleRefresh(expires: Date?) {
        guard let exp = expires else { return }
        
        let delay = max(0, exp.timeIntervalSinceNow - 15)
        
        refreshTask?.cancel()
        refreshTask = Task { @MainActor [weak self] in
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            guard let self, !Task.isCancelled else { return }
            await self.refreshNow()
        }
    }
    
    private func cacheKey(_ code: String, side: CGFloat, logo: UIImage?) -> String {
        let lw = logo?.cgImage?.width ?? Int((logo?.size.width ?? 0) * (logo?.scale ?? 1))
        let lh = logo?.cgImage?.height ?? Int((logo?.size.height ?? 0) * (logo?.scale ?? 1))
        return "\(code)|\(Int(side.rounded()))|\(lw)x\(lh)"
    }
}
