import Foundation
import Combine

@MainActor
final class AppCoordinator: ObservableObject {
    enum Route { case splash, activate, main }
    @Published var route: Route = .splash
    
    private let repo: AuthRepository
    
    init(repo: AuthRepository = AuthRepository()) {
        self.repo = repo
    }
    
    func start() {
        Task {
            let hasToken = await repo.hasValidToken()
            self.route = hasToken ? .main : .activate
        }
    }
    
    func advanceFromSplash() {
        start()
    }
    
    func goToMain() {
        route = .main
    }
    
    func goToActivate() {
        route = .activate
    }
    
    func logout() {
        Task {
            try? await repo.logout()
            self.route = .activate
        }
    }
}
