import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children } from '@nozbe/watermelondb/decorators';

export class Inspection extends Model {
  static table = 'inspections';
  static associations = {
    observations: { type: 'has_many', foreignKey: 'inspection_id' },
  } as const;

  @field('mine_id') mineId!: string;
  @field('inspector_id') inspectorId!: string;
  @field('shift') shift!: string;
  @field('zone') zone!: string;
  @field('status') status!: string;
  @readonly @date('created_at') createdAt!: number;
  @readonly @date('updated_at') updatedAt!: number;

  @field('inspection_type') inspectionType!: string;
  @field('checklist_template_id') checklistTemplateId!: string;
  @field('conducted_by') conductedBy!: string;
  @field('geo_stamp_start') geoStampStart?: string;
  @field('geo_stamp_end') geoStampEnd?: string;
  @date('started_at') startedAt?: number;
  @date('completed_at') completedAt?: number;
  @date('submitted_at') submittedAt?: number;
  @date('signed_at') signedAt?: number;
  @field('sync_status') syncStatus!: string;
  @field('current_section') currentSection!: number;
  @field('overall_remarks') overallRemarks?: string;
  @field('observation_count') observationCount!: number;
  @field('violation_count') violationCount!: number;
  @field('remote_id') remoteId?: string;

  @children('observations') observations!: any;
}

export class Observation extends Model {
  static table = 'observations';
  static associations = {
    inspections: { type: 'belongs_to', key: 'inspection_id' },
  } as const;

  @field('inspection_id') inspectionId!: string;
  @field('category') category!: string;
  @field('severity') severity!: string;
  @field('description') description!: string;
  @field('photo_uri') photoUri?: string;
  @field('is_compliant') isCompliant!: boolean;
  @readonly @date('created_at') createdAt!: number;

  @field('checklist_item_id') checklistItemId?: string;
  @field('statute_ref') statuteRef?: string;
  @field('response_type') responseType!: string;
  @field('photo_uris') photoUris?: string;
  @field('sub_zone') subZone?: string;
  @field('gas_readings') gasReadings?: string;
  @field('sync_status') syncStatus!: string;
  @field('remote_id') remoteId?: string;
  @date('updated_at') updatedAt?: number;
}

export class IncidentReport extends Model {
  static table = 'incident_reports';

  @field('mine_id') mineId!: string;
  @field('reported_by') reportedBy!: string;
  @field('description') description!: string;
  @readonly @date('created_at') createdAt!: number;
  @field('sync_status') syncStatus!: string;
  
  @field('incident_type') incidentType!: string;
  @field('severity') severity!: string;
  @field('ai_suggested_severity') aiSuggestedSeverity?: string;
  @field('ai_suggested_category') aiSuggestedCategory?: string;
  @field('geo_stamp') geoStamp?: string;
  @field('zone') zone?: string;
  @field('shift') shift?: string;
  @field('persons_involved') personsInvolved?: string;
  @field('immediate_actions_taken') immediateActionsTaken?: string;
  @field('is_linked_to_accident_register') isLinkedToAccidentRegister!: boolean;
  @field('corrective_action_id') correctiveActionId?: string;
  @date('reported_at') reportedAt!: number;
  @field('remote_id') remoteId?: string;
  @field('local_photo_ids') localPhotoIds?: string;
}

export class AttendanceRecord extends Model {
  static table = 'attendance_records';

  @field('mine_id') mineId!: string;
  @field('worker_id_card_number') workerIdCardNumber!: string;
  @field('worker_name') workerName?: string;
  @field('worker_type') workerType!: string;
  @field('contractor_id') contractorId?: string;
  @field('shift') shift!: string;
  @date('check_in_at') checkInAt!: number;
  @field('geo_stamp') geoStamp!: string;
  @field('location_mismatch') locationMismatch!: boolean;
  @field('training_expired') trainingExpired!: boolean;
  @field('flagged_for_review') flaggedForReview!: boolean;
  @field('sync_status') syncStatus!: string;
  @readonly @date('created_at') createdAt!: number;
}

export class ShiftReport extends Model {
  static table = 'shift_reports';

  @field('mine_id') mineId!: string;
  @field('zone') zone!: string;
  @field('shift') shift!: string;
  @date('report_date') reportDate!: number;
  @field('workforce_count') workforceCount!: number;
  @field('regular_count') regularCount!: number;
  @field('contract_count') contractCount!: number;
  @field('gas_readings') gasReadings!: string;
  @field('shift_observations') shiftObservations?: string;
  @field('equipment_status') equipmentStatus?: string;
  @field('production_coal_tonnes') productionCoalTonnes?: number;
  @field('production_ob_cum') productionObCum?: number;
  @field('handover_notes') handoverNotes?: string;
  @field('ch4_alert_fired') ch4AlertFired!: boolean;
  @field('geo_stamp') geoStamp!: string;
  @field('sync_status') syncStatus!: string;
  @field('remote_id') remoteId?: string;
  @readonly @date('created_at') createdAt!: number;
}

export class ChecklistTemplate extends Model {
  static table = 'checklist_templates';

  @field('remote_id') remoteId!: string;
  @field('name') name!: string;
  @field('inspection_type') inspectionType!: string;
  @field('regulation_ref') regulationRef?: string;
  @field('checklist_items') checklistItems!: string;
  @field('version') version!: number;
  @field('is_active') isActive!: boolean;
  @date('synced_at') syncedAt!: number;
}

export class SafetyObservation extends Model {
  static table = 'safety_observations';

  @field('mine_id') mineId!: string;
  @field('zone') zone!: string;
  @field('observation_type') observationType!: string;
  @field('category') category?: string;
  @field('description') description!: string;
  @field('geo_stamp') geoStamp?: string;
  @field('assigned_to_id') assignedToId?: string;
  @field('status') status!: string;
  @date('corrected_at') correctedAt?: number;
  @field('observed_by') observedBy!: string;
  @date('observed_at') observedAt!: number;
  @field('sync_status') syncStatus!: string;
  @field('remote_id') remoteId?: string;
  @field('local_photo_id') localPhotoId?: string;
}

export class ContractWorker extends Model {
  static table = 'contract_workers';

  @field('remote_id') remoteId!: string;
  @field('contractor_id') contractorId!: string;
  @field('name') name!: string;
  @field('worker_id_card_number') workerIdCardNumber!: string;
  @field('training_certificates') trainingCertificates!: string;
  @field('is_active') isActive!: boolean;
  @date('synced_at') syncedAt!: number;
}

export class MediaAttachment extends Model {
  static table = 'media_attachments';

  @field('parent_type') parentType!: string;
  @field('parent_id') parentId!: string;
  @field('media_type') mediaType!: string;
  @field('local_file_path') localFilePath!: string;
  @field('file_url') fileUrl?: string;
  @field('sync_status') syncStatus!: string;
  @field('remote_id') remoteId?: string;
  @field('captured_by') capturedBy!: string;
  @readonly @date('created_at') createdAt!: number;
}

export * from './Notification';
