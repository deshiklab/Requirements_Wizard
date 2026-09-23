# Requirements Wizard

A dynamic, AI-driven software requirements elicitation platform engineered under the **Spec-Driven Agentic Development (SDAD)** framework.

---

## 🎯 Architecture & SDAD DAG Workflow

The platform follows a strict Directed Acyclic Graph (DAG) development progression:

```
┌────────────────────────────────────────┐
│  Phase 1: Database & Environment       │  <-- [COMPLETED & VERIFIED]
└──────────────────┬─────────────────────┘
                   │ Explicit Human Approval Gate
                   ▼
┌────────────────────────────────────────┐
│  Phase 2: Multi-Stage Wizard Form      │  <-- [NEXT PHASE]
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│  Phase 3: AI-Assisted Elicitation      │
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│  Phase 4: Document Generation & Export │
└──────────────────┬─────────────────────┘
                   ▼
┌────────────────────────────────────────┐
│  Phase 5: Verification & Governance    │
└────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Framework:** Next.js 14 App Router (React 18, Server Components, isolated Server Actions)
- **Styling:** Tailwind CSS + Shadcn UI component system
- **Database:** PostgreSQL 18 with native JSONB state storage
- **ORM & Data Modeling:** Prisma ORM (PSL Contracts, WASM engine)
- **Validation:** Zod 4 runtime schema guards

---

## 📁 Repository Structure

```
Requirements_Wizard/
├── project-spec.md            # Formal SDAD project specification & DAG blueprint
├── prisma.config.ts           # Prisma configuration
├── components.json            # Shadcn UI configuration
├── tailwind.config.ts         # Tailwind design system & theme configuration
├── .env.example               # Environment variables template
├── prisma/
│   └── schema.prisma          # PostgreSQL database schema (Users, Drafts, Files)
├── scripts/
│   ├── ensure-db.ts           # PostgreSQL database healthcheck and initialization
│   └── test-phase1.ts         # Phase 1 verification test suite (writes & reads mock drafts)
└── src/
    ├── actions/
    │   ├── drafts.ts          # Isolated Next.js Server Actions (saveDraftAction, getDraftAction, etc.)
    │   └── users.ts           # User authentication & registration actions
    ├── app/
    │   ├── globals.css        # Tailwind & Shadcn CSS variables
    │   ├── layout.tsx         # Next.js 14 Root layout
    │   └── page.tsx           # Live status dashboard with database metrics & DAG progress
    ├── components/
    │   └── ui/                # Shadcn UI primitives (button, card, badge, input, label, etc.)
    ├── lib/
    │   ├── db.ts              # Database connection singleton
    │   └── utils.ts           # Tailwind merge utility (cn)
    └── prisma/
        ├── contract.prisma    # PSL source contract
        ├── contract.json      # Compiled contract metadata
        └── contract.d.ts      # Type definitions for Prisma runtime
```

---

## 🚀 Quick Start

### 1. Environment & Database Setup
```bash
# PostgreSQL runs locally on port 5432
npm run db:start

# Emit contract & sync schema
npm run db:emit
npm run db:update
```

### 2. Run Phase 1 Verification Test Suite
```bash
npm test
# or
npm run test:phase1
```

### 3. Start Development Server
```bash
npm run dev
# Open http://localhost:3000
```
