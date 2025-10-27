# 🚀 Requêtes Postman - Forge Fitness Shop API

## 📋 Configuration de base

**Base URL** : `http://localhost:3001`

**Variables d'environnement à créer dans Postman** :
- `baseUrl` : `http://localhost:3001`
- `accessToken` : (sera rempli après activation)
- `userId` : (sera rempli après activation)
- `orderId` : (sera rempli après création de commande)
- `productId` : (sera rempli après création de produit)
- `categoryId` : (sera rempli après création de catégorie)

---

## 🔐 1. Authentification

### 1.0 Setup initial - Créer un utilisateur de test (SQL)

Pour le premier test, créer directement un utilisateur et une clé d'activation en BDD :

```sql
-- 1. Créer un utilisateur de test
INSERT INTO "User" (id, email, "firstName", "lastName", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@forgefitness.fr',
  'Admin',
  'Test',
  'ADMIN',
  NOW(),
  NOW()
);

-- 2. Créer une clé d'activation pour cet utilisateur
INSERT INTO "ActivationKey" (id, "userId", key, "expiresAt", "createdAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'TEST123',
  NOW() + INTERVAL '1 hour',
  NOW()
FROM "User" WHERE email = 'admin@forgefitness.fr';
```

> 💡 Maintenant vous pouvez utiliser `admin@forgefitness.fr` avec la clé `TEST123` pour activer le compte !

### 1.1 Demander une clé d'activation (ADMIN)

**POST** `/api/admin/auth/issue-key`

**Headers** :
```
Authorization: Bearer {{adminAccessToken}}
```

**Body** :
```json
{
  "email": "test@example.com"
}
```

> ⚠️ Cette route nécessite un token ADMIN. Pour le premier admin, créer une clé manuellement en BDD ou utiliser un compte admin existant.

**Alternative pour le premier test** : Créer directement une clé en BDD :
```sql
INSERT INTO "ActivationKey" (id, "userId", key, "expiresAt", "createdAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'TEST123KEY',
  NOW() + INTERVAL '1 hour',
  NOW()
FROM "User" WHERE email = 'test@example.com';
```

### 1.2 Activer le compte

**POST** `/api/mobile/auth/activate`

```json
{
  "email": "admin@forgefitness.fr",
  "activationKey": "TEST123",
  "deviceUid": "test-device-001",
  "platform": "IOS",
  "model": "iPhone 15 Pro",
  "appVersion": "1.0.0"
}
```

**Response** :
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "clxxxxxx",
    "email": "admin@forgefitness.fr",
    "firstName": "Admin",
    "lastName": "Test",
    "role": "ADMIN"
  }
}
```

> 💡 **Sauvegarder le `accessToken` dans les variables Postman !**

### 1.3 Promouvoir en ADMIN (si besoin)

Si vous avez créé un utilisateur USER et voulez le promouvoir :

```sql
-- Exécuter dans PostgreSQL
UPDATE "User" SET role = 'ADMIN' WHERE email = 'votre-email@example.com';
```

> 💡 Si vous avez suivi l'étape 1.0, votre utilisateur est déjà ADMIN !

---

## 📦 2. Catégories

### 2.1 Créer une catégorie (ADMIN)

**POST** `/api/admin/shop/categories`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Body** :
```json
{
  "name": "Protéines",
  "slug": "proteines",
  "displayOrder": 1,
  "active": true
}
```

**Response** :
```json
{
  "id": "clxxxxxx",
  "name": "Protéines",
  "slug": "proteines"
}
```

> 💡 **Sauvegarder le `id` dans `{{categoryId}}` !**

### 2.2 Créer d'autres catégories

**Body** (Créatine) :
```json
{
  "name": "Créatine",
  "slug": "creatine",
  "displayOrder": 2,
  "active": true
}
```

**Body** (Accessoires) :
```json
{
  "name": "Accessoires",
  "slug": "accessoires",
  "displayOrder": 3,
  "active": true
}
```

### 2.3 Lister les catégories (Mobile)

**GET** `/api/mobile/shop/categories`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Response** :
```json
[
  {
    "id": "clxxxxxx",
    "name": "Protéines",
    "slug": "proteines",
    "displayOrder": 1,
    "active": true
  }
]
```

### 2.4 Modifier une catégorie (ADMIN)

**PUT** `/api/admin/shop/categories/{{categoryId}}`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Body** :
```json
{
  "name": "Protéines Premium",
  "active": true
}
```

### 2.5 Supprimer une catégorie (ADMIN)

**DELETE** `/api/admin/shop/categories/{{categoryId}}`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

---

## 🛒 3. Produits

### 3.1 Créer un produit (ADMIN)

**POST** `/api/admin/shop/products`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Body** :
```json
{
  "name": "Whey Protéine Isolate",
  "slug": "whey-proteine-isolate",
  "description": "Protéine de lactosérum isolée, haute qualité, absorption rapide. Idéale après l'entraînement.",
  "shortDescription": "Protéine isolée haute qualité",
  "categoryId": "{{categoryId}}",
  "priceHT": 35.50,
  "tvaRate": 5.5,
  "sku": "WHEY-ISO-001",
  "stockQuantity": 0,
  "isInfiniteStock": true,
  "minStock": 10,
  "active": true,
  "displayOrder": 1
}
```

**Response** :
```json
{
  "id": "clxxxxxx"
}
```

> 💡 **Sauvegarder le `id` dans `{{productId}}` !**

### 3.2 Créer plus de produits

**Body** (Créatine Monohydrate) :
```json
{
  "name": "Créatine Monohydrate",
  "slug": "creatine-monohydrate",
  "description": "Créatine monohydrate pure micronisée. Améliore la force et la performance.",
  "shortDescription": "Créatine pure micronisée",
  "categoryId": "{{categoryId}}",
  "priceHT": 19.90,
  "tvaRate": 5.5,
  "sku": "CREAT-MONO-001",
  "stockQuantity": 50,
  "isInfiniteStock": false,
  "minStock": 10,
  "active": true,
  "displayOrder": 1
}
```

**Body** (Shaker) :
```json
{
  "name": "Shaker Premium 700ml",
  "slug": "shaker-premium-700ml",
  "description": "Shaker ergonomique avec grille anti-grumeaux et compartiment pour poudre.",
  "shortDescription": "Shaker avec grille",
  "categoryId": "{{categoryId}}",
  "priceHT": 8.25,
  "tvaRate": 20,
  "sku": "SHAKE-PREM-001",
  "stockQuantity": 5,
  "isInfiniteStock": false,
  "minStock": 10,
  "active": true,
  "displayOrder": 1
}
```

> ⚠️ Le shaker a un stock de 5, il va déclencher une alerte dès la première vente !

### 3.3 Lister les produits (Mobile)

**GET** `/api/mobile/shop/products`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Query params** :
```
?categoryId={{categoryId}}
&active=true
&skip=0
&take=20
```

**Response** :
```json
{
  "products": [
    {
      "id": "clxxxxxx",
      "name": "Whey Protéine Isolate",
      "slug": "whey-proteine-isolate",
      "description": "Protéine de lactosérum isolée...",
      "shortDescription": "Protéine isolée haute qualité",
      "priceHT": "35.50",
      "tvaRate": "5.50",
      "sku": "WHEY-ISO-001",
      "stockQuantity": 0,
      "isInfiniteStock": true,
      "active": true,
      "category": {
        "id": "clxxxxxx",
        "name": "Protéines",
        "slug": "proteines"
      },
      "images": []
    }
  ],
  "total": 1
}
```

### 3.4 Détails d'un produit (Mobile)

**GET** `/api/mobile/shop/products/{{productId}}`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

OU par slug :

**GET** `/api/mobile/shop/products/whey-proteine-isolate`

### 3.5 Modifier un produit (ADMIN)

**PUT** `/api/admin/shop/products/{{productId}}`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Body** :
```json
{
  "name": "Whey Protéine Isolate Pro",
  "priceHT": 39.90,
  "stockQuantity": 100,
  "isInfiniteStock": false,
  "active": true
}
```

### 3.6 Ajuster le stock (ADMIN)

**POST** `/api/admin/shop/stock/adjust`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Body** :
```json
{
  "productId": "{{productId}}",
  "quantity": 50,
  "type": "IN",
  "reason": "Réapprovisionnement fournisseur"
}
```

**Types possibles** :
- `IN` : Entrée de stock (+)
- `OUT` : Sortie de stock (-)
- `CORRECTION` : Correction d'inventaire (peut être + ou -)
- `RETURN` : Retour client (+)

### 3.7 Supprimer un produit (Soft Delete - Archivage) (ADMIN)

**DELETE** `/api/admin/shop/products/{{productId}}`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Réponse de succès** :
```json
{
  "success": true
}
```

**Réponse d'erreur** :
```json
{
  "error": "PRODUCT_NOT_FOUND",
  "message": "Produit introuvable"
}
```

> 💡 **Soft Delete** : Le produit est marqué comme `archived: true` et `active: false`. Il n'est plus visible dans les listes mais les données sont conservées.

### 3.8 Supprimer définitivement un produit (Hard Delete avec Cascade) (ADMIN)

**DELETE** `/api/admin/shop/products/{{productId}}/hard`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Réponse de succès** :
```json
{
  "success": true
}
```

**Réponse d'erreur** :
```json
{
  "error": "PRODUCT_NOT_FOUND",
  "message": "Produit introuvable"
}
```

> ⚠️ **Hard Delete** : Le produit est supprimé définitivement de la base de données avec cascade (supprime aussi tous les `StockMovement` et `StockAlert` liés). **Action irréversible !**

---

## 🛍️ 4. Commandes

### 4.1 Créer une commande (Mobile)

**POST** `/api/mobile/shop/orders`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Body** :
```json
{
  "items": [
    {
      "productId": "{{productId}}",
      "quantity": 2
    },
    {
      "productId": "clxxxxxx",
      "quantity": 1
    }
  ],
  "paymentMethod": "CARD"
}
```

**Response** :
```json
{
  "orderId": "clxxxxxx",
  "orderNumber": "ORD-2025-000001",
  "totalTTC": 84.45
}
```

> 💡 **Sauvegarder le `orderId` dans `{{orderId}}` !**

### 4.2 Mes commandes (Mobile)

**GET** `/api/mobile/shop/orders`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Query params** :
```
?skip=0
&take=10
```

**Response** :
```json
{
  "orders": [
    {
      "id": "clxxxxxx",
      "orderNumber": "ORD-2025-000001",
      "totalHT": "74.90",
      "totalTTC": "84.45",
      "tvaTotal": "9.55",
      "paymentMethod": "CARD",
      "status": "PENDING",
      "createdAt": "2025-10-26T22:30:00.000Z",
      "items": [
        {
          "productName": "Whey Protéine Isolate",
          "quantity": 2,
          "priceHT": "35.50",
          "totalTTC": "74.90"
        }
      ]
    }
  ],
  "total": 1
}
```

### 4.3 Détails d'une commande (Mobile)

**GET** `/api/mobile/shop/orders/{{orderId}}`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

### 4.4 Liste toutes les commandes (ADMIN)

**GET** `/api/admin/shop/orders`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Query params** :
```
?status=PENDING
&skip=0
&take=20
```

**Statuts possibles** : `PENDING`, `PAID`, `CANCELLED`, `REFUNDED`

### 4.5 Changer le statut d'une commande (ADMIN)

**PUT** `/api/admin/shop/orders/{{orderId}}/status`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Body** :
```json
{
  "status": "CANCELLED",
  "notes": "Client a demandé l'annulation"
}
```

---

## 💳 5. Paiement (Stripe)

### 5.1 Initier un paiement (Mobile)

**POST** `/api/mobile/shop/payment/initiate`

**Headers** :
```
Authorization: Bearer {{accessToken}}
```

**Body** :
```json
{
  "orderId": "{{orderId}}"
}
```

**Response** :
```json
{
  "paymentIntentId": "pi_3xxxxxxxxxxxxxx",
  "clientSecret": "pi_3xxxxxxxxxxxxxx_secret_xxxxxxxxxxxxxx"
}
```

> 💡 **Le `clientSecret` est à utiliser côté mobile avec Stripe SDK**

### 5.2 Webhook Stripe (Simulé)

**POST** `/api/webhooks/stripe`

**Headers** :
```
stripe-signature: whsec_test_signature
```

**Body** (événement `payment_intent.succeeded`) :
```json
{
  "id": "evt_test_webhook",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_3xxxxxxxxxxxxxx",
      "amount": 8445,
      "currency": "eur",
      "status": "succeeded",
      "metadata": {
        "orderId": "{{orderId}}",
        "orderNumber": "ORD-2025-000001"
      }
    }
  }
}
```

> ⚠️ En production, Stripe envoie automatiquement ce webhook avec une signature valide. Pour tester en local, utilisez Stripe CLI ou désactivez temporairement la vérification de signature.

---

## 📄 6. Factures

Les factures sont générées automatiquement après un paiement réussi (webhook Stripe).

**Format du numéro** : `FF-YYYY-XXXXXX` (ex: `FF-2025-000001`)

**Stockage** : Pour l'instant en local dans `/invoices/`, à migrer vers S3/R2.

**Envoi email** : Automatique après génération.

---

## 🔔 7. Alertes Stock

Les alertes sont déclenchées automatiquement quand :
- Stock < `minStock`
- Un produit avec `isInfiniteStock = false` passe sous le seuil

**Email envoyé aux admins** avec :
- Nom du produit
- Stock actuel
- Seuil minimum

---

## 🧪 8. Scénario de test complet

### Étape 1 : Préparation
1. ✅ Créer un utilisateur ADMIN avec clé d'activation (SQL - section 1.0)
2. ✅ Activer le compte avec la clé `TEST123`
3. ✅ Sauvegarder le token dans Postman

### Étape 2 : Création du catalogue
4. ✅ Créer 3 catégories
5. ✅ Créer 5 produits (dont 1 avec stock limité)
6. ✅ Vérifier la liste des produits (Mobile)

### Étape 3 : Commande
7. ✅ Créer une commande avec 2-3 produits
8. ✅ Vérifier que le stock a été décrémenté
9. ✅ Vérifier qu'une alerte stock a été créée (si stock < minStock)

### Étape 4 : Paiement
10. ✅ Initier un paiement
11. ✅ Simuler le webhook Stripe (`payment_intent.succeeded`)
12. ✅ Vérifier que la commande est passée en `PAID`
13. ✅ Vérifier qu'une facture a été générée

### Étape 5 : Vérifications
14. ✅ Consulter mes commandes (Mobile)
15. ✅ Consulter toutes les commandes (Admin)
16. ✅ Vérifier l'email de facture
17. ✅ Vérifier l'email d'alerte stock (Admin)

---

## 📊 9. Récapitulatif des routes de suppression

### 🗑️ Suppression de produits

| Route | Méthode | Description | Sécurité | Réponse |
|-------|---------|-------------|----------|---------|
| `/api/admin/shop/products/:id` | DELETE | **Soft Delete** - Archivage du produit | ADMIN | `{"success": true}` |
| `/api/admin/shop/products/:id/hard` | DELETE | **Hard Delete** - Suppression définitive avec cascade | ADMIN | `{"success": true}` |

### 🔍 Différences entre Soft Delete et Hard Delete

| Aspect | Soft Delete | Hard Delete |
|--------|-------------|-------------|
| **Action** | Marque comme `archived: true` | Supprime définitivement |
| **Visibilité** | Masqué des listes | Complètement supprimé |
| **Récupération** | ✅ Possible (désarchiver) | ❌ Impossible |
| **Données liées** | ✅ Conservées (StockMovement, etc.) | ❌ Supprimées en cascade |
| **Usage recommandé** | Suppression normale | Nettoyage définitif |

---

## 📊 10. Variables d'environnement requises

Créer un fichier `.env` dans `/backend/` :

```bash
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/forge

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars

# Redis (optionnel)
REDIS_URL=redis://localhost:6379

# SMTP
MAIL_SMTP_HOST=smtp.gmail.com
MAIL_SMTP_PORT=587
MAIL_SMTP_USER=your-email@gmail.com
MAIL_SMTP_PASS=your-app-password
MAIL_FROM=noreply@forgefitness.fr

# Stripe
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx

# App
APP_NAME=Forge Fitness
ACTIVATION_KEY_TTL_MIN=60
```

---

## 🚨 10. Codes d'erreur possibles

### Produits
- `CATEGORY_NOT_FOUND` : Catégorie introuvable
- `SLUG_ALREADY_EXISTS` : Ce slug existe déjà
- `SKU_ALREADY_EXISTS` : Ce SKU existe déjà
- `PRODUCT_NOT_FOUND` : Produit introuvable

### Commandes
- `PRODUCT_NOT_FOUND` : Un ou plusieurs produits introuvables
- `INSUFFICIENT_STOCK` : Stock insuffisant pour le produit X
- `ORDER_NOT_FOUND` : Commande introuvable

### Paiement
- `ORDER_NOT_PAID` : La commande doit être payée
- `ORDER_ALREADY_PROCESSED` : La commande a déjà été traitée
- `PAYMENT_ERROR` : Erreur lors de la création du paiement

---

## 🎯 11. Tips Postman

### Créer les variables d'environnement
1. Cliquer sur l'œil en haut à droite
2. Ajouter un nouvel environnement "Forge Fitness Dev"
3. Ajouter les variables : `baseUrl`, `accessToken`, `userId`, etc.

### Script pour sauvegarder automatiquement les tokens

Dans l'onglet **Tests** de la requête d'activation :

```javascript
const response = pm.response.json();
pm.environment.set("accessToken", response.accessToken);
pm.environment.set("userId", response.user.id);
```

Dans l'onglet **Tests** de création de catégorie :

```javascript
const response = pm.response.json();
pm.environment.set("categoryId", response.id);
```

Dans l'onglet **Tests** de création de produit :

```javascript
const response = pm.response.json();
pm.environment.set("productId", response.id);
```

Dans l'onglet **Tests** de création de commande :

```javascript
const response = pm.response.json();
pm.environment.set("orderId", response.orderId);
```

---

**🎉 Bon test !**

