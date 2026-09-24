import { GovernanceState } from '@/lib/governance/types';

export type ProjectArchetype =
  | 'web_app'
  | 'mobile_app'
  | 'api_backend'
  | 'enterprise_saas'
  | 'ai_agentic';

export type PriorityLevel = 'P0' | 'P1' | 'P2';

export interface Persona {
  id: string;
  name: string;
  role: string;
  goals: string;
  painPoints: string;
  accessLevel: string;
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  userStory: string;
  priority: PriorityLevel;
  category: string;
  acceptanceCriteria: string[];
}

export interface IntegrationItem {
  id: string;
  serviceName: string;
  type: string;
  purpose: string;
}

export interface AttachmentRef {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  metadata?: Record<string, any>;
}

export interface Step1IdentityData {
  projectName: string;
  projectType: ProjectArchetype;
  description: string;
  targetAudience: string;
  inScope: string[];
  outOfScope: string[];
  // Archetype-specific conditional data
  mobilePlatforms?: ('ios' | 'android' | 'cross_platform')[];
  offlineRequired?: boolean;
  pushNotifications?: boolean;
  apiProtocol?: 'rest' | 'graphql' | 'grpc';
  multiTenancyModel?: 'shared_schema' | 'db_per_tenant' | 'isolated_vpcs';
  enterpriseSso?: boolean;
  aiModelProvider?: string;
  humanInTheLoop?: boolean;
}

export interface Step2PersonasData {
  personas: Persona[];
}

export interface Step3FunctionalData {
  requirements: FunctionalRequirement[];
}

export interface Step4NonFunctionalData {
  performance: {
    maxLatencyMs: number;
    targetRps: number;
  };
  availability: {
    uptimeSla: '99.0%' | '99.9%' | '99.95%' | '99.99%';
    disasterRecoveryRtoMinutes: number;
  };
  securityCompliance: {
    complianceStandards: string[]; // 'GDPR', 'HIPAA', 'SOC2', 'PCI-DSS', 'ISO-27001'
    authStrategy: string;
    dataEncryptionAtRest: boolean;
    dataEncryptionInTransit: boolean;
  };
  scalability: {
    peakConcurrentUsers: number;
    cachingStrategy: string;
  };
}

export interface Step5TechAndContextData {
  preferredStack: {
    frontend: string;
    backend: string;
    database: string;
    cloud: string;
  };
  integrations: IntegrationItem[];
  attachments: AttachmentRef[];
}

export interface Step6ReviewData {
  finalNotes: string;
  signOffArchitect: string;
  specReadinessScore?: number;
  status?: 'draft' | 'in_progress' | 'review' | 'finalized';
}

export interface WizardFormData {
  step1_identity: Step1IdentityData;
  step2_personas: Step2PersonasData;
  step3_functional: Step3FunctionalData;
  step4_non_functional: Step4NonFunctionalData;
  step5_tech_and_context: Step5TechAndContextData;
  step6_review: Step6ReviewData;
  governance?: GovernanceState;
}

export interface StepProgressState {
  completedSteps: number[];
  activeStep: number;
  totalSteps: number;
  percentComplete: number;
  lastSavedAt: string;
}

export const INITIAL_WIZARD_FORM_DATA: WizardFormData = {
  step1_identity: {
    projectName: '',
    projectType: 'web_app',
    description: '',
    targetAudience: '',
    inScope: ['User Authentication', 'Responsive Dashboard'],
    outOfScope: ['Legacy Data Migration'],
    mobilePlatforms: [],
    offlineRequired: false,
    pushNotifications: false,
    apiProtocol: 'rest',
    multiTenancyModel: 'shared_schema',
    enterpriseSso: false,
    aiModelProvider: 'Anthropic Claude / OpenAI',
    humanInTheLoop: true,
  },
  step2_personas: {
    personas: [
      {
        id: 'pers-1',
        name: 'Primary User',
        role: 'End User / Operator',
        goals: 'Perform daily workflows quickly with minimal cognitive overhead.',
        painPoints: 'Slow loading times, complicated multi-step forms without autosave.',
        accessLevel: 'Standard User',
      },
    ],
  },
  step3_functional: {
    requirements: [
      {
        id: 'FR-1',
        title: 'Core Workflow Execution',
        userStory: 'As a primary user, I want to execute the main business process so that I can achieve my goals.',
        priority: 'P0',
        category: 'Core Workflow',
        acceptanceCriteria: [
          'Inputs must be validated against schema before submission',
          'System must provide immediate visual feedback upon action completion',
        ],
      },
    ],
  },
  step4_non_functional: {
    performance: {
      maxLatencyMs: 250,
      targetRps: 100,
    },
    availability: {
      uptimeSla: '99.9%',
      disasterRecoveryRtoMinutes: 60,
    },
    securityCompliance: {
      complianceStandards: ['GDPR', 'SOC2'],
      authStrategy: 'OAuth2 with JWT & Session Invalidation',
      dataEncryptionAtRest: true,
      dataEncryptionInTransit: true,
    },
    scalability: {
      peakConcurrentUsers: 1000,
      cachingStrategy: 'Redis Distributed Cache',
    },
  },
  step5_tech_and_context: {
    preferredStack: {
      frontend: 'Next.js 14 (App Router) + Tailwind + Shadcn UI',
      backend: 'Node.js Server Actions / API Routes',
      database: 'PostgreSQL 18 + Prisma ORM',
      cloud: 'Vercel / AWS',
    },
    integrations: [
      {
        id: 'int-1',
        serviceName: 'SendGrid / Resend',
        type: 'Transactional Email',
        purpose: 'User notifications and magic link authentication',
      },
    ],
    attachments: [],
  },
  step6_review: {
    finalNotes: '',
    signOffArchitect: '',
    specReadinessScore: 85,
    status: 'draft',
  },
};
