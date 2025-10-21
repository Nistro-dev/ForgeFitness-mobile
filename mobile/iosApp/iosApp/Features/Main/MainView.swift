import SwiftUI

struct MainView: View {
    var body: some View {
        Text("Main")
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(AppTheme.background)
            .ignoresSafeArea()
    }
}
