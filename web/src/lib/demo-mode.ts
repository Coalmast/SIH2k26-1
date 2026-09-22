// ─── Demo Mode Flag ────────────────────────────────────────────
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// ─── Fake session object (non-null so auth layout renders) ─────
// No real JWT — just enough shape for the code to not crash.
export const DEMO_SESSION = DEMO_MODE ? {
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  token_type: 'bearer',
  expires_in: 86400,
  expires_at: Date.now() + 86400 * 1000,
  user: {
    id: 'demo-user-001',
    email: 'demo@coalindia.gov.in',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: { full_name: 'Demo User — SIH 2026' },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  }
} : null;
