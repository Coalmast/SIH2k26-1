export type InspectionTypeEnum = 
  | 'dgms_annual_general'
  | 'dgms_surprise'
  | 'dgms_inquiry'
  | 'internal_safety_committee'
  | 'environmental_pcb'
  | 'medical_fitness'
  | 'electrical'
  | 'explosives';

export type InspectionStatus = 'draft' | 'in_progress' | 'submitted' | 'reviewed';
export type SyncStatusEnum = 'pending_sync' | 'synced' | 'error';
export type ObsStatusEnum = 'ok' | 'non_compliant' | 'observation_only';
export type ObsSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface GeoStamp {
  lat: number;
  lng: number;
  accuracy?: number | null;
  timestamp?: string | null;
}

export interface ChecklistItem {
  id: string;
  text: string;
  regulationRef?: string;
  allowNa?: boolean;
}

export interface ChecklistSection {
  sectionTitle: string;
  regulation: string;
  questions: ChecklistItem[];
}

export interface InspectionCreate {
  mine_id: string;
  inspection_type: InspectionTypeEnum;
  checklist_template_id: string;
  scheduled_date: string;
  zone?: string;
}

export interface ObservationCreate {
  checklist_item_id: string;
  category: string;
  description: string;
  status: ObsStatusEnum;
  severity: ObsSeverity;
  geo_stamp?: GeoStamp;
}

export interface InspectionSubmitRequest {
  geo_stamp?: GeoStamp;
  overall_remarks?: string;
}
