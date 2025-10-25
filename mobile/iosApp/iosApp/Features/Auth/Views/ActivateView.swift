import SwiftUI
import shared

struct ActivateView: View {
    @EnvironmentObject private var coordinator: AppCoordinator
    @StateObject private var vm = ActivateViewModel()
    @FocusState private var focusedIndex: Int?
    
    var body: some View {
        ZStack {
            VStack(spacing: 24) {
                Image("LOGO")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 160)
                    .padding(.top, 8)
                
                Text("Entrez votre code")
                    .font(.appTitle)
                    .multilineTextAlignment(.center)
                
                Text("Saisissez les 6 caractères reçus par SMS.")
                    .font(.appSubtitle)
                    .foregroundColor(.appSecondary)
                    .multilineTextAlignment(.center)
                
                codeInputFields
                
                submitButton
                
                errorContainer
            }
            .padding(.horizontal, Layout.padding)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
            
            helpButton
        }
        .background(Color.appBackgroundLight)
        .ignoresSafeArea(edges: [])
        .ignoresSafeArea(.keyboard, edges: .bottom)
        .task(id: vm.done) {
            if vm.done {
                coordinator.goToMain()
            }
        }
        .onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                focusedIndex = 0
            }
        }
    }
    
    private var codeInputFields: some View {
        HStack(spacing: 10) {
            ForEach(0..<6, id: \.self) { i in
                OptimizedDigitField(
                    text: vm.digits[i],
                    index: i,
                    isFocused: focusedIndex == i,
                    isLoading: vm.loading,
                    onTextChange: { newVal in
                        handleDigitChange(at: i, newValue: newVal, oldValue: vm.digits[i])
                    }
                )
                .frame(width: 48, height: 56)
                .id("digit_\(i)")
                .focused($focusedIndex, equals: i)
            }
        }
    }
    
    private func handleDigitChange(at index: Int, newValue: String, oldValue: String) {
        if newValue.count > 1 {
            vm.onDigitChange(index, newValue)
            let filledCount = vm.digits.filter { !$0.isEmpty }.count
            
            DispatchQueue.main.async {
                focusedIndex = filledCount >= 6 ? nil : min(filledCount, 5)
                if vm.allDigitsFilled {
                    vm.activate()
                }
            }
            return
        }
        
        vm.onDigitChange(index, newValue)
        
        if oldValue.isEmpty && !vm.digits[index].isEmpty {
            DispatchQueue.main.async {
                if index < 5 {
                    focusedIndex = index + 1
                } else {
                    focusedIndex = nil
                    if vm.allDigitsFilled {
                        vm.activate()
                    }
                }
            }
        } else if !oldValue.isEmpty && vm.digits[index].isEmpty {
            DispatchQueue.main.async {
                if index > 0 {
                    focusedIndex = index - 1
                }
            }
        }
    }
    
    private var submitButton: some View {
        Button {
            focusedIndex = nil
            vm.activate()
        } label: {
            if vm.loading {
                HStack(spacing: 8) {
                    ProgressView()
                        .tint(.white)
                    Text("Validation...")
                }
            } else {
                Text("Valider")
            }
        }
        .font(.appButton)
        .disabled(vm.loading || !vm.allDigitsFilled)
        .appPrimaryButton(isLoading: vm.loading)
        .padding(.top, 8)
        .opacity(vm.allDigitsFilled ? 1 : 0.5)
    }
    
    private var errorContainer: some View {
        Group {
            if let err = vm.error {
                HStack(spacing: 8) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.callout)
                    Text(err)
                        .font(.callout)
                }
                .foregroundColor(.appError)
                .frame(maxWidth: .infinity, alignment: .center)
                .transition(.opacity.combined(with: .move(edge: .top)))
            } else {
                Text(" ")
                    .foregroundColor(.clear)
                    .font(.callout)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
        }
        .frame(minHeight: 40)
        .animation(.easeInOut(duration: 0.2), value: vm.error)
    }
    
    private var helpButton: some View {
        VStack {
            Spacer()
            Button {
                if let url = URL(string: "mailto:support@forgefitness.fr?subject=Aide%20activation") {
                    UIApplication.shared.open(url)
                }
            } label: {
                Text("Besoin d'aide ?")
                    .underline()
                    .foregroundColor(.appSecondary)
                    .padding(.vertical, 8)
            }
            .padding(.bottom, 12)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
    }
}

private struct OptimizedDigitField: UIViewRepresentable {
    let text: String
    let index: Int
    let isFocused: Bool
    let isLoading: Bool
    let onTextChange: (String) -> Void
    
    func makeUIView(context: Context) -> UITextField {
        let textField = UITextField()
        textField.delegate = context.coordinator
        textField.textAlignment = .center
        textField.font = .systemFont(ofSize: 24, weight: .medium)
        textField.keyboardType = .asciiCapable
        textField.autocapitalizationType = .allCharacters
        textField.autocorrectionType = .no
        textField.textContentType = .oneTimeCode
        textField.backgroundColor = .white
        textField.layer.cornerRadius = 10
        textField.layer.borderWidth = 1
        textField.layer.borderColor = UIColor(white: 0.85, alpha: 1).cgColor
        textField.tintColor = UIColor(named: "AppPrimary")
        
        textField.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            textField.heightAnchor.constraint(equalToConstant: 56),
            textField.widthAnchor.constraint(equalToConstant: 48)
        ])
        
        textField.addTarget(context.coordinator, action: #selector(Coordinator.textFieldDidChange(_:)), for: .editingChanged)
        
        return textField
    }
    
    func updateUIView(_ uiView: UITextField, context: Context) {
        if uiView.text != text {
            uiView.text = text
        }
        
        uiView.isEnabled = !isLoading
        
        let borderColor: UIColor = isFocused ? (UIColor(named: "AppPrimary") ?? .blue) : UIColor(white: 0.85, alpha: 1)
        let borderWidth: CGFloat = isFocused ? 2 : 1
        
        if uiView.layer.borderColor != borderColor.cgColor {
            uiView.layer.borderColor = borderColor.cgColor
        }
        if uiView.layer.borderWidth != borderWidth {
            uiView.layer.borderWidth = borderWidth
        }
        
        if isFocused && !uiView.isFirstResponder {
            uiView.becomeFirstResponder()
        } else if !isFocused && uiView.isFirstResponder {
            uiView.resignFirstResponder()
        }
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(text: text, onTextChange: onTextChange)
    }
    
    class Coordinator: NSObject, UITextFieldDelegate {
        var text: String
        let onTextChange: (String) -> Void
        
        init(text: String, onTextChange: @escaping (String) -> Void) {
            self.text = text
            self.onTextChange = onTextChange
        }
        
        @objc func textFieldDidChange(_ textField: UITextField) {
            let newText = textField.text ?? ""
            if newText != text {
                text = newText
                onTextChange(newText)
            }
        }
        
        func textField(_ textField: UITextField, shouldChangeCharactersIn range: NSRange, replacementString string: String) -> Bool {
            let currentText = textField.text ?? ""
            guard let stringRange = Range(range, in: currentText) else { return false }
            let updatedText = currentText.replacingCharacters(in: stringRange, with: string)
            
            let filtered = updatedText.uppercased().filter { $0.isLetter || $0.isNumber }
            return filtered.count <= 1
        }
    }
}
