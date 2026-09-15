import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { migrations } from './migrations';
import { 
  Inspection, 
  Observation, 
  IncidentReport, 
  AttendanceRecord, 
  ShiftReport, 
  ChecklistTemplate,
  SafetyObservation,
  ContractWorker,
  MediaAttachment,
  Notification
} from './models';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true, // Recommended for performance
  onSetUpError: error => {
    console.error('WatermelonDB Setup Error:', error);
  }
});

export const database = new Database({
  adapter,
  modelClasses: [
    Inspection,
    Observation,
    IncidentReport,
    AttendanceRecord,
    ShiftReport,
    ChecklistTemplate,
    SafetyObservation,
    ContractWorker,
    MediaAttachment,
    Notification
  ],
});
