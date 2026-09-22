import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

import { DEMO_MODE } from './demo-mode';
import { MOCK_DATA } from './mock-data';

function createDemoStub() {
  const chain = (table: string): any => {
    const builder = {
      select: () => builder,
      eq: () => builder,
      order: () => builder,
      limit: () => builder,
      in: () => builder,
      gte: () => builder,
      maybeSingle: () => Promise.resolve({ data: MOCK_DATA[table] ? MOCK_DATA[table][0] : null, error: null }),
      single: () => Promise.resolve({ data: MOCK_DATA[table] ? MOCK_DATA[table][0] : null, error: null }),
      then: (resolve: any) => resolve({ data: MOCK_DATA[table] || [], error: null })
    };
    return builder;
  };

  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (_e: any, _cb: any) => ({
        data: { subscription: { unsubscribe: () => {} } }
      }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
    },
    from: (table: string) => chain(table),
    channel: (_name: string) => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
  };
}

export const supabase = DEMO_MODE
  ? (createDemoStub() as any)
  : createClient(supabaseUrl!, supabaseAnonKey!);

