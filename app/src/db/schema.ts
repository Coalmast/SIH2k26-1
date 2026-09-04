import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
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
  ],
});
