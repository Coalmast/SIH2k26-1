import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'inspections',
      columns: [
        { name: 'mine_id', type: 'string' },
        { name: 'inspector_id', type: 'string' },
        { name: 'shift', type: 'string' },
        { name: 'zone', type: 'string' },
        { name: 'status', type: 'string' }, // PENDING, IN_PROGRESS, COMPLETED, SYNCED
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        // New in v2
        { name: 'inspection_type', type: 'string' },
        { name: 'checklist_template_id', type: 'string' },
        { name: 'conducted_by', type: 'string' },
        { name: 'geo_stamp_start', type: 'string', isOptional: true },
        { name: 'geo_stamp_end', type: 'string', isOptional: true },
        { name: 'started_at', type: 'number', isOptional: true },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'submitted_at', type: 'number', isOptional: true },
        { name: 'signed_at', type: 'number', isOptional: true },
        { name: 'sync_status', type: 'string' },
        { name: 'current_section', type: 'number' },
        { name: 'overall_remarks', type: 'string', isOptional: true },
        { name: 'observation_count', type: 'number' },
        { name: 'violation_count', type: 'number' },
        { name: 'remote_id', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'observations',
      columns: [
        { name: 'inspection_id', type: 'string' },
        { name: 'category', type: 'string' }, // ROOF, VENTILATION, GAS
        { name: 'severity', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'photo_uri', type: 'string', isOptional: true },
        { name: 'is_compliant', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        // New in v2
        { name: 'checklist_item_id', type: 'string', isOptional: true },
        { name: 'statute_ref', type: 'string', isOptional: true },
        { name: 'response_type', type: 'string', isOptional: true },
        { name: 'photo_uris', type: 'string', isOptional: true },
        { name: 'sub_zone', type: 'string', isOptional: true },
        { name: 'gas_readings', type: 'string', isOptional: true },
        { name: 'sync_status', type: 'string' },
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'incident_reports',
      columns: [
        { name: 'mine_id', type: 'string' },
        { name: 'reported_by', type: 'string' },
        { name: 'type', type: 'string' }, // INJURY, NEAR_MISS, GAS_LEAK
        { name: 'description', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'attendance_records',
      columns: [
        { name: 'mine_id', type: 'string' },
        { name: 'worker_id', type: 'string' },
        { name: 'scan_time', type: 'number' },
        { name: 'scan_type', type: 'string' }, // IN, OUT
        { name: 'location_lat', type: 'number', isOptional: true },
        { name: 'location_lon', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'shift_reports',
      columns: [
        { name: 'mine_id', type: 'string' },
        { name: 'overman_id', type: 'string' },
        { name: 'shift_date', type: 'string' },
        { name: 'ch4_level', type: 'number' },
        { name: 'co_level', type: 'number' },
        { name: 'o2_level', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'checklist_templates',
      columns: [
        { name: 'remote_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'inspection_type', type: 'string' },
        { name: 'regulation_ref', type: 'string', isOptional: true },
        { name: 'checklist_items', type: 'string' },
        { name: 'version', type: 'number' },
        { name: 'is_active', type: 'boolean' },
        { name: 'synced_at', type: 'number' },
      ],
    }),
  ],
});
