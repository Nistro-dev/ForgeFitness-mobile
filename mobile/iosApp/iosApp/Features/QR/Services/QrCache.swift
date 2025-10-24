import UIKit

final class QrCache {
    private let cache = NSCache<NSString, CacheEntry>()
    private var accessOrder: [String] = []
    private let maxSize: Int
    private let queue = DispatchQueue(label: "qr.cache", qos: .utility)
    
    init(maxSize: Int = 20) {
        self.maxSize = maxSize
        cache.countLimit = maxSize
    }
    
    func get(_ key: String) -> UIImage? {
        queue.sync {
            guard let entry = cache.object(forKey: key as NSString) else { return nil }
            updateAccessOrder(key)
            return entry.image
        }
    }
    
    func set(_ key: String, image: UIImage) {
        queue.async { [weak self] in
            guard let self else { return }
            let entry = CacheEntry(image: image)
            self.cache.setObject(entry, forKey: key as NSString)
            self.updateAccessOrder(key)
            self.enforceSizeLimit()
        }
    }
    
    func clear() {
        queue.async { [weak self] in
            self?.cache.removeAllObjects()
            self?.accessOrder.removeAll()
        }
    }
    
    private func updateAccessOrder(_ key: String) {
        accessOrder.removeAll { $0 == key }
        accessOrder.append(key)
    }
    
    private func enforceSizeLimit() {
        while accessOrder.count > maxSize {
            let oldest = accessOrder.removeFirst()
            cache.removeObject(forKey: oldest as NSString)
        }
    }
    
    private class CacheEntry {
        let image: UIImage
        init(image: UIImage) { self.image = image }
    }
}