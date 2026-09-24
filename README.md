# Requirements Wizard

A dynamic, AI-driven software requirements specification and document export platform engineered under the **Spec-Driven Agentic Development (SDAD)** framework.

---

## 🎯 Architecture & SDAD DAG Workflow

The platform follows a strict Directed Acyclic Graph (DAG) development progression. All 5 phases are fully implemented, verified, and active in the live environment:

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
└────────────────────────────────────────────────────────┘
```

**Cumulative Automated Test Suite:** **255 / 255 passing assertions across 5 verification test suites (100% pass rate).**

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 App Router (React 18, Server Components, isolated Server Actions)
- **Styling:** Tailwind CSS + Shadcn UI component system
- **Database:** PostgreSQL 18 with native JSONB state storage
- **ORM & Data Modeling:** Prisma ORM (PSL Contracts, WASM engine)
- **Validation:** Zod runtime schema guards
- **Specification Standard:** IEEE Std 830-1998 / ISO/IEC/IEEE 29148
- **Governance:** Role-Based Access Control (RBAC), SHA-256 cryptographic seals, chronological audit logging, and historical rollback

---

## 📁 Repository Structure

```
Requirements_Wizard/
├── project-spec.md            # Formal SDAD project specification & DAG blueprint (v1.4.0)
├── prisma.config.ts           # Prisma configuration
├── components.json            # Shadcn UI configuration
├── tailwind.config.ts         # Tailwind design system & theme configuration
├── .env.example               # Environment variables template
├── prisma/
│   └── schema.prisma          # PostgreSQL database schema (Users, Drafts, Files, Audit)
├── scripts/
│   ├── ensure-db.ts           # PostgreSQL healthcheck, migrations, and audit table setup
│   ├── test-phase1.ts         # Phase 1 verification: DB, JSONB mutation, file references
│   ├── test-phase2.ts         # Phase 2 verification: Wizard engine, archetype rules, autosave
│   ├── test-phase3.ts         # Phase 3 verification: AI ambiguity scoring, Gherkin scenarios
│   ├── test-phase4.ts         # Phase 4 verification: IEEE 830 Markdown, JSON, HTML export
│   └── test-phase5.ts         # Phase 5 verification: RBAC, auditing, diffs, SHA-256 seals
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
    │   │           └── page.tsx # Executive View, Markdown, JSON, and Audit Trail tabs
    ├── components/
    │   ├── export/
    │   │   └── DocumentExportViewer.tsx # Interactive viewer with copy, download & print
    │   ├── governance/
    │   │   ├── AuditTrailViewer.tsx     # Chronological timeline with visual diff cards & rollback
    │   │   └── GovernanceBar.tsx        # Status badge, role switcher, sign-off & lock controls
    │   ├── ui/                # Shadcn UI primitives (button, card, badge, input, tabs, etc.)
    │   └── wizard/            # 6-stage wizard components, AI copilot, conditional guidance
    ├── lib/
    │   ├── ai/                # Ambiguity scoring, Gherkin generator, context ingestion
    │   ├── conditional-logic/ # Real-time rule evaluation engine
    │   ├── export/            # Multi-format IEEE 830 compilation facade
    │   └── governance/        # RBAC matrix, diff engine, audit logger, sign-off state machine
    └── types/
        └── wizard.ts          # TypeScript domain contracts and initial form state
```

---

## 🚀 Quick Start & Verification

### 1. Database Initialization
```bash
npm run db:start
```

### 2. Execute Cumulative Test Suite
```bash
npm test
# Or run individual phase suites:
# npm run test:phase1
# npm run test:phase2
# npm run test:phase3
# npm run test:phase4
# npm run test:phase5
```

### 3. Start Development Server
```bash
npm run dev
# Open http://localhost:3000
```
