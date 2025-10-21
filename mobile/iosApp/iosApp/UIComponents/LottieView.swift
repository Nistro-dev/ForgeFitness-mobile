import SwiftUI
import Lottie

struct LottieView: UIViewRepresentable {
    let name: String
    let loop: LottieLoopMode
    let onCompleted: (() -> Void)?

    func makeUIView(context: Context) -> UIView {
        let container = UIView()
        container.backgroundColor = .clear

        let v = LottieAnimationView()
        v.translatesAutoresizingMaskIntoConstraints = false
        v.backgroundColor = .clear
        v.contentMode = .scaleAspectFit
        v.loopMode = loop
        v.backgroundBehavior = .pauseAndRestore

        if let url = Bundle.main.url(forResource: name, withExtension: "lottie") {
            v.animation = LottieAnimation.filepath(url.path)
        } else if let anim = LottieAnimation.named(name, bundle: .main) {
            v.animation = anim
        } else if let url = Bundle.main.url(forResource: name, withExtension: "json") {
            v.animation = LottieAnimation.filepath(url.path)
        } else {
            print("⚠️ Lottie \(name) introuvable dans le bundle")
        }

        container.addSubview(v)
        NSLayoutConstraint.activate([
            v.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            v.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            v.topAnchor.constraint(equalTo: container.topAnchor),
            v.bottomAnchor.constraint(equalTo: container.bottomAnchor)
        ])

        v.play { finished in if finished { onCompleted?() } }
        return container
    }

    func updateUIView(_ uiView: UIView, context: Context) { }
}
