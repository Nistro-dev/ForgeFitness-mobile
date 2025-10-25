import UIKit
import CoreImage
import CoreImage.CIFilterBuiltins

enum QrGenerator {
    static func make(text: String, side: CGFloat, logo: UIImage?) -> UIImage? {
        let data = Data(text.utf8)
        let f = CIFilter.qrCodeGenerator()
        f.message = data
        f.correctionLevel = "H"
        guard let base = f.outputImage else { return nil }
        
        let qrRect = base.extent.integral
        let qrSide = max(qrRect.width, qrRect.height)
        let intScale = max(1, floor(side / qrSide))
        let actualSize = qrSide * intScale
        let scaled = base.transformed(by: CGAffineTransform(scaleX: intScale, y: intScale))
        
        let color = CIFilter.falseColor()
        color.inputImage = scaled
        color.color0 = CIColor(color: .black)
        color.color1 = CIColor(color: .white)
        guard let ci = color.outputImage else { return nil }
        
        let ctx = CIContext()
        guard let cg = ctx.createCGImage(ci, from: ci.extent) else { return nil }
        
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = UIScreen.main.scale
        format.opaque = true
        let renderer = UIGraphicsImageRenderer(size: CGSize(width: actualSize, height: actualSize), format: format)
        
        return renderer.image { r in
            r.cgContext.setShouldAntialias(false)
            r.cgContext.interpolationQuality = .none
            
            let rect = CGRect(x: 0, y: 0, width: actualSize, height: actualSize)
            
            UIColor.white.setFill()
            UIRectFill(rect)
            
            UIImage(cgImage: cg).draw(in: rect)
            
            guard let logo else { return }
            
            let pxW = CGFloat(logo.cgImage?.width ?? Int(logo.size.width * logo.scale))
            let pxH = CGFloat(logo.cgImage?.height ?? Int(logo.size.height * logo.scale))
            let desiredW = actualSize * 0.28
            let maxLogoW = min(desiredW, pxW)
            let scaleFactor = maxLogoW / max(pxW, 1)
            let drawW = maxLogoW
            let drawH = pxH * scaleFactor
            let logoFrame = CGRect(x: (actualSize - drawW)/2, y: (actualSize - drawH)/2, width: drawW, height: drawH)
            
            let whiteSquareInset: CGFloat = 12
            let whiteSquare = logoFrame.insetBy(dx: -whiteSquareInset, dy: -whiteSquareInset)
            
            UIColor.white.setFill()
            UIRectFill(whiteSquare)
            
            let borderWidth: CGFloat = 1.5
            let borderInset: CGFloat = 4
            let borderRect = whiteSquare.insetBy(dx: borderInset, dy: borderInset)
            let borderPath = UIBezierPath(rect: borderRect)
            borderPath.lineWidth = borderWidth
            UIColor.black.setStroke()
            borderPath.stroke()
            
            r.cgContext.setShouldAntialias(true)
            r.cgContext.interpolationQuality = .high
            logo.draw(in: logoFrame)
            r.cgContext.setShouldAntialias(false)
            r.cgContext.interpolationQuality = .none
        }
    }
}
