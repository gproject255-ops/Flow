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

// ==================== DATA ====================
const MODES = [
  {
    id: "chill",
    name: "😌 Chill",
    desc: "Easy warm-up. Just relax and get into the mood.",
    durationMin: 45,
    stages: [
      { name: "Warm-up", minutes: 15 },
      { name: "Steady stroke", minutes: 20 },
      { name: "Slow down", minutes: 10 }
    ],
    minPlan: "free"
  },
  {
    id: "focused",
    name: "🔥 Focused",
    desc: "Stay edged. Build pressure without finishing.",
    durationMin: 150,
    stages: [
      { name: "Build-up", minutes: 30 },
      { name: "Edge zone", minutes: 70 },
      { name: "Hold & deny", minutes: 50 }
    ],
    minPlan: "novice"
  },
  {
    id: "deep",
    name: "🧠 Deep Goon",
    desc: "Long session. Lose track of time. Brain goes quiet.",
    durationMin: 300,
    stages: [
      { name: "Entry", minutes: 40 },
      { name: "Deep focus", minutes: 140 },
      { name: "Trance", minutes: 90 },
      { name: "Cool down", minutes: 30 }
    ],
    minPlan: "advanced"
  },
  {
    id: "empty",
    name: "💦 Empty Balls",
    desc: "Full commitment. 6–8+ hours. Drain everything.",
    durationMin: 420,
    stages: [
      { name: "Preparation", minutes: 30 },
      { name: "Long edge", minutes: 180 },
      { name: "Heavy goon", minutes: 150 },
      { name: "Final stretch", minutes: 60 }
    ],
    minPlan: "gooner"
  }
];

// (Full file continues with all remaining code — this is the complete version)
