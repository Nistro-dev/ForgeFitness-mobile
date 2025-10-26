# 🛒 Documentation d'implémentation - Boutique ForgeFitness

## 📋 Vue d'ensemble

Ce document décrit l'architecture et le plan d'implémentation complet de la boutique en ligne pour ForgeFitness, incluant l'application mobile client et le logiciel métier d'administration.

---

## 🏗️ Architecture globale

### Schéma d'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API (Node.js)                    │
│                  http://api.forgefitness.fr                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Routes & Authentification JWT              │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Middleware de contrôle des rôles              │  │
│  │     (USER / COACH / ADMIN)                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Use Cases (Business Logic)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Database PostgreSQL                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                 ↓                           ↓
    ┌────────────────────┐      ┌─────────────────────────┐
    │   APPLI MOBILE     │      │   LOGICIEL MÉTIER       │
    │   (iOS/Android)    │      │   (Web App - React)     │
    │                    │      │                         │
    │  Pour CLIENT:      │      │  Pour ADMIN/COACH:      │
    │  - Voir produits   │      │  - Créer produits       │
    │  - Acheter         │      │  - Gérer stocks         │
    │  - Historique      │      │  - Voir commandes       │
    │  - Profil          │      │  - Analytics            │
    │  - QR code entrée  │      │  - Gestion users        │
    └────────────────────┘      └─────────────────────────┘
         (Rôle: USER)              (Rôles: COACH/ADMIN)
```

### Principe clé : UN SEUL BACKEND

Le backend API ne fait AUCUNE différence entre les applications. Il vérifie uniquement :
1. ✅ L'utilisateur est-il authentifié ? (token JWT valide)
2. ✅ A-t-il le RÔLE nécessaire pour cette action ?

---

## 🔐 Système de rôles et permissions

### Énumération des rôles

```prisma
enum UserRole {
  USER   // Adhérent normal → Appli mobile uniquement
  COACH  // Coach → Logiciel métier (vue partielle)
  ADMIN  // Administrateur → Logiciel métier (accès complet)
}
```

### Matrice des permissions

| Fonctionnalité | USER (Mobile) | COACH (Métier) | ADMIN (Métier) |
|----------------|---------------|----------------|----------------|
| **Boutique** |
| Voir produits | ✅ | ✅ | ✅ |
| Acheter produits | ✅ | ✅ | ✅ |
| Créer produit | ❌ | ❌ | ✅ |
| Modifier produit | ❌ | ❌ | ✅ |
| Gérer stock | ❌ | ❌ | ✅ |
| Voir toutes commandes | ❌ | ✅ (seulement ses clients) | ✅ (toutes) |
| **Adhérents** |
| QR code entrée | ✅ | ❌ | ❌ |
| Voir son profil | ✅ | ✅ | ✅ |
| Gérer utilisateurs | ❌ | ✅ (voir liste) | ✅ (CRUD complet) |
| Désactiver compte | ❌ | ❌ | ✅ |
| **Analytics** |
| Voir rapports | ❌ | ✅ (limités) | ✅ (complets) |

---

## 🗄️ Schéma de base de données

### 1. Tables principales

#### Product
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID / Auto | Identifiant unique |
| `name` | String | Nom du produit |
| `slug` | String (unique) | URL simplifiée |
| `description` | Text | Description complète |
| `shortDescription` | String | Résumé affiché dans la liste |
| `categoryId` | FK | Lien vers Category |
| `priceHT` | Decimal(10,2) | Prix hors taxe |
| `tvaRate` | Decimal(4,2) | Taux de TVA (ex : 20.00, 5.50) |
| `priceTTC` | Calculé | `priceHT * (1 + tvaRate/100)` |
| `sku` | String | Référence interne (Stock Keeping Unit) |
| `stockQuantity` | Integer | Quantité disponible |
| `isInfiniteStock` | Boolean | Stock infini (true) ou limité (false) |
| `minStock` | Integer | Seuil d'alerte pour réapprovisionnement |
| `unit` | String | Unité de vente ("pièce", "boîte", etc.) |
| `weight` | Decimal | Poids pour livraison |
| `active` | Boolean | Produit visible ou non |
| `isDigital` | Boolean | Produit virtuel (pas de stock physique) |
| `displayOrder` | Integer | Ordre d'affichage |
| `externalId` | String (nullable) | ID externe (ERP futur) |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Date de mise à jour |
| `createdBy` | FK User | Utilisateur créateur |

#### Category
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `name` | String | Nom de la catégorie |
| `slug` | String (unique) | URL simplifiée |
| `description` | Text (nullable) | Description optionnelle |
| `displayOrder` | Integer | Ordre d'affichage |
| `active` | Boolean | Catégorie active |
| `createdAt` | DateTime | Date de création |

#### ProductImage
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `productId` | FK | Produit concerné |
| `url` | String | URL de l'image |
| `alt` | String | Texte alternatif |
| `displayOrder` | Integer | Ordre d'affichage |
| `createdAt` | DateTime | Date d'ajout |

#### Order
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `orderNumber` | String (unique) | Numéro de commande (ex: FF-2025-000123) |
| `userId` | FK User | Client |
| `totalHT` | Decimal | Montant HT |
| `totalTTC` | Decimal | Montant TTC |
| `tvaTotal` | Decimal | Total TVA |
| `paymentMethod` | String | "CB", "Apple Pay", etc. |
| `status` | Enum | "pending", "paid", "cancelled", "refunded" |
| `paidAt` | DateTime (nullable) | Date de paiement |
| `invoiceNumber` | String (nullable) | Numéro de facture |
| `notes` | Text (nullable) | Commentaires internes |
| `createdAt` | DateTime | Date de création |
| `updatedAt` | DateTime | Date de mise à jour |

#### OrderItem
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `orderId` | FK | Lien vers Order |
| `productId` | FK | Produit concerné |
| `quantity` | Integer | Quantité |
| `priceHT` | Decimal | Prix unitaire HT |
| `tvaRate` | Decimal | Taux TVA |
| `totalHT` | Decimal | Total ligne HT |
| `totalTTC` | Decimal | Total ligne TTC |

#### StockMovement
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `productId` | FK | Produit concerné |
| `type` | Enum | "IN", "OUT", "SALE", "CORRECTION", "RETURN" |
| `quantity` | Integer | Quantité (+ ou -) |
| `reason` | String | Texte (réassort, casse, vente, etc.) |
| `orderId` | FK (nullable) | Commande associée si vente |
| `createdAt` | DateTime | Date du mouvement |
| `createdBy` | FK User | Utilisateur auteur |

#### Invoice
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `invoiceNumber` | String (unique) | Numéro facture (FF-YYYY-NNNNNN) |
| `orderId` | FK | Commande concernée |
| `userId` | FK User | Client |
| `totalHT` | Decimal | Montant HT |
| `totalTTC` | Decimal | Montant TTC |
| `tvaTotal` | Decimal | Total TVA |
| `pdfUrl` | String | URL du PDF généré |
| `sentAt` | DateTime (nullable) | Date d'envoi au client |
| `createdAt` | DateTime | Date de génération |

#### InvoiceSequence
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `year` | Integer (unique) | Année |
| `last` | Integer | Dernier numéro utilisé |

#### PaymentTransaction
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `orderId` | FK | Commande concernée |
| `stripePaymentIntentId` | String (unique) | ID Stripe |
| `amount` | Decimal | Montant |
| `currency` | String | Devise (EUR) |
| `status` | String | succeeded, failed, refunded |
| `metadata` | JSON | Métadonnées Stripe |
| `createdAt` | DateTime | Date de transaction |

#### AuditLog
| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `userId` | FK (nullable) | Utilisateur auteur |
| `action` | String | Action (CREATE_PRODUCT, UPDATE_PRICE, etc.) |
| `entity` | String | Entité concernée (Product, Order) |
| `entityId` | String | ID de l'entité |
| `oldValue` | JSON (nullable) | Ancienne valeur |
| `newValue` | JSON (nullable) | Nouvelle valeur |
| `ipAddress` | String (nullable) | IP de l'utilisateur |
| `userAgent` | String (nullable) | User agent |
| `createdAt` | DateTime | Date de l'action |

---

## 📁 Structure backend à créer

```
backend/src/
├── domain/
│   ├── entities/
│   │   ├── Product.ts           [NEW]
│   │   ├── Category.ts          [NEW]
│   │   ├── Order.ts             [NEW]
│   │   ├── OrderItem.ts         [NEW]
│   │   └── StockMovement.ts     [NEW]
│   └── ports/
│       ├── ProductRepo.ts       [NEW]
│       ├── CategoryRepo.ts      [NEW]
│       ├── OrderRepo.ts         [NEW]
│       ├── StockMovementRepo.ts [NEW]
│       └── PaymentProvider.ts   [NEW]
│
├── application/
│   └── shop/
│       ├── CreateProductUseCase.ts          [NEW]
│       ├── UpdateProductUseCase.ts          [NEW]
│       ├── ListProductsUseCase.ts           [NEW]
│       ├── GetProductDetailsUseCase.ts      [NEW]
│       ├── CreateOrderUseCase.ts            [NEW]
│       ├── ProcessPaymentUseCase.ts         [NEW]
│       ├── AdjustStockUseCase.ts            [NEW]
│       ├── GenerateInvoiceUseCase.ts        [NEW]
│       └── CheckStockAlertUseCase.ts        [NEW]
│
├── infrastructure/
│   ├── prisma/
│   │   ├── ProductRepoPrisma.ts             [NEW]
│   │   ├── CategoryRepoPrisma.ts            [NEW]
│   │   ├── OrderRepoPrisma.ts               [NEW]
│   │   └── StockMovementRepoPrisma.ts       [NEW]
│   ├── payment/
│   │   └── StripePaymentProvider.ts         [NEW]
│   └── pdf/
│       └── InvoiceGenerator.ts              [NEW]
│
└── interface/
    ├── dtos/
    │   ├── product.dto.ts                   [NEW]
    │   └── order.dto.ts                     [NEW]
    └── http/
        ├── controllers/
        │   ├── product.controller.ts        [NEW]
        │   ├── category.controller.ts       [NEW]
        │   └── order.controller.ts          [NEW]
        ├── middleware/
        │   └── roleAuth.middleware.ts       [NEW]
        └── routes/
            ├── product.routes.ts            [NEW]
            ├── category.routes.ts           [NEW]
            └── order.routes.ts              [NEW]
```

---

## 💳 Intégration Stripe

### Installation
```bash
npm install stripe
npm install @types/stripe --save-dev
```

### Variables d'environnement
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_test_...
```

### Flow de paiement

1. **Client crée une commande** → `status: 'pending'`
2. **Backend crée un PaymentIntent Stripe**
   ```typescript
   const paymentIntent = await stripe.paymentIntents.create({
     amount: Math.round(order.totalTTC * 100), // en centimes
     currency: 'eur',
     metadata: { orderId: order.id }
   })
   ```
3. **Client paie via mobile** (Stripe SDK)
4. **Webhook Stripe notifie le backend**
5. **Backend valide** → 
   - `order.status = 'paid'`
   - Décrément du stock
   - Génération de la facture

### Webhook Stripe
```typescript
// POST /api/webhooks/stripe
router.post('/webhooks/stripe', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature']
    let event
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body, 
        sig, 
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      await handlePaymentSuccess(paymentIntent)
    }
    
    res.json({ received: true })
  }
)
```

---

## 📊 Numérotation des factures

### Format légal
```
FF-YYYY-NNNNNN
```
- `FF` = préfixe société
- `YYYY` = année
- `NNNNNN` = numéro séquentiel (reset chaque année)

### Implémentation
```typescript
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  
  const sequence = await prisma.invoiceSequence.upsert({
    where: { year },
    create: { year, last: 1 },
    update: { last: { increment: 1 } }
  })
  
  return `FF-${year}-${String(sequence.last).padStart(6, '0')}`
}
```

**Exemple :** `FF-2025-000001`, `FF-2025-000002`, ..., `FF-2026-000001`

---

## 💾 Stratégie de sauvegarde

### 1. Sauvegarde PostgreSQL automatique

**Script : `scripts/backup-db.sh`**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/forgefitness"
DB_NAME="forgefitness"

# Créer le répertoire si inexistant
mkdir -p "$BACKUP_DIR"

# Backup complet
pg_dump $DATABASE_URL > "$BACKUP_DIR/backup_$DATE.sql"

# Compression
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Nettoyage (garde 30 jours)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload vers S3 (optionnel)
# aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" s3://forgefitness-backups/db/
```

**Rendre exécutable :**
```bash
chmod +x scripts/backup-db.sh
```

**Cron job (tous les jours à 3h) :**
```bash
crontab -e
# Ajouter :
0 3 * * * /path/to/scripts/backup-db.sh >> /var/log/forgefitness-backup.log 2>&1
```

### 2. Sauvegarde des fichiers (images produits)

**Option A : Stockage cloud (Cloudflare R2, AWS S3)**
```bash
# Sync quotidien vers S3
0 4 * * * aws s3 sync /var/www/uploads s3://forgefitness-backups/uploads/
```

**Option B : Backup local + transfert distant**
```bash
#!/bin/bash
tar -czf /var/backups/uploads_$(date +%Y%m%d).tar.gz /var/www/uploads
scp /var/backups/uploads_*.tar.gz user@backup-server:/backups/
```

### 3. Restauration

**Restaurer la base de données :**
```bash
gunzip -c backup_20250126_030000.sql.gz | psql $DATABASE_URL
```

**Restaurer les fichiers :**
```bash
tar -xzf uploads_20250126.tar.gz -C /var/www/
```

### Conservation légale
- **Factures** : 10 ans obligatoire
- **Commandes** : 3 ans minimum
- **Logs audit** : 1 an minimum

---

## 📧 Alertes stock automatiques

### Job CRON : `scripts/check-stock-alerts.ts`

```typescript
import { prisma } from '../src/infrastructure/prisma/client'
import { sendMail } from '../src/infrastructure/mail/NodemailerMailer'

async function checkStockAlerts() {
  const lowStockProducts = await prisma.product.findMany({
    where: {
      AND: [
        { active: true },
        { isInfiniteStock: false },
        { stockQuantity: { lte: prisma.raw('min_stock') } }
      ]
    },
    include: { category: true, createdByUser: true }
  })

  if (lowStockProducts.length === 0) {
    console.log('✅ Aucune alerte stock')
    return
  }

  console.log(`⚠️  ${lowStockProducts.length} produit(s) en alerte stock`)

  // Envoyer email aux admins
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  })

  for (const admin of admins) {
    await sendMail({
      to: admin.email,
      subject: `⚠️ Alerte stock - ${lowStockProducts.length} produit(s)`,
      html: generateStockAlertEmail(lowStockProducts)
    })
  }
}

function generateStockAlertEmail(products: any[]) {
  return `
    <h2>Alerte de stock</h2>
    <p>Les produits suivants sont en dessous du seuil d'alerte :</p>
    <ul>
      ${products.map(p => `
        <li>
          <strong>${p.name}</strong> (${p.sku})<br>
          Stock actuel : ${p.stockQuantity} / Seuil : ${p.minStock}<br>
          Catégorie : ${p.category.name}
        </li>
      `).join('')}
    </ul>
  `
}

checkStockAlerts()
  .catch(console.error)
  .finally(() => process.exit())
```

**Cron job (tous les jours à 9h) :**
```bash
0 9 * * * cd /path/to/backend && node dist/scripts/check-stock-alerts.js
```

---

## 🔒 Audit Log

### Middleware d'audit

```typescript
// src/infrastructure/audit/auditLog.ts
export async function auditLog(
  userId: string | undefined,
  action: string,
  entity: string,
  entityId: string,
  oldValue: any | null,
  newValue: any | null,
  req?: Request
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      ipAddress: req?.ip,
      userAgent: req?.headers['user-agent']
    }
  })
}
```

### Utilisation dans un Use Case

```typescript
// CreateProductUseCase.ts
async execute(data: CreateProductDTO, userId: string, req: Request) {
  const product = await this.productRepo.create(data)
  
  // Log audit
  await auditLog(
    userId,
    'CREATE_PRODUCT',
    'Product',
    product.id,
    null,
    product,
    req
  )
  
  return product
}
```

---

## 📱 Logiciel métier (Back-office)

### Nouveau projet React

```
forge-fitness-backoffice/    [NOUVEAU PROJET À CRÉER]
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/
│   │   ├── client.ts           # Client API (fetch/axios)
│   │   ├── auth.ts             # Login, logout
│   │   ├── products.ts         # CRUD produits
│   │   ├── orders.ts           # Gestion commandes
│   │   └── users.ts            # Gestion utilisateurs
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Products/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductCreate.tsx
│   │   │   └── ProductEdit.tsx
│   │   ├── Orders/
│   │   │   ├── OrderList.tsx
│   │   │   └── OrderDetails.tsx
│   │   ├── Users/
│   │   │   ├── UserList.tsx
│   │   │   └── UserDetails.tsx
│   │   └── Analytics/
│   │       ├── Sales.tsx
│   │       └── Stock.tsx
│   ├── components/
│   │   ├── Layout/
│   │   ├── Forms/
│   │   └── Tables/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   └── types/
│       └── api.ts
```

### Stack technique recommandée

- **Framework** : React + TypeScript
- **Build** : Vite
- **Routing** : React Router
- **State management** : TanStack Query (React Query)
- **UI Components** : Shadcn/ui ou Mantine
- **Forms** : React Hook Form + Zod
- **Charts** : Recharts
- **Tables** : TanStack Table
- **Notifications** : Sonner

### Configuration API client

```typescript
// src/api/client.ts
const API_URL = 'https://api.forgefitness.fr'

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('authToken')
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers
    }
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Une erreur est survenue')
  }
  
  return response.json()
}
```

### Exemple : Création de produit

```typescript
// src/api/products.ts
export async function createProduct(data: CreateProductDTO) {
  return apiRequest<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

// src/pages/Products/ProductCreate.tsx
export function ProductCreate() {
  const navigate = useNavigate()
  const mutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success('Produit créé avec succès')
      navigate('/products')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      mutation.mutate(Object.fromEntries(formData))
    }}>
      {/* Formulaire */}
    </form>
  )
}
```

---

## 🚀 Plan de développement (6 semaines)

### Semaine 1 : Fondations
- [x] Migration Prisma complète (Product, Category, Order, etc.)
- [x] Création des repositories Prisma
- [x] DTOs et validation Zod
- [x] Middleware de rôles (requireRole)

### Semaine 2 : CRUD Produits
- [ ] Use Cases produits (Create, Update, List, Get, Delete)
- [ ] Controllers produits
- [ ] Routes API `/api/products`
- [ ] Tests Postman/Insomnia

### Semaine 3 : Gestion Stock
- [ ] Use Cases stock (Adjust, List movements)
- [ ] Job CRON alertes stock
- [ ] Audit log automatique
- [ ] Tests stock

### Semaine 4 : Commandes & Paiement
- [ ] Use Case création commande
- [ ] Intégration Stripe (PaymentIntent)
- [ ] Webhook Stripe
- [ ] Génération facture PDF (PDFKit ou Puppeteer)
- [ ] Tests paiement

### Semaine 5 : Interface mobile
- [ ] Écrans boutique mobile (liste, détails, panier)
- [ ] Intégration Stripe SDK mobile
- [ ] Historique commandes
- [ ] Tests utilisateur

### Semaine 6 : Logiciel métier + Finitions
- [ ] Setup projet React back-office
- [ ] Pages CRUD produits
- [ ] Pages gestion commandes
- [ ] Dashboard analytics
- [ ] Tests de charge backend
- [ ] Documentation API (Swagger/OpenAPI)
- [ ] Déploiement

---

## 📦 Déploiement

### Architecture de déploiement

1. **Backend API**
   - URL : `api.forgefitness.fr`
   - Plateforme : Railway / Render / VPS
   - Base de données : PostgreSQL (Supabase / Railway)
   - Redis : Redis Cloud ou Railway

2. **App Mobile**
   - iOS : App Store
   - Android : Google Play Store

3. **Logiciel métier**
   - URL : `admin.forgefitness.fr`
   - Plateforme : Vercel / Netlify
   - Build : React SPA

### Variables d'environnement backend

```env
# Database
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# JWT
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
JWT_EXPIRY="7d"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLIC_KEY="pk_live_..."

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="..."
SMTP_PASS="..."
SMTP_FROM="noreply@forgefitness.fr"

# App
NODE_ENV="production"
PORT=3001
FRONTEND_URL="https://forgefitness.fr"
ADMIN_URL="https://admin.forgefitness.fr"

# Storage (images)
S3_BUCKET="forgefitness-products"
S3_REGION="eu-west-1"
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
```

---

## ⚖️ Conformité légale

### TVA
- ✅ Afficher prix TTC et HT
- ✅ Mentionner le taux de TVA appliqué
- ✅ Calculer automatiquement : `priceTTC = priceHT * (1 + tvaRate/100)`

### Facturation
- ✅ Numérotation continue et non modifiable
- ✅ Conservation 10 ans (backups S3)
- ✅ Mention obligatoire : numéro SIRET, TVA intra, adresse

### RGPD
- ✅ Données limitées au strict nécessaire
- ✅ Pas de carte bancaire stockée (Stripe PCI-DSS)
- ✅ Droit d'accès, rectification, suppression
- ✅ Cookie consent (si tracking analytics)

### Étiquetage produits
- Si produits alimentaires : mentionner ingrédients et allergènes
- Afficher dans `Product.description`

---

## 📊 Rapports et analytics

### Métriques clés à suivre

1. **Chiffre d'affaires**
   - CA total
   - CA par catégorie
   - CA par période (jour, semaine, mois)

2. **Produits**
   - Top 10 ventes
   - Produits en rupture
   - Marge brute par produit

3. **Commandes**
   - Nombre de commandes
   - Panier moyen
   - Taux de conversion

4. **Stock**
   - Valeur du stock
   - Rotation du stock
   - Produits dormants

### Endpoint analytics

```typescript
// GET /api/analytics/sales?from=2025-01-01&to=2025-01-31
router.get('/analytics/sales',
  authMiddleware,
  requireRole(['ADMIN', 'COACH']),
  async (req, res) => {
    const { from, to } = req.query
    
    const stats = await prisma.order.aggregate({
      where: {
        status: 'paid',
        paidAt: {
          gte: new Date(from),
          lte: new Date(to)
        }
      },
      _sum: { totalTTC: true },
      _count: true,
      _avg: { totalTTC: true }
    })
    
    res.json({
      totalRevenue: stats._sum.totalTTC,
      orderCount: stats._count,
      averageBasket: stats._avg.totalTTC
    })
  }
)
```

---

## 🔐 Sécurité

### Checklist de sécurité

- [x] Authentification JWT avec refresh tokens
- [x] Contrôle d'accès basé sur les rôles (RBAC)
- [x] Validation des entrées (Zod)
- [x] Rate limiting (express-rate-limit)
- [x] CORS configuré correctement
- [x] Helmet.js pour headers sécurisés
- [x] Pas de données sensibles dans les logs
- [x] Webhook Stripe avec signature vérifiée
- [x] Audit log pour toutes les actions sensibles
- [x] Backups automatiques et testés
- [ ] Scan de vulnérabilités (npm audit, Snyk)
- [ ] Tests de pénétration avant production

### Rate limiting

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max
  message: 'Trop de requêtes, réessayez plus tard'
})

app.use('/api/', limiter)
```

---

## 📚 Documentation API

### Swagger / OpenAPI

Installer :
```bash
npm install swagger-ui-express swagger-jsdoc
```

Configuration :
```typescript
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'

const specs = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ForgeFitness API',
      version: '1.0.0'
    }
  },
  apis: ['./src/interface/http/routes/*.ts']
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
```

Accès documentation : `http://api.forgefitness.fr/api-docs`

---

## 🧪 Tests

### Stack de tests

- **Unit tests** : Jest + ts-jest
- **Integration tests** : Supertest
- **E2E tests** : Playwright (mobile) / Cypress (web)

### Exemple de test

```typescript
describe('Product API', () => {
  it('should create a product as admin', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Shaker 700ml',
        slug: 'shaker-700ml',
        categoryId: 'xxx',
        priceHT: 9.99,
        tvaRate: 20,
        sku: 'SHAKER-700',
        stockQuantity: 50
      })
      .expect(201)
    
    expect(response.body.name).toBe('Shaker 700ml')
  })
  
  it('should reject product creation as user', async () => {
    await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({...})
      .expect(403)
  })
})
```

---

## ✅ Checklist finale avant production

### Backend
- [ ] Toutes les migrations Prisma sont appliquées
- [ ] Tous les endpoints sont testés
- [ ] Rate limiting activé
- [ ] CORS configuré pour mobile + admin
- [ ] Variables d'environnement en production
- [ ] Logs configurés (Winston, Pino)
- [ ] Monitoring (Sentry, DataDog)
- [ ] Backups automatiques testés
- [ ] SSL/TLS activé (HTTPS)

### Mobile
- [ ] Intégration Stripe testée (sandbox puis live)
- [ ] Gestion des erreurs réseau
- [ ] Mode offline (cache local)
- [ ] Notifications push configurées
- [ ] App store metadata + screenshots

### Logiciel métier
- [ ] Authentification fonctionnelle
- [ ] Toutes les pages CRUD testées
- [ ] Analytics fonctionnels
- [ ] Responsive design
- [ ] Déploiement sur Vercel/Netlify

### Légal
- [ ] Mentions légales
- [ ] CGV (Conditions Générales de Vente)
- [ ] Politique de confidentialité (RGPD)
- [ ] Politique de cookies
- [ ] Formulaire de contact / support

---

## 📞 Support & Maintenance

### Maintenance régulière

- **Quotidien** : Vérifier les logs d'erreur, les alertes stock
- **Hebdomadaire** : Analyser les métriques (CA, commandes)
- **Mensuel** : Mettre à jour les dépendances npm, audit de sécurité
- **Trimestriel** : Revue des backups, tests de restauration

### Contact support technique

Pour toute question technique sur cette implémentation :
- Email : dev@forgefitness.fr
- Documentation : Cette fiche + README.md
- Code source : GitHub (privé)

---

**Dernière mise à jour** : 26 janvier 2025
**Version** : 1.0
**Auteur** : Équipe ForgeFitness

