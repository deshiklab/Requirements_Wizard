/**
 * SDAD Architecture Diagram Engine (Mermaid.js)
 * Automatically compiles structured requirement specifications into C4, Sequence, ER, and State diagrams.
 */

import { WizardFormData } from '@/types/wizard';
import { ArchitectureDiagram, GeneratedDiagramsCollection } from './types';

/**
 * Sanitizes labels for Mermaid syntax compatibility.
 */
function sanitizeMermaidText(text?: string): string {
  if (!text) return '';
  return text.replace(/["\n\r\[\]\(\)\{\}]/g, ' ').trim();
}

/**
 * Generates a C4 Container / System Architecture Diagram based on the draft tech context and archetype.
 */
export function generateC4ContainerDiagram(formData: WizardFormData): ArchitectureDiagram {
  const projectName = sanitizeMermaidText(formData.step1_identity.projectName) || 'Software System';
  const archetype = formData.step1_identity.projectType || 'web_app';
  const frontend = sanitizeMermaidText(formData.step5_tech_and_context.preferredStack.frontend) || 'Next.js 14 App Router';
  const backend = sanitizeMermaidText(formData.step5_tech_and_context.preferredStack.backend) || 'Node.js Isolated Server Actions';
  const database = sanitizeMermaidText(formData.step5_tech_and_context.preferredStack.database) || 'PostgreSQL 18 with JSONB';
  const cloud = sanitizeMermaidText(formData.step5_tech_and_context.preferredStack.cloud) || 'Cloud Infrastructure';
  const integrations = formData.step5_tech_and_context.integrations || [];
  const primaryPersona = formData.step2_personas.personas[0]?.name || 'Primary User';
  const personaRole = formData.step2_personas.personas[0]?.role || 'Stakeholder';

  let clientNode = `Client["🖥️ ${primaryPersona}<br/><small>${personaRole}</small>"]`;
  if (archetype === 'mobile_app') {
    clientNode = `Client["📱 Mobile Client (iOS / Android)<br/><small>${primaryPersona}</small>"]`;
  } else if (archetype === 'api_backend') {
    clientNode = `Client["🔌 API Consumer / SDK Client<br/><small>${primaryPersona}</small>"]`;
  }

  let integrationNodes = '';
  let integrationLinks = '';
  if (integrations.length > 0) {
    integrationNodes = '\n    subgraph ExternalServices ["External Third-Party Ecosystem"]\n';
    integrations.forEach((int, idx) => {
      const name = sanitizeMermaidText(int.serviceName) || `Integration ${idx + 1}`;
      const type = sanitizeMermaidText(int.type) || 'External API';
      const id = `ExtService_${idx}`;
      integrationNodes += `      ${id}["🌐 ${name}<br/><small>${type}</small>"]\n`;
      integrationLinks += `    BackendController -->|TLS 1.3 / REST| ${id}\n`;
    });
    integrationNodes += '    end\n';
  } else {
    integrationNodes = '\n    subgraph ExternalServices ["External Ecosystem"]\n      ExtService_0["🌐 External Gateway<br/><small>Third-party APIs</small>"]\n    end\n';
    integrationLinks = '    BackendController -->|REST / Webhook| ExtService_0\n';
  }

  const syntax = `%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#4338ca', 'edgeLabelBackground':'#1e1b4b', 'tertiaryColor': '#0f172a'}}}%%
graph TD
    classDef clientClass fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef appClass fill:#312e81,stroke:#6366f1,stroke-width:2px,color:#f8fafc;
    classDef dbClass fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;
    classDef extClass fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#f8fafc;

    ${clientNode}:::clientClass

    subgraph SystemBoundary ["System Boundary: ${projectName}"]
      UI["🌐 Frontend Presentation Layer<br/><small>${frontend}</small>"]:::appClass
      BackendController["⚙️ Server Action Gateway & API Layer<br/><small>${backend}</small>"]:::appClass
      AIEngine["🤖 AI Elicitation & Disambiguation Engine<br/><small>Deterministic Heuristic NLP</small>"]:::appClass
      RBACGuard["🛡️ RBAC & Governance Barrier<br/><small>Least-Privilege Security Policy</small>"]:::appClass

      subgraph PersistenceTier ["Data & Storage Layer (${cloud})"]
        PrimaryDB[("🗄️ Relational & JSONB Storage<br/><small>${database}</small>")]:::dbClass
        AuditStore[("📜 Cryptographic Audit Ledger<br/><small>SHA-256 Chained Logs</small>")]:::dbClass
      end
    end

${integrationNodes}

    Client -->|HTTPS / WSS / TLS 1.3| UI
    UI -->|Next.js Server Action RPC| RBACGuard
    RBACGuard -->|Authorized Execution| BackendController
    BackendController -->|Semantic Analysis| AIEngine
    BackendController -->|Read / Write Draft JSONB| PrimaryDB
    BackendController -->|Log Mutation Diff \u0026 Seal| AuditStore
${integrationLinks}`;

  return {
    id: 'diagram-c4-container',
    type: 'c4_container',
    title: 'C4 Container & Component Architecture',
    description: `System boundaries, persistence topologies, and communication protocols for ${projectName}.`,
    syntax,
  };
}

/**
 * Generates an end-to-end Sequence Diagram modeling the primary P0 functional requirement workflow.
 */
export function generateWorkflowSequenceDiagram(
  formData: WizardFormData,
  reqIdOrIndex?: string | number
): ArchitectureDiagram {
  const reqs = formData.step3_functional.requirements || [];
  let req = reqs[0];

  if (typeof reqIdOrIndex === 'number' && reqs[reqIdOrIndex]) {
    req = reqs[reqIdOrIndex];
  } else if (typeof reqIdOrIndex === 'string') {
    const matched = reqs.find((r) => r.id === reqIdOrIndex);
    if (matched) req = matched;
  }

  const reqId = req?.id || 'FR-01';
  const reqTitle = sanitizeMermaidText(req?.title) || 'Core Business Workflow';
  const primaryPersona = sanitizeMermaidText(formData.step2_personas.personas[0]?.name) || 'User';
  const userStory = sanitizeMermaidText(req?.userStory) || 'Execute core requirement workflow';
  const firstCrit = sanitizeMermaidText(req?.acceptanceCriteria?.[0]) || 'Input validation conforms to schema';
  const secondCrit = sanitizeMermaidText(req?.acceptanceCriteria?.[1]) || 'State mutation committed with audit hash';

  const syntax = `%%{init: {'theme': 'dark', 'themeVariables': { 'actorBkg': '#312e81', 'actorBorder': '#818cf8', 'signalColor': '#94a3b8'}}}%%
sequenceDiagram
    autonumber
    actor Actor as 👤 ${primaryPersona}
    participant UI as 🖥️ Next.js 14 UI
    participant Action as ⚙️ Isolated Server Action
    participant Guard as 🛡️ Zod Validation & RBAC
    participant DB as 🗄️ PostgreSQL 18 (JSONB)
    participant Audit as 📜 Audit Log (SHA-256)

    Note over Actor,UI: Workflow: ${reqId} - ${reqTitle}
    Actor->>UI: Interacts with interface (${userStory.slice(0, 45)}...)
    UI->>Action: Dispatches typed payload via Server Action
    activate Action
    Action->>Guard: Validate payload schema & user role permissions
    activate Guard

    alt Validation Failure or Unauthorized
        Guard-->>Action: Rejection Error (ZodIssue / 403 Forbidden)
        Action-->>UI: Return ActionResponse { success: false, error }
        UI-->>Actor: Display contextual error guidance & highlight fields
    else Validation Passed & Authorized
        Guard-->>Action: Sanitized typed payload
        deactivate Guard
        
        Note over Action,DB: Acceptance Criteria: ${firstCrit.slice(0, 40)}...
        Action->>DB: Execute query / mutate JSONB draft state
        activate DB
        DB-->>Action: Return updated record
        deactivate DB

        Action->>Audit: Record immutable mutation diff with SHA-256 seal
        activate Audit
        Audit-->>Action: Audit entry acknowledged (${secondCrit.slice(0, 30)}...)
        deactivate Audit

        Action-->>UI: Return ActionResponse { success: true, data }
        deactivate Action
        UI-->>Actor: Render success feedback & revalidate dynamic path
    end`;

  return {
    id: `diagram-sequence-${reqId.toLowerCase()}`,
    type: 'sequence_workflow',
    title: `Sequence Workflow: ${reqId} ${reqTitle}`,
    description: `End-to-end execution lifecycle, boundary validation, and persistence for requirement ${reqId}.`,
    syntax,
  };
}

/**
 * Generates an Entity-Relationship (ER) Diagram representing the relational & JSONB database schema.
 */
export function generateErDiagram(formData: WizardFormData): ArchitectureDiagram {
  const syntax = `%%{init: {'theme': 'dark'}}%%
erDiagram
    USER ||--o{ FORM_DRAFT : authors
    USER ||--o{ FILE_REFERENCE : uploads
    USER ||--o{ AUDIT_LOG : executes
    FORM_DRAFT ||--o{ FILE_REFERENCE : associates
    FORM_DRAFT ||--o{ AUDIT_LOG : tracks

    USER {
        string id PK "UUID"
        string email UK "User email"
        string name "Full display name"
        string role "admin | lead_architect | contributor | viewer"
        datetime createdAt "Creation timestamp"
        datetime updatedAt "Last updated timestamp"
    }

    FORM_DRAFT {
        string id PK "Draft UUID"
        string userId FK "Foreign Key to User"
        string title "Specification Document Title"
        int currentStep "Wizard Stage 1..6"
        string status "draft | in_review | approved | locked"
        jsonb data "WizardFormData (Identity, Personas, FRs, NFRs, Stack)"
        jsonb stepProgress "Step progress metadata"
        datetime createdAt "Initial draft creation"
        datetime updatedAt "Last saved timestamp"
    }

    FILE_REFERENCE {
        string id PK "File UUID"
        string userId FK "Foreign Key to User"
        string draftId FK "Nullable FK to FormDraft"
        string fileName "Stored filesystem name"
        string originalName "Original uploaded filename"
        string mimeType "application/pdf | text/plain | image/png"
        int fileSize "Size in bytes"
        jsonb metadata "Extracted entities & AI context"
        datetime createdAt "Upload timestamp"
    }

    AUDIT_LOG {
        string id PK "Audit UUID"
        string draftId FK "Foreign Key to FormDraft"
        string userId FK "Actor User ID"
        string userRole "Role at execution time"
        string action "CREATE | UPDATE | SIGN_OFF | LOCK | REOPEN"
        int stage "Wizard stage 1..6"
        string summary "Human-readable change description"
        jsonb diff "Structured field-level before/after changes"
        jsonb snapshot "State snapshot at milestone"
        string checksum "SHA-256 Cryptographic Seal"
        datetime createdAt "Timestamp"
    }`;

  return {
    id: 'diagram-er-model',
    type: 'er_model',
    title: 'Data Schema: Entity-Relationship Model',
    description: 'Relational data model with JSONB flexibility and cryptographic audit trail references.',
    syntax,
  };
}

/**
 * Generates a State Machine Diagram modeling the formal SDAD specification lifecycle.
 */
export function generateGovernanceStateDiagram(): ArchitectureDiagram {
  const syntax = `%%{init: {'theme': 'dark'}}%%
stateDiagram-v2
    [*] --> Draft : Author initializes specification

    Draft --> InReview : Contributor submits for review (Readiness >= 70%)
    InReview --> Draft : Returned with remediation feedback
    
    InReview --> Approved : Lead Architect digital sign-off (Readiness >= 75%)
    Approved --> Locked : Lead Architect applies SHA-256 Cryptographic Seal

    state Locked {
        [*] --> ImmutableState
        ImmutableState : Specification Frozen & Read-Only
        ImmutableState : saveDraftAction BLOCKED
        ImmutableState : attachFileReferenceAction BLOCKED
        ImmutableState : Tamper-evident verification active
    }

    Locked --> Draft : Authorized Reopening (Requires audited reason >= 8 chars)
    Approved --> Draft : Reopened for iterative amendment

    Locked --> [*] : Released to Autonomous Coding Agents (SDAD Implementation)`;

  return {
    id: 'diagram-governance-state',
    type: 'governance_state',
    title: 'Specification Lifecycle & Governance State Machine',
    description: 'Formal states from draft authoring through cryptographic freezing and audited reopening.',
    syntax,
  };
}

/**
 * Generates the complete collection of all 4 architectural diagrams for any specification draft.
 */
export function generateAllArchitectureDiagrams(formData: WizardFormData): GeneratedDiagramsCollection {
  return {
    c4Container: generateC4ContainerDiagram(formData),
    sequenceWorkflow: generateWorkflowSequenceDiagram(formData),
    erModel: generateErDiagram(formData),
    governanceState: generateGovernanceStateDiagram(),
  };
}
