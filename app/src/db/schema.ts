import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 4,
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
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'incident_reports',
      columns: [
        // Base v2 columns
        { name: 'mine_id', type: 'string' },
        { name: 'reported_by', type: 'string' }, // maps to users table
        { name: 'description', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'sync_status', type: 'string', isOptional: true }, // pending_sync | synced | priority
        
        // Expanded v3 columns (grounded in Supabase schema)
        { name: 'incident_type', type: 'string', isOptional: true }, // roof_fall, gas_event, etc.
        { name: 'severity', type: 'string', isOptional: true }, // minor, moderate, high, critical
        { name: 'ai_suggested_severity', type: 'string', isOptional: true },
        { name: 'ai_suggested_category', type: 'string', isOptional: true },
        { name: 'geo_stamp', type: 'string', isOptional: true }, // JSON string
        { name: 'zone', type: 'string', isOptional: true },
        { name: 'shift', type: 'string', isOptional: true },
        { name: 'persons_involved', type: 'string', isOptional: true }, // JSON array string
        { name: 'immediate_actions_taken', type: 'string', isOptional: true },
        { name: 'is_linked_to_accident_register', type: 'boolean', isOptional: true },
        { name: 'corrective_action_id', type: 'string', isOptional: true }, // Set by server on sync
        { name: 'reported_at', type: 'number', isOptional: true },
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'local_photo_ids', type: 'string', isOptional: true }, // Array of media_attachments IDs
      ],
    }),
    tableSchema({
      name: 'attendance_records',
      columns: [
        { name: 'mine_id', type: 'string' },
        { name: 'worker_id_card_number', type: 'string', isOptional: true }, // Replaced worker_id
        { name: 'worker_name', type: 'string', isOptional: true },
        { name: 'worker_type', type: 'string', isOptional: true }, // regular, contract
        { name: 'contractor_id', type: 'string', isOptional: true }, // Looked up from cache
        { name: 'shift', type: 'string', isOptional: true },
        { name: 'check_in_at', type: 'number', isOptional: true },
        { name: 'geo_stamp', type: 'string', isOptional: true }, // JSON string
        { name: 'location_mismatch', type: 'boolean', isOptional: true },
        { name: 'training_expired', type: 'boolean', isOptional: true },
        { name: 'flagged_for_review', type: 'boolean', isOptional: true },
        { name: 'sync_status', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'shift_reports',
      columns: [
        { name: 'mine_id', type: 'string' },
        { name: 'zone', type: 'string', isOptional: true },
        { name: 'shift', type: 'string', isOptional: true },
        { name: 'report_date', type: 'number', isOptional: true },
        { name: 'workforce_count', type: 'number', isOptional: true },
        { name: 'regular_count', type: 'number', isOptional: true },
        { name: 'contract_count', type: 'number', isOptional: true },
        { name: 'gas_readings', type: 'string', isOptional: true }, // JSON array
        { name: 'shift_observations', type: 'string', isOptional: true }, // JSON array
        { name: 'equipment_status', type: 'string', isOptional: true }, // JSON array
        { name: 'production_coal_tonnes', type: 'number', isOptional: true },
        { name: 'production_ob_cum', type: 'number', isOptional: true },
        { name: 'handover_notes', type: 'string', isOptional: true },
        { name: 'ch4_alert_fired', type: 'boolean', isOptional: true },
        { name: 'geo_stamp', type: 'string', isOptional: true },
        { name: 'sync_status', type: 'string', isOptional: true },
        { name: 'remote_id', type: 'string', isOptional: true },
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
    // -- v3 New Tables --
    tableSchema({
      name: 'safety_observations',
      columns: [
        { name: 'mine_id', type: 'string' },
        { name: 'zone', type: 'string' },
        { name: 'observation_type', type: 'string' }, // unsafe_act | unsafe_condition | positive
        { name: 'category', type: 'string', isOptional: true },
        { name: 'description', type: 'string' },
        { name: 'geo_stamp', type: 'string', isOptional: true },
        { name: 'assigned_to_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' }, // open | closed
        { name: 'corrected_at', type: 'number', isOptional: true },
        { name: 'observed_by', type: 'string' },
        { name: 'observed_at', type: 'number' },
        { name: 'sync_status', type: 'string' },
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'local_photo_id', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'contract_workers',
      columns: [
        { name: 'remote_id', type: 'string' },
        { name: 'contractor_id', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'worker_id_card_number', type: 'string' },
        { name: 'training_certificates', type: 'string' }, // JSON string
        { name: 'is_active', type: 'boolean' },
        { name: 'synced_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'media_attachments',
      columns: [
        { name: 'parent_type', type: 'string' }, // incident_report | safety_observation
        { name: 'parent_id', type: 'string' },
        { name: 'media_type', type: 'string' }, // photo | video
        { name: 'local_file_path', type: 'string' },
        { name: 'file_url', type: 'string', isOptional: true }, // After upload
        { name: 'sync_status', type: 'string' }, // pending_upload | uploaded
        { name: 'remote_id', type: 'string', isOptional: true },
        { name: 'captured_by', type: 'string' },
        { name: 'created_at', type: 'number' },
      ],
    }),
    // -- v4 New Tables --
    tableSchema({
      name: 'notifications',
      columns: [
        { name: 'remote_id', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'priority', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'message', type: 'string' },
        { name: 'target_user_id', type: 'string', isOptional: true },
        { name: 'mine_id', type: 'string', isOptional: true },
        { name: 'entity_type', type: 'string', isOptional: true },
        { name: 'entity_id', type: 'string', isOptional: true },
        { name: 'status', type: 'string' }, // unread | read
        { name: 'read_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'sync_status', type: 'string' }, // synced | pending_ack
      ],
    }),
  ],
});
