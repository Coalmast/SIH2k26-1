export enum IncidentTypeEnum {
  ROOF_FALL = 'roof_fall',
  GAS_EVENT = 'gas_event',
  EQUIPMENT = 'equipment',
  INJURY = 'injury',
  NEAR_MISS = 'near_miss',
  FIRE = 'fire',
  INUNDATION = 'inundation',
  EXPLOSIVES = 'explosives',
  HAULAGE = 'haulage',
  ELECTRICAL = 'electrical',
  OTHER = 'other',
}

export enum ObservationTypeEnum {
  UNSAFE_ACT = 'unsafe_act',
  UNSAFE_CONDITION = 'unsafe_condition',
  POSITIVE = 'positive',
}

export enum SafetyObsStatusEnum {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum ShiftEnum {
  A = 'A',
  B = 'B',
  C = 'C',
  GENERAL = 'general',
}

export enum SeverityEnum {
  MINOR = 'minor',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum SyncStatusEnum {
  PENDING_SYNC = 'pending_sync',
  SYNCED = 'synced',
  PRIORITY = 'priority',
  PENDING_UPLOAD = 'pending_upload',
  UPLOADED = 'uploaded',
}
