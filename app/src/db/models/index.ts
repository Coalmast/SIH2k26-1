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
