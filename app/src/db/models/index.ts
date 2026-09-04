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
  @field('response_type') responseType?: string;
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
  @field('type') type!: string;
  @field('description') description!: string;
  @field('location') location!: string;
  @field('status') status!: string;
  @readonly @date('created_at') createdAt!: number;
}

export class AttendanceRecord extends Model {
  static table = 'attendance_records';

  @field('mine_id') mineId!: string;
  @field('worker_id') workerId!: string;
  @date('scan_time') scanTime!: number;
  @field('scan_type') scanType!: string;
  @field('location_lat') locationLat?: number;
  @field('location_lon') locationLon?: number;
  @readonly @date('created_at') createdAt!: number;
}

export class ShiftReport extends Model {
  static table = 'shift_reports';

  @field('mine_id') mineId!: string;
  @field('overman_id') overmanId!: string;
  @field('shift_date') shiftDate!: string;
  @field('ch4_level') ch4Level!: number;
  @field('co_level') coLevel!: number;
  @field('o2_level') o2Level!: number;
  @field('status') status!: string;
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
