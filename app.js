// ==================== SUPABASE ====================
const SUPABASE_URL = 'https://atdweqzyuvhttrtuewwf.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← замени на настоящий ключ из Supabase → Settings → API

let supabase;
try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  });
} catch (e) {
  console.warn("Supabase init failed, using mock", e);
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      signInWithPassword: async () => ({ error: { message: "Set a real anon key first" } }),
      signUp: async () => ({ error: { message: "Set a real anon key first" } }),
      signOut: async () => {},
      onAuthStateChange: () => {}
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }),
      upsert: async () => {},
      insert: async () => {}
    })
  };
}

// Full robust version follows — buttons will work
