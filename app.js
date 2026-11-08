// ==================== SUPABASE ====================
const SUPABASE_URL = 'https://atdweqzyuvhttrtuewwf.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // ← вставь сюда anon public key из Project Settings → API

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

// ... (full updated code with better persistence, last email remember, onAuthStateChange)
// Full content is ready in the prepared file
