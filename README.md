# Requirements Wizard

A dynamic, AI-driven software requirements specification, architecture diagram, and document export platform engineered under the **Spec-Driven Agentic Development (SDAD)** framework.

[![CI/CD Pipeline](https://github.com/deshiklab/Requirements_Wizard/actions/workflows/ci.yml/badge.svg)](https://github.com/deshiklab/Requirements_Wizard/actions/workflows/ci.yml)
[![PR #1](https://img.shields.io/badge/PR-%231%20Open-blue.svg)](https://github.com/deshiklab/Requirements_Wizard/pull/1)
[![Tests Passing](https://img.shields.io/badge/tests-303%20passed-brightgreen.svg)](https://github.com/deshiklab/Requirements_Wizard)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2%20App%20Router-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌐 Live Application & Links

- **Pull Request:** [GitHub PR #1 (Full SDAD Implementation)](https://github.com/deshiklab/Requirements_Wizard/pull/1)
- **Active Working Branch:** [`arena/01a0cd80-requirements-wizard`](https://github.com/deshiklab/Requirements_Wizard/tree/arena/01a0cd80-requirements-wizard)
- **Live Preview URL:** [`https://3000-iv922jlyfrwfec24l3ks5.e2b.app`](https://3000-iv922jlyfrwfec24l3ks5.e2b.app)

---

## 🎯 Architecture & SDAD DAG Workflow

The platform follows a strict Directed Acyclic Graph (DAG) development progression. All phases and the architecture diagram engine are fully implemented, verified, and active in the live environment:

```
┌────────────────────────────────────────────────────────┐
│  Phase 1: Database, Schema & Environment               │  <-- [COMPLETED & VERIFIED] (22/22 tests)
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 2: Multi-Stage Wizard Form & Logic Engine       │  <-- [COMPLETED & VERIFIED] (44/44 tests)
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 3: AI-Assisted Requirements Elicitation Engine  │  <-- [COMPLETED & VERIFIED] (52/52 tests)
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 4: Document Generation & IEEE 830 PRD Export    │  <-- [COMPLETED & VERIFIED] (58/58 tests)
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 5: Governance, Auditing, RBAC & Hardening       │  <-- [COMPLETED & VERIFIED] (79/79 tests)
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  Phase 6: Mermaid.js Architecture Diagram Engine       │  <-- [COMPLETED & VERIFIED] (48/48 tests)
└────────────────────────────────────────────────────────┘
```

**Cumulative Automated Test Suite:** **303 / 303 passing assertions across 6 verification test suites (100% pass rate).**

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 App Router (React 18, Server Components, isolated Server Actions)
- **Styling:** Tailwind CSS + Shadcn UI component system
- **Database:** PostgreSQL 18 with native JSONB state storage
- **ORM & Data Modeling:** Prisma ORM (PSL Contracts, WASM engine)
- **Diagram Engine:** Mermaid.js (C4 Container, Sequence Workflow, ER Data Model, Governance State Machine)
- **Validation:** Zod runtime schema guards
- **Specification Standard:** IEEE Std 830-1998 / ISO/IEC/IEEE 29148
- **Governance:** Role-Based Access Control (RBAC), SHA-256 cryptographic seals, chronological audit logging, and historical rollback
- **Containerization & CI/CD:** Docker multi-stage build, Docker Compose, GitHub Actions

---

## 📁 Repository Structure

```
Requirements_Wizard/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD (Lint, 303 Tests, Next Build, Docker)
├── Dockerfile                 # Multi-stage production container build (Node.js 20-alpine)
├── docker-compose.yml         # Containerized Next.js + PostgreSQL 16 orchestration
├── docker-entrypoint.sh       # Database connectivity check & automatic schema sync
├── project-spec.md            # Formal SDAD project specification & DAG blueprint (v1.5.0)
├── prisma.config.ts           # Prisma configuration
├── components.json            # Shadcn UI configuration
├── tailwind.config.ts         # Tailwind design system & theme configuration
├── prisma/
│   └── schema.prisma          # PostgreSQL database schema (Users, Drafts, Files, Audit)
├── scripts/
│   ├── ensure-db.ts           # PostgreSQL healthcheck, migrations, and audit table setup
│   ├── test-phase1.ts         # Phase 1 verification: DB, JSONB mutation, file references
│   ├── test-phase2.ts         # Phase 2 verification: Wizard engine, archetype rules, autosave
│   ├── test-phase3.ts         # Phase 3 verification: AI ambiguity scoring, Gherkin scenarios
│   ├── test-phase4.ts         # Phase 4 verification: IEEE 830 Markdown, JSON, HTML export
│   ├── test-phase5.ts         # Phase 5 verification: RBAC, auditing, diffs, SHA-256 seals
│   └── test-phase6-diagrams.ts# Phase 6 verification: Mermaid.js C4, sequence, ER & state diagrams
└── src/
    ├── actions/
    │   ├── ai.ts              # AI elicitation, ambiguity detector, Gherkin server actions
    │   ├── drafts.ts          # Multi-stage form persistence with RBAC & immutability guards
    │   ├── export.ts          # Multi-format document generation and export actions
    │   ├── governance.ts      # Sign-off, locking, reopening, rollback, audit trail actions
    │   ├── schemas.ts         # Comprehensive Zod runtime contracts for all server actions
    │   └── users.ts           # User creation, retrieval, and role management actions
    ├── app/
    │   ├── globals.css        # Tailwind & Shadcn CSS variables
    │   ├── layout.tsx         # Next.js 14 Root layout
    │   ├── page.tsx           # Dashboard with DAG progress, metrics, and draft governance badges
    │   ├── wizard/
    │   │   ├── page.tsx       # Launch new specification session
    │   │   └── [id]/
    │   │       ├── page.tsx   # Dynamic draft resumption with Governance Bar & Audit Drawer
    │   │       └── export/
    │   │           └── page.tsx # Executive View, Diagrams, Markdown, JSON, and Audit tabs
    ├── components/
    │   ├── diagrams/
    │   │   └── MermaidViewer.tsx        # Interactive Mermaid viewer (C4, Sequence, ER, State)
    │   ├── export/
    │   │   └── DocumentExportViewer.tsx # Interactive viewer with copy, download, diagrams & print
    │   ├── governance/
    │   │   ├── AuditTrailViewer.tsx     # Chronological timeline with visual diff cards & rollback
    │   │   └── GovernanceBar.tsx        # Status badge, role switcher, sign-off & lock controls
    │   ├── ui/                # Shadcn UI primitives (button, card, badge, input, tabs, etc.)
    │   └── wizard/            # 6-stage wizard components, AI copilot, conditional guidance
    ├── lib/
    │   ├── ai/                # Ambiguity scoring, Gherkin generator, context ingestion
    │   ├── conditional-logic/ # Real-time rule evaluation engine
    │   ├── diagrams/          # Mermaid architecture synthesis (C4, sequence, ER, state)
    │   ├── export/            # Multi-format IEEE 830 compilation facade
    │   └── governance/        # RBAC matrix, diff engine, audit logger, sign-off state machine
    └── types/
        └── wizard.ts          # TypeScript domain contracts and initial form state
```

---

## 🐳 Docker & Container Deployment

### Option 1: Docker Compose (Full Stack with PostgreSQL)

Spin up both the Next.js application and a persistent PostgreSQL database with a single command:

```bash
docker compose up --build
```

- Application URL: `http://localhost:3000`
- PostgreSQL Port: `5432`
- Health checks automatically ensure the database is fully initialized before the application begins serving traffic.

To stop and remove containers:
```bash
docker compose down -v
```

### Option 2: Standalone Docker Container

Build and run the production image using an external database (e.g. Neon, Supabase, AWS RDS):

```bash
# 1. Build the production Docker image
docker build -t requirements-wizard:latest .

# 2. Run the container with your PostgreSQL connection string
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require" \
  requirements-wizard:latest
```

---

## ☁️ Cloud Platform Deployment (Vercel / Railway / Render)

### 1-Click Deploy to Vercel

1. Fork or import [`deshiklab/Requirements_Wizard`](https://github.com/deshiklab/Requirements_Wizard) into [Vercel](https://vercel.com/new).
2. Set the root directory to `./` and branch to `arena/01a0cd80-requirements-wizard` (or `main` after merging [PR #1](https://github.com/deshiklab/Requirements_Wizard/pull/1)).
3. In **Environment Variables**, provide:
   ```env
   DATABASE_URL="postgresql://user:password@your-postgres-host:5432/requirements_wizard"
   ```
4. Click **Deploy**. Vercel will build and host the Next.js App Router application with edge global CDN distribution.

---

## 🧪 Cumulative Verification Suite (303 Tests)

Execute the full SDAD verification protocol:

```bash
# Run all 6 verification test suites (Phase 1 through Phase 6):
npm test

# Or run individual test phases:
npm run test:phase1    # Database, JSONB mutations & PSL contract (22 checks)
npm run test:phase2    # Multi-stage form & dynamic rule engine (44 checks)
npm run test:phase3    # AI ambiguity scorer & Gherkin generator (52 checks)
npm run test:phase4    # IEEE 830 Markdown, JSON Schema & HTML exporter (58 checks)
npm run test:phase5    # RBAC matrix, SHA-256 seals & audit rollback (79 checks)
npm run test:diagrams  # Mermaid.js C4, Sequence, ER & State diagrams (48 checks)
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Ensure database is running & tables are initialized
npm run db:start

# 3. Start development server
npm run dev
# Browse to http://localhost:3000
```
