import SwiftUI

// MARK: - Colors
extension Color {
    static let appBackground = Color.black
    static let appBackgroundLight = Color.white
    static let appPrimary = Color.black
    static let appSecondary = Color.gray
    static let appAccent = Color.white
    static let appError = Color.red
    static let appSuccess = Color.green
    
    static let tabBarBackground = Color(red: 0.04, green: 0.04, blue: 0.04)
    static let tabBarSelected = Color.white
    static let tabBarUnselected = Color(red: 0.4, green: 0.4, blue: 0.4)
}

// MARK: - Fonts
extension Font {
    static let appTitle = Font.system(size: 22, weight: .bold)
    static let appSubtitle = Font.system(size: 15, weight: .regular)
    static let appBody = Font.system(size: 15, weight: .regular)
    static let appCaption = Font.system(size: 11, weight: .semibold)
    static let appButton = Font.system(size: 16, weight: .semibold)
}

// MARK: - View Modifiers
struct AppPrimaryButton: ViewModifier {
    let isLoading: Bool
    
    func body(content: Content) -> some View {
        content
            .frame(maxWidth: .infinity, minHeight: 56)
            .background(isLoading ? Color.appPrimary.opacity(0.4) : Color.appPrimary)
            .foregroundColor(.appAccent)
            .cornerRadius(14)
    }
}

extension View {
    func appPrimaryButton(isLoading: Bool = false) -> some View {
        modifier(AppPrimaryButton(isLoading: isLoading))
    }
}

// MARK: - Layout Constants
enum Layout {
    static let cornerRadius: CGFloat = 14
    static let padding: CGFloat = 24
    static let spacing: CGFloat = 16
    static let buttonHeight: CGFloat = 56
}