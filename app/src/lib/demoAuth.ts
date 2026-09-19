/**
 * demoAuth.ts
 * -----------
 * Maps well-known seeded user UUIDs (from seed_demo.py) to their roles and mine.
 * These UUIDs match exactly what is in the local Supabase DB after `python seed_demo.py`.
 *
 * NOTE: The JWT tokens here are signed with the local Supabase default JWT secret:
 *   "super-secret-jwt-token-with-at-least-32-characters-long"
 * They are only valid for local development. In production, real Supabase Auth
 * sign-in must be used instead (supabase.auth.signInWithPassword).
 */
export const DEMO_USERS = {
  mine_manager: {
    userId: '00000000-0000-0000-0000-000000000010',
    name: 'Rajesh Kumar',
    role: 'mine_manager',
    mineId: '00000000-0000-0000-0000-000000000004',
    mineName: 'Umrer OCP',
    // JWT: sub = ...0010, exp = 2089-01-01, role = authenticated
    // Signed with local Supabase default secret (dev only)
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMTAiLCJleHAiOjM3NjcyMjU2MDAsInJvbGUiOiJhdXRoZW50aWNhdGVkIn0.efFyYjmrOKqff-4iLBP_wCBhTmW4KM-1-w-JcNfGls0',
  },
  field_officer: {
    userId: '00000000-0000-0000-0000-000000000011',
    name: 'Sunil Patil',
    role: 'field_officer',
    mineId: '00000000-0000-0000-0000-000000000004',
    mineName: 'Umrer OCP',
    // JWT: sub = ...0011, exp = 2089-01-01, role = authenticated
    // Signed with local Supabase default secret (dev only)
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMTEiLCJleHAiOjM3NjcyMjU2MDAsInJvbGUiOiJhdXRoZW50aWNhdGVkIn0.jTkty5kR_Xpyclaf2_Nq5Uf5HbelA8IgIwoqnWoLoTg',
  },
};
