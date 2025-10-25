import Foundation
import Combine

@MainActor
final class ActivateViewModel: ObservableObject {
    @Published var digits: [String] = Array(repeating: "", count: 6)
    @Published var loading = false
    @Published var error: String?
    @Published var done = false
    
    private let repo: AuthRepository
    private var activateTask: Task<Void, Never>?
    
    var code: String { digits.joined() }
    var allDigitsFilled: Bool { digits.allSatisfy { !$0.isEmpty } }
    
    init(repo: AuthRepository = AuthRepository()) {
        self.repo = repo
    }
    
    func onDigitChange(_ idx: Int, _ value: String) {
        let clean = value.uppercased().filter { $0.isLetter || $0.isNumber }
        
        if clean.count > 1 {
            handlePaste(clean, startingAt: idx)
            return
        }
        
        let capped = String(clean.prefix(1))
        guard digits[idx] != capped else { return }
        digits[idx] = capped
        error = nil
    }
    
    private func handlePaste(_ text: String, startingAt idx: Int) {
        let chars = Array(text.prefix(6))
        
        for (offset, char) in chars.enumerated() {
            let targetIdx = idx + offset
            if targetIdx < 6 {
                digits[targetIdx] = String(char)
            }
        }
        
        error = nil
    }
    
    func activate() {
        activateTask?.cancel()
        
        let key = code.filter { $0.isLetter || $0.isNumber }
        guard key.count == 6 else {
            self.error = "Code invalide"
            return
        }
        
        loading = true
        error = nil
        
        activateTask = Task {
            do {
                _ = try await repo.activate(key: key)
                guard !Task.isCancelled else { return }
                self.loading = false
                self.done = true
            } catch let appError as AppError {
                guard !Task.isCancelled else { return }
                self.loading = false
                self.error = appError.localizedDescription
            } catch {
                guard !Task.isCancelled else { return }
                self.loading = false
                self.error = "Échec de l'activation"
            }
        }
    }
    
    deinit {
        activateTask?.cancel()
    }
}
