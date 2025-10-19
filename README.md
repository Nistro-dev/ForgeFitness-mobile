# Forge Fitness Mobile

A modern, scalable mobile fitness platform built with Kotlin Multiplatform (KMM), TypeScript backend, and PostgreSQL.

## 🎯 Project Overview

**Forge Fitness Mobile** is a cross-platform fitness application with:
- 📱 Native iOS & Android apps (Kotlin Multiplatform)
- 🔧 Type-safe backend (TypeScript + Fastify)
- 🗄️ PostgreSQL database with Prisma ORM
- 👥 User authentication & role-based access
- 🎨 Clean Architecture principles throughout

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+ 
- **pnpm** 9.12+
- **Docker** (Postgres + MinIO for local dev)

### Setup
```bash
# Clone and install
git clone <repo>
cd forge-fitness-mobile
pnpm install

# Generate Prisma types
pnpm prisma:generate

# Start backend dev server
pnpm dev:backend

# Test
curl http://localhost:3001/health
```

For more details, see [SPRINT0.md](./SPRINT0.md).

## 📁 Project Structure

```
forge-fitness-mobile/
├── backend/                # TypeScript/Fastify API
│   └── src/
│       ├── application/    # Use cases
│       ├── domain/         # Business logic
│       ├── infrastructure/ # DB, mail, S3
│       └── interface/      # HTTP controllers
├── apps/
│   ├── androidApp/        # Android app (KMM)
│   └── iosApp/            # iOS app (KMM)
├── shared/                # KMM shared code
├── infra/                 # Docker services (Postgres, MinIO)
├── package.json           # Root workspace
└── pnpm-workspace.yaml    # pnpm monorepo config
```

## 📚 Documentation

- **[SPRINT0.md](./SPRINT0.md)** - Sprint 0 setup & architecture
- **Backend API** - (TBD: OpenAPI docs)
- **Mobile** - See `/apps` README files

## 🔧 Development

### Backend Scripts
```bash
pnpm dev:backend          # Start in watch mode
pnpm build:backend        # Compile TypeScript
pnpm prisma:generate      # Generate Prisma client
pnpm prisma:migrate       # Run migrations
```

### Mobile
- Open `apps/androidApp` or `apps/iosApp` in native IDEs (Android Studio / Xcode)
- KMM shared code in `shared/`

## 🏗️ Architecture

### Backend (Clean Architecture)
- **Application**: Use cases (business logic)
- **Domain**: Interfaces (ports), entities
- **Infrastructure**: Implementations (Prisma, Nodemailer, S3)
- **Interface**: HTTP controllers, DTOs, routes

### Mobile (KMM)
- Shared business logic in `shared/`
- Native UI in `androidApp/` and `iosApp/`

## 🔐 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Device binding
- Rate limiting
- CORS headers

Vault for secrets management (Sprint 2+).

## 📊 CI/CD

- **Backend CI**: `.github/workflows/backend-ci.yml`
  - Runs on: Push/PR to `backend/**`
  - Checks: Type safety, build success
- **Mobile CI**: (Sprint 1+)

## 🗄️ Database

**PostgreSQL** with **Prisma ORM**
- Migrations in `backend/prisma/migrations/`
- Schema in `backend/prisma/schema.prisma`
- Type-safe queries with auto-generated types

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| **Mobile** | Kotlin Multiplatform |
| **Backend** | Node.js, TypeScript, Fastify |
| **API** | REST (JSON) |
| **Database** | PostgreSQL + Prisma |
| **DI** | Awilix |
| **Validation** | Zod |
| **Auth** | JWT |
| **Logging** | Pino |
| **Storage** | MinIO (S3-compatible) |

## 🛣️ Roadmap

### ✅ Sprint 0 (Current)
- [x] Monorepo setup (pnpm)
- [x] Backend scaffolding
- [x] CI/CD pipeline (backend)
- [x] DI & dependency injection
- [x] Authentication use cases (stubbed)

### 📋 Sprint 1
- [ ] Complete auth endpoints
- [ ] Profile management
- [ ] Mobile CI/CD
- [ ] Unit testing

### 🚀 Sprint 2+
- [ ] Vault integration
- [ ] Advanced features
- [ ] Performance optimization

## 🤝 Contributing

(TBD: Contribution guidelines)

## 📄 License

(TBD: License info)

---

**Status**: 🚧 Active Development (Sprint 0 Complete)
