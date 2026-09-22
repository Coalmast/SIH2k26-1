// Mock Data Index for Demo Mode

export const MOCK_DATA: Record<string, any[]> = {
  mines: [
    {
      id: 'mine-001',
      name: 'Umrer OCP',
      subsidiary_id: 'sub-001',
      status: 'active',
      location: { lat: 20.85, lng: 79.32 },
      subsidiaries: { name: 'Western Coalfields Limited' },
    },
    {
      id: 'mine-002',
      name: 'Wardha Valley',
      subsidiary_id: 'sub-001',
      status: 'active',
      location: { lat: 20.0, lng: 79.1 },
      subsidiaries: { name: 'Western Coalfields Limited' },
    },
    {
      id: 'mine-003',
      name: 'Jayant Open Cast',
      subsidiary_id: 'sub-002',
      status: 'active',
      location: { lat: 24.1, lng: 82.6 },
      subsidiaries: { name: 'Northern Coalfields Limited' },
    }
  ],
  environment_readings: [
    { id: 'env-1', mine_id: 'mine-001', parameter: 'pm10', reading_value: 85, threshold_breached: false, created_at: new Date().toISOString() },
    { id: 'env-2', mine_id: 'mine-001', parameter: 'pm2_5', reading_value: 45, threshold_breached: false, created_at: new Date().toISOString() },
    { id: 'env-3', mine_id: 'mine-001', parameter: 'ph', reading_value: 7.2, threshold_breached: false, created_at: new Date().toISOString() },
    { id: 'env-4', mine_id: 'mine-001', parameter: 'noise_db', reading_value: 78, threshold_breached: false, created_at: new Date().toISOString() },
  ],
  attendance_records: [
    { id: 'att-1', mine_id: 'mine-001', shift_type: 'A', status: 'present', created_at: new Date().toISOString() },
    { id: 'att-2', mine_id: 'mine-001', shift_type: 'B', status: 'present', created_at: new Date().toISOString() },
    { id: 'att-3', mine_id: 'mine-001', shift_type: 'C', status: 'absent', created_at: new Date().toISOString() },
  ],
  alerts: [
    { id: 'al-1', title: 'New inspection assigned', message: 'Assigned to field inspector.', priority: 'medium', type: 'ASSIGNED', severity: 'medium', is_read: false, read: false, created_at: new Date().toISOString() },
    { id: 'al-2', title: 'High PM10 Level', message: 'Dust levels exceeded limit at Umrer OCP.', priority: 'critical', type: 'VIOLATION', severity: 'critical', is_read: false, read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: 'al-3', title: 'Inspection Due', message: 'Machinery safety audit due.', priority: 'high', type: 'REMINDER', severity: 'high', is_read: false, read: false, created_at: new Date(Date.now() - 7200000).toISOString() }
  ],
  users: [
    { id: 'demo-user-001', keycloak_subject: 'kc-1', full_name: 'Demo Admin', email: 'admin@coalindia.gov.in', designation: 'Super Admin', is_active: true, created_at: new Date().toISOString(), user_roles: [{ roles: { name: 'super_admin' } }] },
    { id: 'demo-user-002', keycloak_subject: 'kc-2', full_name: 'Ramesh Singh', email: 'manager@coalindia.gov.in', designation: 'Mine Manager', is_active: true, created_at: new Date().toISOString(), user_roles: [{ roles: { name: 'mine_manager' } }] }
  ],
  user_roles: [
    { user_id: 'demo-user-001', roles: { name: 'super_admin' } },
  ],
  statutory_reports: [
    { id: 'rep-1', report_type: 'Annual Return', status: 'submitted', file_url: '#', hash: '0xabc', created_at: new Date().toISOString(), submitted_at: new Date().toISOString(), mine_id: 'mine-001' }
  ],
  compliance_instances: [
    { id: 'comp-1', status: 'pending', due_date: new Date(Date.now() + 86400000 * 5).toISOString(), compliance_requirements: { title: 'Water Quality Check' }, mine_id: 'mine-001' },
    { id: 'comp-2', status: 'breached', due_date: new Date(Date.now() - 86400000 * 2).toISOString(), compliance_requirements: { title: 'Air Quality Check' }, mine_id: 'mine-001' },
    { id: 'comp-3', status: 'approved', due_date: new Date(Date.now() - 86400000 * 10).toISOString(), compliance_requirements: { title: 'Safety Audit' }, mine_id: 'mine-001' }
  ]
};

// Generate some mock production data for charts
MOCK_DATA.production_readings = Array.from({ length: 180 }, (_, i) => ({
  mine_id: 'mine-001',
  quantity_tonnes: 40000 + Math.random() * 10000,
  created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
})).reverse();


// API mock responses (Axios/fetch matchers)
export function getMockApiResponse(method: string, url: string): any {
  if (url.includes('/api/v1/inspections/all/corrective-actions')) return [];
  if (url.includes('/api/v1/inspections/all/violations')) return [];
  if (url.includes('/api/v1/inspections') && method.toUpperCase() === 'POST') return { id: 'new-ins-123', status: 'draft' };
  if (url.includes('/api/v1/inspections')) return [];
  if (url.includes('/api/v1/ai/anomalies')) return [];
  if (url.includes('/api/v1/ai/score/mine')) return { risk_score: 61, risk_factors: ['High dust', 'Pending inspections'] };
  return {};
}

export function getMockFetchResponse(url: string): any {
  if (url.includes('/api/v1/compliance/mines/all/instances') || url.includes('/api/v1/compliance/mines/mine-001/instances')) return MOCK_DATA.compliance_instances;
  if (url.includes('/api/v1/compliance/mines/mine-001/health-score')) return { score: 84 };
  if (url.includes('/api/v1/reports/generate')) return { job_id: 'job-123' };
  if (url.includes('/api/v1/reports/jobs')) return { status: 'completed', file_url: '#' };
  if (url.includes('calendar')) return MOCK_DATA.compliance_instances;
  return {};
}
