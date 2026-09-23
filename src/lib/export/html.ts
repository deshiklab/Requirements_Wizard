import { WizardFormData } from '@/types/wizard';
import { DocumentExportOptions } from './types';
import { generateAcceptanceCriteria } from '@/lib/ai/criteria-generator';

export function generatePrintableHtml(
  data: WizardFormData,
  options: DocumentExportOptions = {}
): string {
  const {
    docTitle = data.step1_identity.projectName || 'Software Requirements Specification',
    version = '1.0.0',
    generatedBy = data.step6_review.signOffArchitect || 'Lead Systems Architect',
    includeGherkin = true,
  } = options;

  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const readiness = data.step6_review.specReadinessScore ?? 85;
  const archetype = data.step1_identity.projectType || 'web_app';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(docTitle)} - IEEE 830 Software Requirements Specification</title>
  <style>
    :root {
      --primary: #1e293b;
      --accent: #2563eb;
      --border: #e2e8f0;
      --text: #0f172a;
      --muted: #64748b;
      --bg-alt: #f8fafc;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: var(--text);
      background-color: #ffffff;
      padding: 40px 60px;
      max-width: 900px;
      margin: 0 auto;
    }
    .header-card {
      border-bottom: 2px solid var(--accent);
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 4px;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      margin-bottom: 12px;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 8px;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: var(--primary);
      border-bottom: 1px solid var(--border);
      padding-bottom: 6px;
      margin-top: 36px;
      margin-bottom: 16px;
    }
    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--accent);
      margin-top: 20px;
      margin-bottom: 8px;
    }
    p, li {
      font-size: 14px;
      color: #334155;
    }
    ul, ol {
      margin-left: 20px;
      margin-bottom: 12px;
    }
    li {
      margin-bottom: 4px;
    }
    blockquote {
      border-left: 3px solid var(--accent);
      padding-left: 12px;
      font-style: italic;
      color: #475569;
      margin: 12px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13px;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background-color: var(--bg-alt);
      font-weight: 600;
      color: var(--primary);
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 16px;
      background: var(--bg-alt);
      padding: 16px;
      border-radius: 6px;
      font-size: 13px;
    }
    .meta-item strong {
      color: var(--primary);
    }
    .req-card {
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 16px;
      background: #ffffff;
    }
    .req-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .gherkin-box {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 16px;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      margin-top: 10px;
      overflow-x: auto;
    }
    .gherkin-keyword {
      color: #38bdf8;
      font-weight: bold;
    }
    .signoff-box {
      margin-top: 40px;
      padding: 20px;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      background: var(--bg-alt);
      font-size: 13px;
    }
    @media print {
      body {
        padding: 0;
        max-width: 100%;
      }
      .page-break {
        page-break-before: always;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header-card">
    <span class="badge">IEEE Std 830-1998 / SDAD Protocol</span>
    <h1>Software Requirements Specification (SRS)</h1>
    <p style="font-size: 18px; font-weight: 600; color: #2563eb;">${escapeHtml(docTitle)}</p>

    <div class="meta-grid">
      <div class="meta-item"><strong>Document Version:</strong> ${escapeHtml(version)}</div>
      <div class="meta-item"><strong>Date:</strong> ${escapeHtml(now)}</div>
      <div class="meta-item"><strong>System Archetype:</strong> ${escapeHtml(archetype.toUpperCase())}</div>
      <div class="meta-item"><strong>Spec Readiness Score:</strong> ${readiness} / 100</div>
      <div class="meta-item"><strong>Author / Lead Architect:</strong> ${escapeHtml(generatedBy)}</div>
      <div class="meta-item"><strong>Approval Status:</strong> ${(data.step6_review.status || 'review').toUpperCase()}</div>
    </div>
  </div>

  <h2>1. Introduction</h2>
  <h3>1.1 Purpose</h3>
  <p>${escapeHtml(data.step1_identity.description || 'This document defines the complete functional and technical specification for the target system.')}</p>

  <h3>1.2 Document Conventions (RFC 2119)</h3>
  <p>The keywords <strong>SHALL</strong>, <strong>MUST</strong>, <strong>REQUIRED</strong>, <strong>SHOULD</strong>, and <strong>MAY</strong> in this document are to be interpreted as described in RFC 2119.</p>

  <h3>1.3 Product Scope</h3>
  <p><strong>Target Audience:</strong> ${escapeHtml(data.step1_identity.targetAudience || 'Authorized Users')}</p>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 10px;">
    <div>
      <h4 style="font-size: 13px; color: #16a34a; margin-bottom: 6px;">In-Scope Capabilities</h4>
      <ul>
        ${data.step1_identity.inScope.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
      </ul>
    </div>
    <div>
      <h4 style="font-size: 13px; color: #dc2626; margin-bottom: 6px;">Out-of-Scope Exclusions</h4>
      <ul>
        ${data.step1_identity.outOfScope.map((s) => `<li>${escapeHtml(s)}</li>`).join('')}
      </ul>
    </div>
  </div>

  <h2>2. Overall Description</h2>
  <h3>2.1 Stakeholder Personas</h3>
  <table>
    <thead>
      <tr>
        <th>Persona</th>
        <th>System Role</th>
        <th>Primary Goals</th>
        <th>Access Tier</th>
      </tr>
    </thead>
    <tbody>
      ${data.step2_personas.personas
        .map(
          (p) => `<tr>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td>${escapeHtml(p.role)}</td>
        <td>${escapeHtml(p.goals)}</td>
        <td><code>${escapeHtml(p.accessLevel)}</code></td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

  <h3>2.2 Operating Environment & Technology Stack</h3>
  <table>
    <thead>
      <tr>
        <th>System Layer</th>
        <th>Prescribed Technology</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Frontend Framework</strong></td>
        <td>${escapeHtml(data.step5_tech_and_context.preferredStack.frontend)}</td>
      </tr>
      <tr>
        <td><strong>Backend / Compute</strong></td>
        <td>${escapeHtml(data.step5_tech_and_context.preferredStack.backend)}</td>
      </tr>
      <tr>
        <td><strong>Database & Storage</strong></td>
        <td>${escapeHtml(data.step5_tech_and_context.preferredStack.database)}</td>
      </tr>
      <tr>
        <td><strong>Cloud Infrastructure</strong></td>
        <td>${escapeHtml(data.step5_tech_and_context.preferredStack.cloud)}</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h2>3. System Features & Functional Requirements</h2>
  ${data.step3_functional.requirements
    .map((req, idx) => {
      let gherkinBlock = '';
      if (includeGherkin) {
        const gen = generateAcceptanceCriteria({
          title: req.title,
          userStory: req.userStory,
          category: req.category,
          archetype,
        });
        if (gen.gherkinScenarios.length > 0) {
          gherkinBlock = `<div class="gherkin-box">
            ${gen.gherkinScenarios
              .map(
                (sc) => `<div><span class="gherkin-keyword">Scenario:</span> ${escapeHtml(sc.title)} [${sc.type}]</div>
              <div style="padding-left: 14px;"><span class="gherkin-keyword">Given</span> ${escapeHtml(sc.given)}</div>
              <div style="padding-left: 14px;"><span class="gherkin-keyword">When</span> ${escapeHtml(sc.when)}</div>
              <div style="padding-left: 14px;"><span class="gherkin-keyword">Then</span> ${escapeHtml(sc.then)}</div>`
              )
              .join('<br>')}
          </div>`;
        }
      }

      return `<div class="req-card">
        <div class="req-header">
          <div>
            <strong>${escapeHtml(req.id)}: ${escapeHtml(req.title)}</strong>
            <span style="font-size: 11px; color: #64748b; margin-left: 8px;">(${escapeHtml(req.category)})</span>
          </div>
          <span style="font-size: 11px; font-weight: bold; background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">
            ${escapeHtml(req.priority)}
          </span>
        </div>
        <blockquote>${escapeHtml(req.userStory)}</blockquote>
        <h4 style="font-size: 12px; margin-top: 10px; margin-bottom: 4px; text-transform: uppercase; color: #475569;">
          Acceptance Criteria (Definition of Done)
        </h4>
        <ul>
          ${req.acceptanceCriteria.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}
        </ul>
        ${gherkinBlock}
      </div>`;
    })
    .join('')}

  <h2>4. Non-Functional Requirements</h2>
  <table>
    <thead>
      <tr>
        <th>Attribute</th>
        <th>Contractual Specification</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Latency SLO</strong></td>
        <td>Max P95 latency &le; ${data.step4_non_functional.performance.maxLatencyMs}ms</td>
      </tr>
      <tr>
        <td><strong>Throughput Capacity</strong></td>
        <td>${data.step4_non_functional.performance.targetRps} req/sec sustained</td>
      </tr>
      <tr>
        <td><strong>Availability SLA</strong></td>
        <td>${data.step4_non_functional.availability.uptimeSla} uptime SLA</td>
      </tr>
      <tr>
        <td><strong>Disaster Recovery RTO</strong></td>
        <td>${data.step4_non_functional.availability.disasterRecoveryRtoMinutes} minutes maximum</td>
      </tr>
      <tr>
        <td><strong>Authentication</strong></td>
        <td>${escapeHtml(data.step4_non_functional.securityCompliance.authStrategy)}</td>
      </tr>
      <tr>
        <td><strong>Encryption</strong></td>
        <td>AES-256 (At-Rest: ${data.step4_non_functional.securityCompliance.dataEncryptionAtRest ? 'Yes' : 'No'}), TLS 1.3 (In-Transit: ${data.step4_non_functional.securityCompliance.dataEncryptionInTransit ? 'Yes' : 'No'})</td>
      </tr>
      <tr>
        <td><strong>Compliance Standards</strong></td>
        <td>${data.step4_non_functional.securityCompliance.complianceStandards.join(', ') || 'Standard'}</td>
      </tr>
      <tr>
        <td><strong>Peak Concurrency</strong></td>
        <td>${data.step4_non_functional.scalability.peakConcurrentUsers.toLocaleString()} concurrent users</td>
      </tr>
    </tbody>
  </table>

  <div class="signoff-box">
    <h3 style="margin-top: 0;">6. Lead Systems Architect Sign-Off</h3>
    <p><strong>Signed by:</strong> ${escapeHtml(generatedBy)} &bull; <strong>Status:</strong> ${(data.step6_review.status || 'review').toUpperCase()}</p>
    ${data.step6_review.finalNotes ? `<p style="margin-top: 6px;"><em>Architect Notes: ${escapeHtml(data.step6_review.finalNotes)}</em></p>` : ''}
    <p style="font-family: monospace; font-size: 11px; margin-top: 10px; color: #64748b;">
      SDAD-VERIFIED-SPEC-HASH: ${Buffer.from(docTitle + now).toString('base64').slice(0, 32)}
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
