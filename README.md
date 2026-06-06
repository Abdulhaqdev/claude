# Nexus — Wholesale ERP + CRM + WMS Platform

A production-ready, enterprise-grade SaaS platform for clothing wholesale companies. Built with Next.js, PostgreSQL, Redis, and a modular monolith architecture.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-teal)

## Features

### ERP
Product catalog, categories, suppliers, purchases, sales, invoices, expenses, finance dashboard, revenue analytics

### CRM
Customer management, lead tracking, deal pipeline (Kanban), notes, activity timeline, follow-up reminders

### WMS
Multi-warehouse management, zones/shelves, inventory tracking, barcode support, transfers, dispatch, receiving, low stock alerts

### Platform
JWT auth + refresh tokens, RBAC (7 roles), audit logging, Redis caching, BullMQ job queues, command palette (⌘K), dark mode

## Quick Start

```bash
# Install
npm install

# Start database & cache
docker compose up postgres redis -d

# Setup database
npm run db:push
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials:** `admin@demo.com` / `Password123!`

> **Database:** Default connection uses your local PostgreSQL:
> ```
> postgresql://erp_user:StrongPassword123!@localhost:5432/erp_system
> ```
> If the user/database does not exist yet, create them first:
> ```bash
> psql -U postgres -f scripts/setup-database.sql
> npm run db:push && npm run db:seed
> ```
> Then restart the dev server.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Framer Motion |
| Backend | Server Actions, Route Handlers, Service Layer, Repository Pattern |
| Database | PostgreSQL 16, Prisma ORM |
| Cache/Queue | Redis 7, BullMQ |
| Auth | JWT + Refresh Tokens, RBAC |
| Infrastructure | Docker, Docker Compose, Nginx |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, Register
│   ├── (dashboard)/        # Protected routes
│   └── api/                # REST API
├── components/             # UI components
├── features/               # Feature modules (auth, erp, crm, wms)
├── lib/                    # Shared utilities
└── workers/                # Background jobs
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run worker` | Start BullMQ workers |
| `npm run docker:up` | Start full Docker stack |

## Production Deployment

```bash
# Configure environment
cp .env.example .env

# Build and deploy
docker compose up -d --build
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full documentation including:
- Database ERD
- Architecture decisions
- Scaling strategy
- Security recommendations
- VPS deployment guide
- Development roadmap

## License

Proprietary — All rights reserved.
