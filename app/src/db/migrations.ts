import { addColumns, createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'inspections',
          columns: [
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
        addColumns({
          table: 'observations',
          columns: [
            { name: 'checklist_item_id', type: 'string', isOptional: true },
            { name: 'statute_ref', type: 'string', isOptional: true },
            { name: 'response_type', type: 'string', isOptional: true },
            { name: 'photo_uris', type: 'string', isOptional: true },
            { name: 'sub_zone', type: 'string', isOptional: true },
            { name: 'gas_readings', type: 'string', isOptional: true },
            { name: 'sync_status', type: 'string' },
            { name: 'remote_id', type: 'string', isOptional: true },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        createTable({
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
    },
  ],
});
