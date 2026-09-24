/**
 * SDAD Architecture Diagrams: Type Definitions
 */

export type DiagramType = 'c4_container' | 'sequence_workflow' | 'er_model' | 'governance_state';

export interface ArchitectureDiagram {
  id: string;
  type: DiagramType;
  title: string;
  description: string;
  syntax: string;
}

export interface GeneratedDiagramsCollection {
  c4Container: ArchitectureDiagram;
  sequenceWorkflow: ArchitectureDiagram;
  erModel: ArchitectureDiagram;
  governanceState: ArchitectureDiagram;
}
