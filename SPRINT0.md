# Forge Fitness Mobile - Sprint 0 Setup

## ✅ Sprint 0 Status

Sprint 0 complété ! Voici ce qui a été mis en place :

### Structure & Monorepo
- ✅ `pnpm-workspace.yaml` à la racine
- ✅ Root `package.json` avec scripts centralisés
- ✅ Lockfile unique (`pnpm-lock.yaml` à la racine)
- ✅ `.gitignore` consolidé

### Backend
- ✅ Clean Architecture (DI, Prisma, Fastify)
- ✅ DI Container (Awilix) correctement configuré
- ✅ TypeScript : tous les types déclarés
- ✅ Endpoint `/health` fonctionnel
- ✅ Build `pnpm build:backend` réussie

### CI/CD
- ✅ `.github/workflows/backend-ci.yml` créé
- ✅ Backend build test automatisé sur PR/push

### Environment
- ✅ `backend/.env.example` pour développement local
- ✅ `.env` et `.env.local` ignorés par Git

---

## 🚀 Quick Start (Dev Local)

### Prerequisites
- Node.js 20+
- pnpm 9.12+
- Docker (pour Postgres + MinIO)

### Installation
```bash
cd /path/to/forge-fitness-mobile

# Install all dependencies (creates pnpm-lock.yaml at root)
pnpm install

# Generate Prisma client
pnpm prisma:generate
```

### Backend Dev
```bash
# Start development server (watches changes)
pnpm dev:backend

# Test
curl http://localhost:3001/health
# Response: {"ok":true,"ts":1234567890}
```

### Build
```bash
pnpm build:backend
```

---

## 📋 Workspace Scripts

Available at root (`package.json`):

```bash
pnpm dev:backend      # Start backend in watch mode
pnpm build:backend    # Compile backend (tsc)
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations (dev)
pnpm install:all      # Alias for pnpm install
```

---

## 📁 Structure

```
forge-fitness-mobile/
├── backend/
│   ├── src/
│   │   ├── application/    # Use cases
│   │   ├── core/           # Domain errors, types
│   │   ├── di/             # Dependency Injection
│   │   ├── domain/         # Business logic ports
│   │   ├── infrastructure/ # Database, mail, logging
│   │   ├── interface/      # HTTP controllers, routes, DTOs
│   │   ├── app.ts          # Fastify app builder
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── .env.example        # Template (no secrets)
│   └── package.json
├── apps/
│   ├── androidApp/
│   └── iosApp/
├── infra/
│   └── docker-compose.yml
├── shared/
├── .github/
│   └── workflows/
│       └── backend-ci.yml
├── package.json            # Root workspace
├── pnpm-workspace.yaml
└── .gitignore
```

---

## 🔄 CI/CD Pipeline (Sprint 0)

**Backend CI** (`.github/workflows/backend-ci.yml`)
- Triggers: Push to `backend/**` or PR with changes in `backend/**`
- Steps:
  1. Checkout code
  2. Setup Node 20 + pnpm 9
  3. `pnpm install` (cache enabled)
  4. Copy `.env.example` → `.env`
  5. `pnpm prisma:generate`
  6. `pnpm build:backend`

**Mobile CI** → Deferred to Sprint 1

---

## 📦 Environment (Backend)

### Local Development (`.env`)
Use `backend/.env.example` as template. For Sprint 0, local values are OK:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/forge?schema=public"
JWT_SECRET="change-me-very-long"
MAIL_SMTP_HOST="localhost"
MAIL_SMTP_PORT=1025
S3_ENDPOINT="http://localhost:9000"
S3_BUCKET="forgefitness-mobile-media"
S3_ACCESS_KEY="minioadmin"
S3_SECRET_KEY="minioadmin"
PORT=3001
```

### Vault (Sprint 2+)
Secrets management via Vault will be integrated in Sprint 2.

---

## 🚧 Deferred (Sprint 1+)

- [ ] Vault integration (secrets management)
- [ ] Mobile CI/CD (iOS/Android builds)
- [ ] Linting/ESLint/Prettier (Sprint 1, optional)
- [ ] API documentation (OpenAPI/Swagger)

---

## ✨ Next Steps (Sprint 1)

1. **Authentication Endpoints** (already stubbed)
   - `POST /auth/issue` - Issue activation key
   - `POST /auth/activate` - Activate with key + bind device

2. **Profile Endpoints** - User CRUD + profile update

3. **Mobile CI/CD** - Xcode + Gradle builds

4. **Testing** - Unit + integration tests

---

## 📝 Notes

- TypeScript strict mode enabled
- ESM modules (Node.js native)
- Fastify for HTTP (lightweight, performant)
- Prisma for ORM (type-safe)
- Awilix for DI (CLASSIC mode)
- Zod for schema validation

---

**Version**: 0.1.0  
**Status**: ✅ Sprint 0 Complete
