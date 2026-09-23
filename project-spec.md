# Project Specification: AI-Driven Software Requirements Wizard
**Framework:** Spec-Driven Agentic Development (SDAD)  
**Repository:** `deshiklab/Requirements_Wizard`  
**Target Platform:** Next.js 14 (App Router) + PostgreSQL + Prisma ORM + Tailwind CSS / Shadcn UI  
**Document Status:** Formal Specification & Architecture Contract (v1.2.0)

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
 └──────────────────────────────┬──────────────────────────────┘
                                │ Server Action Barrier
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │              Isolated Next.js Server Actions                │
 │   - Zod Strict Input Validation & Schema Guards             │
 │   - AI Ambiguity & Gherkin Criteria Pipelines               │
 │   - Context Document Ingestion & Entity Extractors          │
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
 [Phase 4: Document Generation & PRD Export] (Awaiting Human Approval)
             │
             ▼
 [Phase 5: Governance, Auditing & Final Hardening]
```

### Phase Definitions:
- **Phase 1 (Database & Environment):** [COMPLETED] Initialize Next.js 14 App Router, Tailwind/Shadcn, PostgreSQL schema for users, multi-stage form drafts (JSONB), and file upload references. Verified with 22 automated test assertions.
- **Phase 2 (Multi-Stage Wizard Form Engine & Conditional Logic):** [COMPLETED & VERIFIED] Interactive 6-stage wizard UI (Scope & Archetype, Personas, Functional Requirements, Non-Functional Requirements, Technical Constraints, Review & Readiness) with real-time conditional logic rules engine, dynamic archetype field surfacing, SLA/compliance consistency guards, quantitative readiness scoring, and PostgreSQL JSONB draft state persistence. Verified with 44 automated test assertions.
- **Phase 3 (AI-Assisted Requirements Elicitation Engine):** [COMPLETED & VERIFIED] Implemented ambiguity detection and clarity scoring (0-100), Gherkin scenario generation (Given-When-Then, boundary, security), context ingestion from uploaded file references, and proactive archetype-tailored elicitation prompts. Verified with 52 automated test assertions.
- **Phase 4 (Document Generation & PRD Export):** [Awaiting Human Approval] Assemble completed draft states into IEEE 830-compliant Software Requirements Specifications, exportable to Markdown, JSON, and PDF formats.
- **Phase 5 (Governance & End-to-End Hardening):** Role-based access controls, audit trail history for requirement diffs, and end-to-end integration test coverage.

---

## 4. Phase 3 Architecture: AI Requirements Elicitation Engine

### 4.1 Ambiguity Detection & Clarity Scoring (`src/lib/ai/ambiguity-detector.ts`)
- **Vague Subjective Descriptors:** Detects untestable terms (`fast`, `user-friendly`, `secure`, `scalable`, `robust`, `modern`, `seamless`) and flags them with explicit SLA replacements (e.g., `< 200ms p95`, `OAuth2 PKCE + AES-256`, `5,000 concurrent sessions`).
- **Normative Modal Validation (RFC 2119 / IEEE 830):** Flags weak modals (`should`, `could`, `might`, `may`) and mandates explicit normative keywords (`shall`, `must`).
- **Passive Voice & Missing Actor Detection:** Flags statements lacking designated initiating subjects or services (`data is processed`, `updated`).
- **Clarity Scoring (0–100):** Deducts points based on issue severity; categorizes requirements into Low, Medium, or High ambiguity with targeted clarifying questions and one-click refinement injection.

### 4.2 Gherkin Scenario & Criteria Generator (`src/lib/ai/criteria-generator.ts`)
- **Structure:** Synthesizes standardized user stories (*"As a [role], I want [feature], so that [outcome]"*) and produces testable Gherkin scenarios:
  - **Happy Path:** `Given [precondition] When [action] Then [expected outcome] And [state mutation]`
  - **Error & Validation:** `Given [invalid input] When [submitted] Then [HTTP 400 rejection with problem details]`
  - **Security & Throttling:** `Given [5 failed attempts] When [6th attempt] Then [HTTP 429 rate limit cooldown]`
  - **Boundary & Concurrency:** Optimistic locking, idempotency key enforcement, and offline synchronization conflict resolution.

### 4.3 Context Document Ingestion (`src/lib/ai/context-ingestion.ts`)
- Parses uploaded files (`FileReference.metadata` or raw text) including architecture schemas, OpenAPI specs, and PRD drafts.
- Automatically extracts:
  - Candidate Functional Requirements (normalized with user stories and acceptance criteria)
  - Discovered Personas (Roles, Goals, Pain Points, RBAC Privilege tiers)
  - Architectural & Compliance Constraints (PostgreSQL JSONB, Redis Caching, OAuth2 PKCE, HIPAA, SOC2)
  - Suggested Technology Stack components
- Direct PostgreSQL JSONB merge into active drafts via `applyExtractedContextToDraftAction`.

### 4.4 Proactive Elicitation Copilot (`src/lib/ai/elicitation-prompts.ts`, `AiElicitationPanel.tsx`)
- Analyzes current draft state and archetype to surface missing edge cases and drill-down architectural options.
- Features one-click adoption of recommended requirements directly into Stage 3.

---

## 5. Next.js Server Action Interface

All data mutations are strictly executed through isolated Server Actions with Zod runtime validation:

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

---

## 6. Cumulative Test Verification Protocol

The automated test suite verifies all three phases with zero failures:

1. **`test:phase1` (22 checks):** PostgreSQL connection, JSONB deep mutations, FileReference relations, Server Action boundary isolation, and Zod rejection.
2. **`test:phase2` (44 checks):** Conditional logic engine, archetype field surfacing, HIPAA/SLA constraint guards, readiness scoring (0-100), and multi-stage draft persistence.
3. **`test:phase3` (52 checks):** Ambiguity detection, clarity scoring, Gherkin scenario generation, document context ingestion, proactive elicitation questions, Server Action execution, and PostgreSQL draft augmentation.
4. **Total Assertions:** 118 / 118 passing assertions.
5. **Next.js Production Build:** Clean compilation with 0 errors across static and dynamic App Router routes.
