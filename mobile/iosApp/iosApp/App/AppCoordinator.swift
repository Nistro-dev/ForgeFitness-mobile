import Foundation
import Combine

final class AppCoordinator: ObservableObject {
    enum Route { case splash, main }
    @Published var route: Route = .splash

    func advanceFromSplash() { route = .main }
}
