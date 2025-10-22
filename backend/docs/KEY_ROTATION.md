# 🔑 Rotation des Clés JWT QR Code

## Vue d'ensemble

La rotation des clés JWT est essentielle pour la sécurité du système QR code. Ce document explique comment effectuer une rotation manuelle des clés.

## 📋 Procédure de rotation

### 1. Préparation

```bash
# 1. Vérifier l'état actuel des clés
curl http://localhost:3001/health/jwt-keys

# 2. Sauvegarder l'environnement actuel
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
```

### 2. Génération de nouvelles clés

```bash
# Option 1: Génération simple
node scripts/generate-keys.js

# Option 2: Génération avec sauvegarde
node scripts/generate-keys.js --output-file=./backups/new-keys-$(date +%Y%m%d).txt
```

### 3. Rotation automatique

```bash
# Rotation complète avec sauvegarde
node scripts/rotate-keys.js --backup-dir=./backups
```

### 4. Vérification post-rotation

```bash
# 1. Redémarrer l'application
npm run dev

# 2. Vérifier les nouvelles clés
curl http://localhost:3001/health/jwt-keys

# 3. Tester l'émission de token
curl -X POST http://localhost:3001/api/qr/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"gateId": "test-gate", "ttlSeconds": 300}'

# 4. Tester la validation
curl -X POST http://localhost:3001/api/qr/validate \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_QR_TOKEN", "gateId": "test-gate"}'
```

## 📊 Monitoring de la rotation

### Logs de rotation

Les rotations sont loggées dans `key-rotation.log` :

```json
[
  {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "kid": "key_1705312200000",
    "backupFile": "./backups/keys-backup-2024-01-15T10-30-00-000Z.env",
    "status": "rotated",
    "nextRotation": "2024-04-15T10:30:00.000Z"
  }
]
```

### Endpoints de monitoring

- `GET /health` - Santé générale
- `GET /health/detailed` - Santé détaillée avec composants
- `GET /health/jwt-keys` - État des clés JWT

## ⚠️ Points d'attention

### Période de transition

- **24h de cohabitation** : Les anciennes clés restent valides 24h
- **Surveillance** : Monitorer les erreurs de validation pendant cette période
- **Nettoyage** : Supprimer les anciennes clés après 24h

### Sécurité

- **Sauvegarde** : Toujours sauvegarder avant rotation
- **Test** : Tester en environnement de développement d'abord
- **Audit** : Conserver les logs de rotation pour audit

### Planification

- **Fréquence recommandée** : 90 jours
- **Rappel** : Configurer un rappel pour la prochaine rotation
- **Documentation** : Mettre à jour la documentation après rotation

## 🚨 Gestion d'urgence

### En cas de compromission

```bash
# 1. Rotation immédiate
node scripts/rotate-keys.js

# 2. Invalidation du cache Redis
redis-cli FLUSHDB

# 3. Redémarrage de l'application
npm run restart

# 4. Notification des équipes
# (À implémenter selon votre processus)
```

### En cas d'erreur de rotation

```bash
# 1. Restaurer depuis la sauvegarde
cp .env.backup.YYYYMMDD_HHMMSS .env

# 2. Redémarrer l'application
npm run restart

# 3. Vérifier l'état
curl http://localhost:3001/health/jwt-keys
```

## 📅 Planification automatique

### Rappel dans votre app TODO

```
🔄 ROTATION CLÉS JWT QR CODE
- Générer nouvelle paire RSA 2048
- Mettre à jour JWT_KID dans .env
- Tester avec ancienne + nouvelle clé
- Supprimer ancienne clé après 24h
- Redémarrer services
- Vérifier logs d'erreur
- Planifier prochaine rotation (90 jours)
```

### Script de rappel (optionnel)

```bash
# Ajouter à votre crontab pour rappel mensuel
0 9 1 * * echo "🔑 Rappel: Vérifier la rotation des clés JWT QR Code" | mail -s "Rotation clés JWT" admin@forgefitness.com
```

## 🔧 Maintenance

### Vérification régulière

```bash
# Vérifier l'état des clés
curl http://localhost:3001/health/jwt-keys

# Vérifier les logs de rotation
cat key-rotation.log | tail -5

# Vérifier l'espace disque des backups
du -sh ./backups/
```

### Nettoyage des anciennes sauvegardes

```bash
# Supprimer les sauvegardes de plus de 6 mois
find ./backups/ -name "keys-backup-*.env" -mtime +180 -delete
```
