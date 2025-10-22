import Foundation
import Combine
import shared

final class AppCoordinator: ObservableObject {
    enum Route { case splash, activate, main }
    @Published var route: Route = .splash

    private let tokenStorage = IOSUserDefaultsTokenStorage()

    func start() {
        Task { @MainActor in
            let token = try? await tokenStorage.getToken()
            self.route = (token?.isEmpty == false) ? .main : .activate
        }
    }

    func advanceFromSplash() { start() }
    func goToMain() { route = .main }
    func goToActivate() { route = .activate }
}
