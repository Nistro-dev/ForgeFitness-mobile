import SwiftUI

enum MainTab: Int, CaseIterable, Identifiable {
    case shop, coaching, qr, programs, events
    var id: Int { rawValue }
    
    var imageName: String {
        switch self {
        case .shop:      return "shopping-cart"
        case .coaching:  return "biceps-flexed"
        case .qr:        return "qrcode-lucide"
        case .programs:  return "book-open"
        case .events:    return "calendar"
        }
    }
    
    var label: String {
        switch self {
        case .shop:      return "Boutique"
        case .coaching:  return "Coaching"
        case .qr:        return "QR Code"
        case .programs:  return "Programmes"
        case .events:    return "Événements"
        }
    }
}

struct MainView: View {
    @EnvironmentObject private var coordinator: AppCoordinator
    @StateObject private var qrViewModel = QrViewModel()
    @State private var selected: MainTab = .qr
    @State private var qrHasStarted = false
    
    var body: some View {
        ZStack(alignment: .bottom) {
            Group {
                switch selected {
                case .shop:
                    Text("Boutique").font(.title.bold()).foregroundColor(.white)
                case .coaching:
                    Text("Coaching").font(.title.bold()).foregroundColor(.white)
                case .qr:
                    QrScreen(viewModel: qrViewModel, hasStarted: $qrHasStarted)
                case .programs:
                    Text("Programmes").font(.title.bold()).foregroundColor(.white)
                case .events:
                    Text("Événements").font(.title.bold()).foregroundColor(.white)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.black)
            
            CustomTabBar(selected: $selected)
        }
        .ignoresSafeArea(edges: .bottom)
    }
}
