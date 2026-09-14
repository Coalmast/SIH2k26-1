import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Session } from '@supabase/supabase-js'

async function importAuthStore() {
  const { useAuthStore } = await import('./auth-store')
  return useAuthStore
}

const sampleSession: Session = {
  access_token: 'session-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  expires_at: 1_700_000_000,
  token_type: 'bearer',
  user: {
    id: 'user-1',
    email: 'user@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00Z',
  },
}

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.mock('@/lib/supabase', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: { roles: { name: 'mine_manager' } }, error: null }),
            }),
          }),
        }),
      },
    }))
  })

  it('starts with initial state', async () => {
    const useAuthStore = await importAuthStore()

    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.session).toBeNull()
    expect(useAuthStore.getState().auth.isLoading).toBe(true)
  })

  it('updates state when session is set', async () => {
    const useAuthStore = await importAuthStore()
    
    // Mock the fetchRoleAndPermissions to prevent actual async call side-effects in simple setSession test
    const fetchSpy = vi.spyOn(useAuthStore.getState(), 'fetchRoleAndPermissions').mockImplementation(async () => {})

    useAuthStore.getState().setSession(sampleSession)

    expect(useAuthStore.getState().auth.session).toEqual(sampleSession)
    expect(useAuthStore.getState().auth.user?.id).toBe('user-1')
    expect(useAuthStore.getState().auth.user?.email).toBe('user@example.com')
    expect(useAuthStore.getState().auth.isLoading).toBe(false)
    expect(fetchSpy).toHaveBeenCalledWith('user-1', 'user@example.com')
  })

  it('clears state when session is set to null', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().setSession(null)

    expect(useAuthStore.getState().auth.session).toBeNull()
    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.isLoading).toBe(false)
  })

  it('updates role and permissions via setUserMeta', async () => {
    const useAuthStore = await importAuthStore()
    
    // Set a dummy user first
    useAuthStore.setState((state) => ({
      auth: { ...state.auth, user: { id: 'u1', email: 'u1@ex.com', role: 'authenticated' } }
    }))

    useAuthStore.getState().setUserMeta('mine_manager', ['mine-1'], 'sub-1')

    expect(useAuthStore.getState().auth.role).toBe('mine_manager')
    expect(useAuthStore.getState().auth.mineIds).toEqual(['mine-1'])
    expect(useAuthStore.getState().auth.subsidiaryId).toBe('sub-1')
    expect(useAuthStore.getState().auth.permissions).toContain('mine:write')
  })

  it('reset clears all state', async () => {
    const useAuthStore = await importAuthStore()
    
    // Set dummy state
    useAuthStore.setState((state) => ({
      auth: { ...state.auth, session: sampleSession, user: { id: 'u1', email: 'u1@ex.com', role: 'authenticated' } }
    }))

    useAuthStore.getState().reset()

    expect(useAuthStore.getState().auth.user).toBeNull()
    expect(useAuthStore.getState().auth.session).toBeNull()
    expect(useAuthStore.getState().auth.isLoading).toBe(false)
  })
})
