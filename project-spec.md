# Project Specification: AI-Driven Software Requirements Wizard
**Framework:** Spec-Driven Agentic Development (SDAD)  
**Repository:** `deshiklab/Requirements_Wizard`  
**Target Platform:** Next.js 14 (App Router) + PostgreSQL + Prisma ORM + Tailwind CSS / Shadcn UI  
**Document Status:** Formal Specification & Architecture Contract (v1.5.0)

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
 │   - AI Ambiguity Inspector & Gherkin Generator Drawers      │
 │   - Interactive IEEE 830 Export & Live Document Viewer      │
 │   - Governance Bar, RBAC Controls & Visual Audit Trail      │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Server Action Barrier
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │              Isolated Next.js Server Actions                │
 │   - Zod Strict Input Validation & Schema Guards             │
 │   - Least-Privilege RBAC & Immutability Enforcement         │
 │   - Field-Level Semantic Diff & Audit Trail Engine          │
 │   - AI Ambiguity & Gherkin Criteria Pipelines               │
 │   - Context Document Ingestion & Entity Extractors          │
 │   - IEEE 830 SRS Document Generation Engine                 │
 │   - Draft State Mutations & Atomic Cache Invalidation       │
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
 │   - Relational referential integrity (Users, Files, Audit)  │
 │   - Immutable auditLog table with SHA-256 seals & diffs     │
 │   - Cascade & SetNull constraints on deletion               │
 └─────────────────────────────────────────────────────────────┘
```

### 2.1 Core Technology Choices
1. **Application Framework:** Next.js 14 App Router (`src/app/`, Server Components, Server Actions).
2. **Design System:** Tailwind CSS with Shadcn UI component primitives (`@radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`).
3. **Database & Storage:** PostgreSQL 18 with native JSONB support for flexible multi-stage form drafts.
4. **ORM & Data Contract:** Prisma ORM with PSL contract authoring and type-safe query execution.
5. **Runtime Validation:** Zod schema validation for all Server Actions, form payloads, and AI inputs.
6. **AI Elicitation Engine:** Deterministic heuristic NLP analyzer, Gherkin scenario generator, and context document ingestor with offline resilience.
7. **Document Generation Engine:** Multi-format IEEE 830-1998 / ISO 29148 compiler for Markdown, JSON, and printable HTML/PDF.
8. **Governance & Auditing:** Least-privilege Role-Based Access Control (RBAC), field-level semantic diff engine, cryptographic SHA-256 draft sealing, and chronological audit log with revision rollback.

---

## 3. Directed Acyclic Graph (DAG) Execution Model

To eliminate hallucinations and architectural drift, development follows a topological DAG ordering where downstream phases cannot be started until upstream phases have passed automated verification and received explicit human approval.

```
 [Phase 1: DB & Environment] (COMPLETED & VERIFIED)
             │
             ▼
 [Phase 2: Multi-Stage Wizard & Conditional Logic] (COMPLETED & VERIFIED)
             │
             ▼
 [Phase 3: AI-Assisted Elicitation Engine] (COMPLETED & VERIFIED)
             │
             ▼
 [Phase 4: Document Generation & PRD Export] (COMPLETED & VERIFIED)
             │
             ▼
 [Phase 5: Governance, Auditing, RBAC & Hardening] (COMPLETED & VERIFIED)
```

### Phase Definitions:
- **Phase 1 (Database & Environment):** [COMPLETED] Initialize Next.js 14 App Router, Tailwind/Shadcn, PostgreSQL schema for users, multi-stage form drafts (JSONB), and file upload references. Verified with 22 automated test assertions.
- **Phase 2 (Multi-Stage Wizard Form Engine & Conditional Logic):** [COMPLETED & VERIFIED] Interactive 6-stage wizard UI (Scope & Archetype, Personas, Functional Requirements, Non-Functional Requirements, Technical Constraints, Review & Readiness) with real-time conditional logic rules engine, dynamic archetype field surfacing, SLA/compliance consistency guards, quantitative readiness scoring, and PostgreSQL JSONB draft state persistence. Verified with 44 automated test assertions.
- **Phase 3 (AI-Assisted Requirements Elicitation Engine):** [COMPLETED & VERIFIED] Implemented ambiguity detection and clarity scoring (0-100), Gherkin scenario generation (Given-When-Then, boundary, security), context ingestion from uploaded file references, and proactive archetype-tailored elicitation prompts. Verified with 52 automated test assertions.
- **Phase 4 (Document Generation & PRD Export):** [COMPLETED & VERIFIED] Assembled completed draft states into IEEE Std 830-1998 / ISO/IEC/IEEE 29148 compliant Software Requirements Specifications, exportable to GitHub-Flavored Markdown, machine-readable JSON Schema, and printable HTML with PDF styling. Verified with 58 automated test assertions.
- **Phase 5 (Governance, Auditing, RBAC & Hardening):** [COMPLETED & VERIFIED] Least-privilege enterprise Role-Based Access Control (Admin, Lead Architect, Contributor, Stakeholder), immutable chronological audit logging in PostgreSQL, semantic field-level diff calculation, cryptographic SHA-256 specification freezing, strict immutability guards, audited reopening, and historical revision rollback. Verified with 79 automated test assertions.

---

## 4. Phase 4 Architecture: Document Generation & Export Engine

### 4.1 IEEE 830-1998 Standard Structure (`src/lib/export/markdown.ts`)
1. **Title & Document Metadata:** Formal standard compliance badge, version, date, archetype, readiness score, and lead architect signature.
2. **Section 1 (Introduction):** Purpose, RFC 2119 normative keywords (SHALL/MUST/SHOULD/MAY), intended audience, in-scope capabilities checklist, out-of-scope exclusions, and context document references.
3. **Section 2 (Overall Description):** System archetype details, stakeholder personas table (roles, goals, pain points, access tiers), prescribed technology stack table, and design constraints.
4. **Section 3 (Functional Requirements):** Requirement ID, title, priority (P0/P1/P2), category, user story blockquote, acceptance criteria Definition of Done, formal Gherkin scenarios (`Given... When... Then... And...`), and edge cases.
5. **Section 4 (External Interfaces):** Third-party integrations matrix and transport communication protocols (TLS 1.3, HTTP/2, JWT).
6. **Section 5 (Non-Functional Requirements):** Latency SLOs, throughput RPS, uptime SLA percentage, disaster recovery RTO, security encryption standards (AES-256), compliance frameworks (HIPAA, SOC2, GDPR), and caching topology.
7. **Section 6 (Governance & Sign-Off):** Quantitative readiness verification score, lead architect approval signature, review notes, and cryptographic SHA-256 hash stamp.

### 4.2 Machine-Readable JSON Schema (`src/lib/export/json.ts`)
Conforms to `$schema: https://sdad-spec.org/schemas/srs-v1.json`, structuring all sections into strictly typed JSON fields for automated ingestion by CI/CD linters and downstream autonomous coding agents.

### 4.3 Printable HTML & Browser PDF Generation (`src/lib/export/html.ts`)
Renders clean, executive-formatted HTML containing CSS `@media print` rules, automated page breaks (`page-break-before: always;`), and one-click print invocation via `window.print()`.

### 4.4 Interactive Export Route & Presentation UI (`src/app/wizard/[id]/export/page.tsx`)
Live route rendering:
- Executive Document View
- Raw IEEE 830 Markdown with line numbers and one-click copy
- Structured JSON Schema view
- Governance & Chronological Audit Trail tab
- One-click file downloads (`.md` and `.json`)
- One-click Print / Save as PDF button

---

## 5. Phase 5 Architecture: Governance, Auditing, RBAC & Hardening

### 5.1 Role-Based Access Control (RBAC) System (`src/lib/governance/rbac.ts`)
The application defines four distinct enterprise roles with strict least-privilege boundaries:
- **`admin` (Enterprise Administrator):** Full administrative authority. Can manage user roles, delete drafts, force-unlock frozen specifications, and audit all system mutations.
- **`lead_architect` (Lead Architect):** Architectural approval authority. Can create, edit, approve, and sign off specifications, cryptographically lock drafts with SHA-256 seals, reopen locked specs with audited justification, and rollback to historical snapshots. Cannot manage user roles.
- **`contributor` (Requirements Author / Engineer):** Authoring authority. Can create drafts, edit requirements in progress, submit drafts for formal review (when readiness &ge; 70%), and run AI elicitation. Cannot sign off, lock, reopen, or rollback revisions.
- **`viewer` (Stakeholder / Auditor):** Read-only authority. Can inspect requirements, browse audit trails, and generate export documents. Cannot modify drafts or perform administrative actions.

### 5.2 Semantic Field-Level Diff Engine (`src/lib/governance/diff.ts`)
Calculates deep structured changes between two requirement states:
- **Identity & Scope:** Project name changes, archetype shifts, in-scope additions, out-of-scope removals.
- **Personas:** Additions, removals, and modifications of user roles and pain points.
- **Functional Requirements:** Detects added requirements, priority promotions (P1 &rarr; P0), user story revisions, and acceptance criteria count delta.
- **Non-Functional Requirements:** Tracks SLA adjustments (99.9% &rarr; 99.99%), P95 latency SLO shifts (250ms &rarr; 120ms), encryption toggles, and compliance framework inclusions (e.g., HIPAA).
- **Human-Readable Summaries:** Generates concise change descriptions (e.g., *"Modified 3 specification attributes (1 added, 2 modified)"*).

### 5.3 Cryptographic Integrity Sealing & Tamper Verification
- **SHA-256 Canonical Checksum:** Implements deterministic recursive JSON canonicalization sorting object keys at every depth.
- **Envelope Separation:** The governance envelope (`sealedChecksum`, `lockedAt`, `lockedBy`) is stripped from the specification payload prior to hashing, allowing verifiable round-trip integrity checks.
- **Tamper Detection:** `verifyDraftIntegrityAction` recomputes the SHA-256 checksum against the stored seal and alerts if unauthorized modifications have occurred.

### 5.4 State Machine & Immutability Enforcement (`src/lib/governance/sign-off.ts`)
- **Lifecycle States:** `draft` &rarr; `in_review` &rarr; `approved` &rarr; `locked` (&rarr; audited `reopened`).
- **Strict Immutability Rule:** Once locked, `saveDraftAction` and `attachFileReferenceAction` strictly block any modification attempt across all user roles until a Lead Architect or Admin executes an audited reopening with a mandatory justification (&ge; 8 characters).
- **Historical Snapshot Rollback:** `restoreRevisionAction` allows Lead Architects to revert draft state to any previous milestone snapshot captured in the PostgreSQL audit log.

### 5.5 PostgreSQL Audit Log Table Schema (`scripts/ensure-db.ts`)
```sql
CREATE TABLE IF NOT EXISTS "auditLog" (
  "id" TEXT PRIMARY KEY,
  "draftId" TEXT NOT NULL REFERENCES "formDraft"("id") ON DELETE CASCADE,
  "userId" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "userRole" TEXT NOT NULL DEFAULT 'contributor',
  "action" TEXT NOT NULL,
  "stage" INTEGER,
  "summary" TEXT NOT NULL,
  "diff" JSONB,
  "snapshot" JSONB,
  "checksum" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "idx_auditLog_draftId" ON "auditLog"("draftId");
CREATE INDEX IF NOT EXISTS "idx_auditLog_createdAt" ON "auditLog"("createdAt" DESC);
```

---

## 6. Next.js Server Action Interface

All data mutations, governance workflows, and export pipelines operate through isolated Server Actions with Zod runtime validation:

- `saveDraftAction(input: SaveDraftInput): Promise<ActionResponse<FormDraft>>`
- `getDraftAction(draftId: string): Promise<ActionResponse<FormDraftWithFiles>>`
- `listUserDraftsAction(userId: string): Promise<ActionResponse<FormDraft[]>>`
- `attachFileReferenceAction(input: AttachFileInput): Promise<ActionResponse<FileReference>>`
- `getOrCreateUserAction(input: CreateUserInput): Promise<ActionResponse<User>>`
- `submitForReviewAction(input: SubmitForReviewInput): Promise<ActionResponse<FormDraft>>`
- `signOffDraftAction(input: SignOffDraftInput): Promise<ActionResponse<FormDraft>>`
- `lockSpecificationAction(input: LockSpecificationInput): Promise<ActionResponse<FormDraft & { checksum: string }>>`
- `reopenSpecificationAction(input: ReopenSpecificationInput): Promise<ActionResponse<FormDraft>>`
- `restoreRevisionAction(input: RestoreRevisionInput): Promise<ActionResponse<FormDraft>>`
- `getAuditTrailAction(input: GetAuditTrailInput): Promise<ActionResponse<AuditLogEntry[]>>`
- `updateUserRoleAction(input: UpdateUserRoleInput): Promise<ActionResponse<User>>`
- `verifyDraftIntegrityAction(draftId: string): Promise<ActionResponse<IntegrityResult>>`
- `analyzeAmbiguityAction(input: AmbiguityAnalysisInput): Promise<ActionResponse<AmbiguityAnalysisResult>>`
- `generateCriteriaAction(input: GenerateCriteriaInput): Promise<ActionResponse<GeneratedCriteriaResult>>`
- `expandRequirementAction(input: ExpandRequirementInput): Promise<ActionResponse<RequirementExpansionResult>>`
- `ingestDocumentContextAction(input: IngestDocumentContextInput): Promise<ActionResponse<DocumentIngestionResult>>`
- `generateElicitationQuestionsAction(input: ElicitationQuestionsInput): Promise<ActionResponse<ElicitationQuestion[]>>`
- `applyExtractedContextToDraftAction(input: ApplyExtractedToDraftInput): Promise<ActionResponse<{ updatedCount: number }>>`
- `exportDocumentAction(input: ExportDocumentInput): Promise<ActionResponse<GeneratedDocumentResult>>`
- `exportDirectDocumentAction(input: DirectExportInput): Promise<ActionResponse<GeneratedDocumentResult>>`

---

## 7. Architecture Diagram Engine (Mermaid.js)

The platform compiles formal specifications into four distinct automated Mermaid.js architectural models:
1. **C4 System Container Diagram (`graph TD`):** Models client tiers (Web, Mobile, API), Next.js 14 App Router presentation layer, isolated Server Action gateways, PostgreSQL 18 & Redis storage topologies, and external third-party services (e.g. Stripe, Twilio, SendGrid).
2. **Primary Workflow Sequence Execution (`sequenceDiagram`):** Synthesizes end-to-end execution flows with step numbering, Zod schema validation guards, database JSONB mutations, and cryptographic audit logging.
3. **Domain & Database Entity-Relationship Model (`erDiagram`):** Models relational schemas connecting `USER`, `FORM_DRAFT`, `FILE_REFERENCE`, and `AUDIT_LOG` with strict referential integrity and attribute types.
4. **Specification Lifecycle State Machine (`stateDiagram-v2`):** Visualizes governance transitions (`Draft` &rarr; `InReview` &rarr; `Approved` &rarr; `Locked` &rarr; `Reopened`) and strict immutability barriers.
5. **Native Document Integration:** Embeds ````mermaid` syntax blocks directly into Section 2, Section 3, Section 4, and Section 6 of generated IEEE 830 Markdown documents for automatic rendering on GitHub, GitLab, and Obsidian.
6. **Interactive Visualizer (`MermaidViewer.tsx`):** Provides interactive rendering, SVG export, raw syntax inspection, and one-click clipboard copying in both the wizard editor and the document export viewer.

---

## 8. Cumulative Test Verification Protocol

The automated test suite verifies all system capabilities across 303 assertions with zero failures:

1. **`test:phase1` (22 checks):** PostgreSQL connection, JSONB deep mutations, FileReference relations, Server Action boundary isolation, and Zod rejection.
2. **`test:phase2` (44 checks):** Conditional logic engine, archetype field surfacing, HIPAA/SLA constraint guards, readiness scoring (0-100), and multi-stage draft persistence.
3. **`test:phase3` (52 checks):** Ambiguity detection, clarity scoring, Gherkin scenario generation, document context ingestion, proactive elicitation questions, Server Action execution, and PostgreSQL draft augmentation.
4. **`test:phase4` (58 checks):** IEEE 830 Markdown compilation, structured JSON schema export, printable HTML/PDF generation, Server Action execution (`exportDocumentAction`, `exportDirectDocumentAction`), and end-to-end database assembly.
5. **`test:phase5` (79 checks):** RBAC permissions matrix, field-level semantic diff engine, PostgreSQL audit trail recording and queries, review submission threshold guards, Lead Architect sign-off, cryptographic SHA-256 draft locking, strict immutability enforcement, audited reopening, snapshot revision rollback, and Admin role management.
6. **`test:diagrams` (48 checks):** Automated Mermaid.js C4 container compilation, workflow sequence generation, ER data model, governance state machine, and IEEE 830 Markdown diagram embedding.
7. **Total Assertions:** **303 / 303 passing assertions (100% pass rate).**
8. **Next.js Production Build:** Clean compilation with 0 errors across static and dynamic App Router routes (`/`, `/wizard`, `/wizard/[id]`, `/wizard/[id]/export`).
