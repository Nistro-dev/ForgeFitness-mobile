import SwiftUI
import shared

struct ActivateView: View {
    @EnvironmentObject private var coordinator: AppCoordinator
    @StateObject private var vm = ActivateViewModel()
    @FocusState private var focusedIndex: Int?

    var body: some View {
        ZStack {
            // Contenu centré verticalement et horizontalement
            VStack(spacing: 24) {
                Image("LOGO")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 160)
                    .padding(.top, 8)

                Text("Entrez votre code")
                    .font(.system(size: 22, weight: .bold))
                    .multilineTextAlignment(.center)

                Text("Saisissez les 6 caractères reçus par e-mail ou SMS.")
                    .font(.system(size: 15))
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)

                // Champs de code
                HStack(spacing: 10) {
                    ForEach(0..<6, id: \.self) { i in
                        TextField("", text: Binding(
                            get: { vm.digits[i] },
                            set: { newVal in
                                let old = vm.digits[i]
                                vm.onDigitChange(i, newVal)

                                // Déplacement auto du focus
                                if old.isEmpty && !vm.digits[i].isEmpty, i < 5 {
                                    focusedIndex = i + 1
                                }
                                if vm.digits[i].isEmpty && !old.isEmpty, i > 0 {
                                    focusedIndex = i - 1
                                }
                            })
                        )
                        .keyboardType(.asciiCapable)
                        .textInputAutocapitalization(.characters)
                        .textContentType(.oneTimeCode)
                        .multilineTextAlignment(.center)
                        .frame(width: 48, height: 56)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(focusedIndex == i ? Color.black : Color(white: 0.85),
                                        lineWidth: focusedIndex == i ? 2 : 1)
                        )
                        .focused($focusedIndex, equals: i)
                    }
                }

                // Bouton Valider — ne bouge pas pendant le "loading"
                Button {
                    vm.activate()
                } label: {
                    Text(vm.loading ? "Validation…" : "Valider")
                        .frame(maxWidth: .infinity, minHeight: 56)
                }
                .disabled(vm.loading)
                .background(vm.loading ? Color.black.opacity(0.4) : Color.black)
                .foregroundColor(.white)
                .cornerRadius(14)
                .padding(.top, 8)

                // Message d'erreur rouge (centré sous le bouton)
                if let err = vm.error {
                    Text(err)
                        .foregroundColor(.red)
                        .font(.callout)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
            }
            .padding(.horizontal, 24)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)

            // Footer fixé en bas
            VStack {
                Spacer()
                Button {
                    // Action "Besoin d'aide ?"
                    // (ouvre un lien, affiche une feuille d’aide, etc.)
                } label: {
                    Text("Besoin d’aide ?")
                        .underline()
                        .foregroundColor(.gray)
                        .padding(.vertical, 8)
                }
                .padding(.bottom, 12) // marge bas
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
        }
        .background(Color.white)
        .ignoresSafeArea(edges: []) // garde le footer visible
        .ignoresSafeArea(.keyboard, edges: .bottom) // évite que le clavier pousse le footer
        .onAppear { focusedIndex = 0 }
        .onChange(of: vm.done) { done in
            if done { coordinator.goToMain() }
        }
    }
}
