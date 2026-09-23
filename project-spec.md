# Project Specification: AI-Driven Software Requirements Wizard
**Framework:** Spec-Driven Agentic Development (SDAD)  
**Repository:** `deshiklab/Requirements_Wizard`  
**Target Platform:** Next.js 14 (App Router) + PostgreSQL + Prisma ORM + Tailwind CSS / Shadcn UI  
**Document Status:** Formal Specification & Architecture Contract (v1.3.0)

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
 └──────────────────────────────┬──────────────────────────────┘
                                │ Server Action Barrier
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │              Isolated Next.js Server Actions                │
 │   - Zod Strict Input Validation & Schema Guards             │
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
 │   - Relational referential integrity (Users, Files)        │
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
 [Phase 5: Governance, Auditing & Final Hardening] (Awaiting Human Approval)
```

### Phase Definitions:
- **Phase 1 (Database & Environment):** [COMPLETED] Initialize Next.js 14 App Router, Tailwind/Shadcn, PostgreSQL schema for users, multi-stage form drafts (JSONB), and file upload references. Verified with 22 automated test assertions.
- **Phase 2 (Multi-Stage Wizard Form Engine & Conditional Logic):** [COMPLETED & VERIFIED] Interactive 6-stage wizard UI (Scope & Archetype, Personas, Functional Requirements, Non-Functional Requirements, Technical Constraints, Review & Readiness) with real-time conditional logic rules engine, dynamic archetype field surfacing, SLA/compliance consistency guards, quantitative readiness scoring, and PostgreSQL JSONB draft state persistence. Verified with 44 automated test assertions.
- **Phase 3 (AI-Assisted Requirements Elicitation Engine):** [COMPLETED & VERIFIED] Implemented ambiguity detection and clarity scoring (0-100), Gherkin scenario generation (Given-When-Then, boundary, security), context ingestion from uploaded file references, and proactive archetype-tailored elicitation prompts. Verified with 52 automated test assertions.
- **Phase 4 (Document Generation & PRD Export):** [COMPLETED & VERIFIED] Assembled completed draft states into IEEE Std 830-1998 / ISO/IEC/IEEE 29148 compliant Software Requirements Specifications, exportable to GitHub-Flavored Markdown, machine-readable JSON Schema, and printable HTML with PDF styling. Verified with 58 automated test assertions.
- **Phase 5 (Governance & End-to-End Hardening):** Role-based access controls, audit trail history for requirement diffs, and end-to-end integration test coverage.

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
- One-click file downloads (`.md` and `.json`)
- One-click Print / Save as PDF button

---

## 5. Next.js Server Action Interface

All data mutations and export pipelines operate through isolated Server Actions with Zod runtime validation:

- `saveDraftAction(input: SaveDraftInput): Promise<ActionResponse<FormDraft>>`
- `getDraftAction(draftId: string): Promise<ActionResponse<FormDraftWithFiles>>`
- `listUserDraftsAction(userId: string): Promise<ActionResponse<FormDraft[]>>`
- `attachFileReferenceAction(input: AttachFileInput): Promise<ActionResponse<FileReference>>`
- `getOrCreateUserAction(input: CreateUserInput): Promise<ActionResponse<User>>`
- `analyzeAmbiguityAction(input: AmbiguityAnalysisInput): Promise<ActionResponse<AmbiguityAnalysisResult>>`
- `generateCriteriaAction(input: GenerateCriteriaInput): Promise<ActionResponse<GeneratedCriteriaResult>>`
- `expandRequirementAction(input: ExpandRequirementInput): Promise<ActionResponse<RequirementExpansionResult>>`
- `ingestDocumentContextAction(input: IngestDocumentContextInput): Promise<ActionResponse<DocumentIngestionResult>>`
- `generateElicitationQuestionsAction(input: ElicitationQuestionsInput): Promise<ActionResponse<ElicitationQuestion[]>>`
- `applyExtractedContextToDraftAction(input: ApplyExtractedToDraftInput): Promise<ActionResponse<{ updatedCount: number }>>`
- `exportDocumentAction(input: ExportDocumentInput): Promise<ActionResponse<GeneratedDocumentResult>>`
- `exportDirectDocumentAction(input: DirectExportInput): Promise<ActionResponse<GeneratedDocumentResult>>`

---

## 6. Cumulative Test Verification Protocol

The automated test suite verifies all four phases with zero failures:

1. **`test:phase1` (22 checks):** PostgreSQL connection, JSONB deep mutations, FileReference relations, Server Action boundary isolation, and Zod rejection.
2. **`test:phase2` (44 checks):** Conditional logic engine, archetype field surfacing, HIPAA/SLA constraint guards, readiness scoring (0-100), and multi-stage draft persistence.
3. **`test:phase3` (52 checks):** Ambiguity detection, clarity scoring, Gherkin scenario generation, document context ingestion, proactive elicitation questions, Server Action execution, and PostgreSQL draft augmentation.
4. **`test:phase4` (58 checks):** IEEE 830 Markdown compilation, structured JSON schema export, printable HTML/PDF generation, Server Action execution (`exportDocumentAction`, `exportDirectDocumentAction`), and end-to-end database assembly.
5. **Total Assertions:** **176 / 176 passing assertions (100% pass rate).**
6. **Next.js Production Build:** Clean compilation with 0 errors across static and dynamic App Router routes (`/`, `/wizard`, `/wizard/[id]`, `/wizard/[id]/export`).
