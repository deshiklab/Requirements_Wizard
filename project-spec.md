# Project Specification: AI-Driven Software Requirements Wizard
**Framework:** Spec-Driven Agentic Development (SDAD)  
**Repository:** `deshiklab/Requirements_Wizard`  
**Target Platform:** Next.js 14 (App Router) + PostgreSQL + Prisma ORM + Tailwind CSS / Shadcn UI  
**Document Status:** Formal Specification & Architecture Contract (v1.0.0)

---

## 1. Executive Summary & Vision

The **AI-Driven Requirements Wizard** is a full-stack platform engineered to transition ambiguous, multi-stakeholder software concepts into rigorous, verifiable, schema-compliant Software Requirements Specifications (SRS / PRD). Operating under the **Spec-Driven Agentic Development (SDAD)** framework, the platform relocates engineering discipline upstream into formal specification precision, explicit human sign-off gates, and deterministic state transitions.

Rather than producing unconstrained generative code or raw text blobs, the Wizard guides users through structured elicitation stages, persisting incomplete drafts to a relational database with native JSONB flexibility, linking uploaded context documents and architecture diagrams, and verifying each dependency through a strict Directed Acyclic Graph (DAG).

---

## 2. Architectural Blueprint & Technology Stack

```
 ┌─────────────────────────────────────────────────────────────┐
 │                Next.js 14 App Router UI                     │
 │   - Tailwind CSS + Shadcn UI Component System               │
 │   - Client Wizard State Machine & Form Progress Engine      │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Server Action Barrier
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │              Isolated Next.js Server Actions                │
 │   - Zod Strict Input Validation & Schema Guards             │
 │   - Authorization & Draft Ownership Verification            │
 │   - State Persistence & Cache Invalidation                 │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Prisma PSL & Typed Client
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                    Prisma ORM Layer                         │
 │   - Contract-driven PSL schema & WASM engine runtime        │
 │   - Native type mapping for JSONB fields                    │
 └──────────────────────────────┬──────────────────────────────┘
                                │ TCP Connection Pool
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                   PostgreSQL 18 Database                    │
 │   - Native JSONB document storage for form drafts           │
 │   - Relational referential integrity (Users, Files)        │
 │   - Cascade & SetNull constraints on deletion               │
 └─────────────────────────────────────────────────────────────┘
```

### 2.1 Core Technology Choices
1. **Application Framework:** Next.js 14 App Router (`src/app/`, Server Components, Server Actions).
2. **Design System:** Tailwind CSS with Shadcn UI component primitives (`@radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`).
3. **Database & Storage:** PostgreSQL 18 with native JSONB support for flexible multi-stage form drafts.
4. **ORM & Data Contract:** Prisma ORM with PSL contract authoring and type-safe query execution.
5. **Runtime Validation:** Zod schema validation for all Server Actions and form payloads.

---

## 3. Directed Acyclic Graph (DAG) Execution Model

To eliminate hallucinations and architectural drift, development follows a topological DAG ordering where downstream phases cannot be started until upstream phases have passed automated verification and received explicit human approval.

```
 [Phase 1: DB & Environment] (CURRENT - COMPLETED & VERIFIED)
             │
             ▼
 [Phase 2: Multi-Stage Wizard Form Engine] (Awaiting Human Approval)
             │
             ▼
 [Phase 3: AI-Assisted Elicitation Engine]
             │
             ▼
 [Phase 4: Document Generation & Export]
             │
             ▼
 [Phase 5: Governance, Auditing & Final Hardening]
```

### Phase Definitions:
- **Phase 1 (Database & Environment):** Initialize Next.js 14 App Router, Tailwind/Shadcn, PostgreSQL schema for users, multi-stage form drafts (JSONB), and file upload references. Verified with automated test suite.
- **Phase 2 (Multi-Stage Wizard Form Engine):** Build the interactive multi-step wizard UI (Project Overview, Personas, Functional Requirements, Non-Functional Requirements, Technical Constraints) with auto-saving server actions and validation.
- **Phase 3 (AI-Assisted Requirements Elicitation):** Implement structured LLM-driven elicitation prompts, context ingestion from uploaded file references, ambiguity scoring, and acceptance criteria generation.
- **Phase 4 (Document Generation & PRD Export):** Assemble completed draft states into IEEE 830-compliant Software Requirements Specifications, exportable to Markdown, JSON, and PDF formats.
- **Phase 5 (Governance & End-to-End Verification):** Role-based access controls, audit trail history for requirement diffs, and end-to-end integration test coverage.

---

## 4. Database Schema Specification

### 4.1 PSL Contract (`src/prisma/contract.prisma`)

```prisma
// use prisma-8

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      String   @default("user")
  createdAt TimestamptzString @default(now())
  updatedAt temporal.updatedAtString()
  drafts    FormDraft[]
  files     FileReference[]
}

model FormDraft {
  id           String   @id @default(uuid())
  title        String   @default("Untitled Requirements Spec")
  currentStep  Int      @default(1)
  status       String   @default("draft")
  data         Json
  stepProgress Json?
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  files        FileReference[]
  createdAt    TimestamptzString @default(now())
  updatedAt    temporal.updatedAtString()
}

model FileReference {
  id           String     @id @default(uuid())
  fileName     String
  originalName String
  mimeType     String
  fileSize     Int
  filePath     String
  metadata     Json?
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  draftId      String?
  draft        FormDraft? @relation(fields: [draftId], references: [id], onDelete: SetNull)
  createdAt    TimestamptzString @default(now())
  updatedAt    temporal.updatedAtString()
}
```

### 4.2 Field Rationale & Flexibility
1. **`FormDraft.data` (JSONB):** Enables dynamic elicitation fields without repetitive database migrations. Allows different project archetypes (e.g. mobile apps, distributed systems, internal tools) to store specialized requirements structures.
2. **`FormDraft.stepProgress` (JSONB):** Tracks wizard navigation states, step completion percentages, validation markers, and timestamps.
3. **`FileReference.metadata` (JSONB):** Encapsulates file-specific context, such as extracted text tokens, diagram entities, image resolutions, and cryptographic checksums for AI ingestion.

---

## 5. Next.js Server Action Interface

All data mutations are strictly executed through isolated Server Actions with Zod runtime validation:

- `saveDraftAction(input: SaveDraftInput): Promise<ActionResponse<FormDraft>>`
- `getDraftAction(draftId: string): Promise<ActionResponse<FormDraftWithFiles>>`
- `listUserDraftsAction(userId: string): Promise<ActionResponse<FormDraft[]>>`
- `attachFileReferenceAction(input: AttachFileInput): Promise<ActionResponse<FileReference>>`
- `getOrCreateUserAction(input: CreateUserInput): Promise<ActionResponse<User>>`

---

## 6. Phase 1 Verification Criteria & Test Protocol

The exit gate for Phase 1 requires:
1. Active PostgreSQL instance running on port 5432 with the database `requirements_wizard`.
2. Successfully emitted Prisma contract and applied migrations (`user`, `formDraft`, `fileReference`).
3. Automated test script (`scripts/test-phase1.ts`) executing with 0 failures:
   - Creating a user
   - Writing a multi-stage form draft with deeply nested JSONB structures
   - Attaching a file upload reference
   - Retrieving the draft and validating JSONB field values
   - Exercising Server Actions (`saveDraftAction`, `getDraftAction`, `listUserDraftsAction`) and Zod input rejection.
4. Clean Next.js 14 App Router compilation and build.
5. Explicit human review and approval before advancing to Phase 2.
