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

// ==================== DATA ====================
const MODES = [
  { id: "chill", name: "😌 Chill", desc: "Easy warm-up. Just relax and get into the mood.", durationMin: 45, stages: [{ name: "Warm-up", minutes: 15 }, { name: "Steady stroke", minutes: 20 }, { name: "Slow down", minutes: 10 }], minPlan: "free" },
  { id: "focused", name: "🔥 Focused", desc: "Stay edged. Build pressure without finishing.", durationMin: 150, stages: [{ name: "Build-up", minutes: 30 }, { name: "Edge zone", minutes: 70 }, { name: "Hold & deny", minutes: 50 }], minPlan: "novice" },
  { id: "deep", name: "🧠 Deep Goon", desc: "Long session. Lose track of time. Brain goes quiet.", durationMin: 300, stages: [{ name: "Entry", minutes: 40 }, { name: "Deep focus", minutes: 140 }, { name: "Trance", minutes: 90 }, { name: "Cool down", minutes: 30 }], minPlan: "advanced" },
  { id: "empty", name: "💦 Empty Balls", desc: "Full commitment. 6–8+ hours. Drain everything.", durationMin: 420, stages: [{ name: "Preparation", minutes: 30 }, { name: "Long edge", minutes: 180 }, { name: "Heavy goon", minutes: 150 }, { name: "Final stretch", minutes: 60 }], minPlan: "gooner" }
];

const PLANS = [
  { id: "free", name: "Free", price: 0, features: ["😌 Chill mode only", "Basic tips", "Local history"] },
  { id: "novice", name: "Novice", price: 4.99, features: ["🔥 Focused mode unlocked", "More prompts & tips", "Streak tracking", "Session history"] },
  { id: "advanced", name: "Advanced", price: 9.99, features: ["🧠 Deep Goon mode", "Advanced prompts", "Full history & stats", "Custom tip intensity"] },
  { id: "gooner", name: "👑 Gooner", price: 14.99, discountPrice: 11.99, badge: "Best Value", features: ["💦 Empty Balls mode unlocked", "All modes fully available", "Maximum immersion tips", "Priority & intense prompts", "Gooner status badge", "Early access to new modes", "Full progress analytics", "Exclusive long-session guides"] }
];

const TIPS = {
  general: ["Add more lube. Dry friction kills long sessions.", "Keep your eyes on the screen. Don't look away.", "Breathe slowly. Don't rush the strokes.", "If you feel close — stop completely for 20–30 seconds.", "Loosen your grip. Light touch lasts longer.", "Stay present. Don't start planning the rest of the day.", "Change position if your arm gets tired.", "Headphones help. Cut off the outside world."],
  edge: ["You're getting close. Slow down right now.", "Stop stroking. Just hold and breathe.", "Look at the screen but don't move your hand.", "Count to 30 before you touch again.", "This is the edge. Stay here as long as you can."],
  deep: ["Don't think. Just watch and feel.", "Time doesn't matter anymore. Keep going.", "Your only job is to stay in this state.", "More lube. Always more lube on long sessions.", "If your mind wanders — bring it back to the screen."]
};

// ==================== STATE ====================
const state = { prefs: [], plan: "free", sessions: [], currentSession: null, timerInterval: null, paused: false, elapsedSeconds: 0, user: null, isSignUp: false };

// ==================== AUTH ====================
async function checkAuth() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      state.user = session.user;
      await loadUserData();
      showMainApp();
      return;
    }
  } catch (e) { console.warn(e); }
  const lastEmail = localStorage.getItem("flow_last_email");
  if (lastEmail) {
    const emailInput = document.getElementById("auth-email");
    if (emailInput) emailInput.value = lastEmail;
  }
  showScreen("auth");
}

async function handleAuth() {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const errorEl = document.getElementById("auth-error");
  errorEl.textContent = "";
  if (!email || !password) { errorEl.textContent = "Enter email and password"; return; }

  try {
    let result;
    if (state.isSignUp) {
      result = await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      if (result.data.user && !result.data.session) {
        errorEl.textContent = "Check your email to confirm the account";
        return;
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
    }
    localStorage.setItem("flow_last_email", email);
    state.user = result.data.user;
    await loadUserData();
    showMainApp();
  } catch (err) {
    errorEl.textContent = err.message || "Auth failed (check anon key)";
  }
}

function toggleAuthMode() {
  state.isSignUp = !state.isSignUp;
  document.getElementById("auth-title").textContent = state.isSignUp ? "Create account" : "Sign in";
  document.getElementById("btn-auth-submit").textContent = state.isSignUp ? "Sign up" : "Continue";
  document.getElementById("btn-auth-toggle").textContent = state.isSignUp ? "Already have an account?" : "Create account";
  document.getElementById("auth-error").textContent = "";
}

async function signOut() {
  try { await supabase.auth.signOut(); } catch (e) {}
  state.user = null;
  state.prefs = [];
  state.plan = "free";
  state.sessions = [];
  showScreen("auth");
}

try {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session) {
      state.user = session.user;
      await loadUserData();
      showMainApp();
    } else if (event === "SIGNED_OUT") {
      state.user = null;
      showScreen("auth");
    }
  });
} catch (e) {}

// ==================== DATA ====================
async function loadUserData() {
  if (!state.user) return;
  try {
    const { data: profile } = await supabase.from("profiles").select("prefs, plan").eq("id", state.user.id).single();
    if (profile) { state.prefs = profile.prefs || []; state.plan = profile.plan || "free"; }
    const { data: sessions } = await supabase.from("sessions").select("*").eq("user_id", state.user.id).order("ended_at", { ascending: false });
    state.sessions = (sessions || []).map(s => ({ modeId: s.mode_id, durationSeconds: s.duration_seconds, endedAt: new Date(s.ended_at).getTime() }));
  } catch (e) { console.warn(e); }
}

async function saveProfile() {
  if (!state.user) return;
  try { await supabase.from("profiles").upsert({ id: state.user.id, prefs: state.prefs, plan: state.plan, updated_at: new Date().toISOString() }); } catch (e) {}
}

async function saveSession(session) {
  if (!state.user) return;
  try { await supabase.from("sessions").insert({ user_id: state.user.id, mode_id: session.modeId, duration_seconds: session.durationSeconds, ended_at: new Date(session.endedAt).toISOString() }); } catch (e) {}
}

// ==================== HELPERS ====================
function planLevel(planId) { return ["free", "novice", "advanced", "gooner"].indexOf(planId); }
function canAccessMode(mode) { return planLevel(state.plan) >= planLevel(mode.minPlan); }
function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600), m = Math.floor((totalSeconds % 3600) / 60), s = totalSeconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
}
function formatDuration(minutes) {
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return m ? `~${h}h ${m}m` : `~${h}h`;
}
function getRandomTip(modeId) {
  let pool = [...TIPS.general];
  if (["focused", "deep", "empty"].includes(modeId)) pool = pool.concat(TIPS.edge);
  if (["deep", "empty"].includes(modeId)) pool = pool.concat(TIPS.deep);
  return pool[Math.floor(Math.random() * pool.length)];
}
function getCurrentStage(mode, elapsedSeconds) {
  let accumulated = 0;
  for (let i = 0; i < mode.stages.length; i++) {
    accumulated += mode.stages[i].minutes * 60;
    if (elapsedSeconds < accumulated) {
      const stageStart = accumulated - mode.stages[i].minutes * 60;
      const progress = ((elapsedSeconds - stageStart) / (mode.stages[i].minutes * 60)) * 100;
      return { index: i, name: mode.stages[i].name, progress: Math.min(100, progress) };
    }
  }
  return { index: mode.stages.length - 1, name: mode.stages[mode.stages.length - 1].name, progress: 100 };
}

// ==================== UI ====================
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById("screen-" + id);
  if (el) el.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.screen === id));
}

function showMainApp() {
  if (state.prefs.length > 0) {
    showScreen("home");
    renderModes();
    renderStats();
    renderHistory();
  } else {
    showScreen("onboarding");
  }
}

function renderModes() {
  const container = document.getElementById("modes-list");
  container.innerHTML = "";
  MODES.forEach(mode => {
    const hasAccess = canAccessMode(mode);
    const card = document.createElement("div");
    card.className = "mode-card";
    card.innerHTML = `<h3>${mode.name}</h3><p>${mode.desc}</p><div class="duration">${formatDuration(mode.durationMin)}</div>`;
    card.addEventListener("click", () => {
      if (!hasAccess) {
        showScreen("subs");
        renderPlans();
        setTimeout(() => {
          const goonerCard = document.querySelector(".plan-card.featured");
          if (goonerCard) {
            goonerCard.scrollIntoView({ behavior: "smooth", block: "center" });
            goonerCard.classList.add("pulse-highlight");
            setTimeout(() => goonerCard.classList.remove("pulse-highlight"), 1800);
          }
        }, 150);
        return;
      }
      startSession(mode.id);
    });
    container.appendChild(card);
  });
}

function renderStats() {
  const totalSessions = state.sessions.length;
  const totalMinutes = state.sessions.reduce((sum, s) => sum + (s.durationSeconds || 0) / 60, 0);
  const hours = (totalMinutes / 60).toFixed(1);
  let streak = 0;
  if (state.sessions.length > 0) {
    const days = new Set(state.sessions.map(s => new Date(s.endedAt).toDateString()));
    const sortedDays = [...days].sort((a, b) => new Date(b) - new Date(a));
    let current = new Date();
    for (let i = 0; i < sortedDays.length; i++) {
      if (sortedDays.includes(current.toDateString())) { streak++; current.setDate(current.getDate() - 1); } else break;
    }
  }
  document.getElementById("stat-sessions").textContent = totalSessions;
  document.getElementById("stat-hours").textContent = hours + "h";
  document.getElementById("stat-streak").textContent = streak;
}

function renderHistory() {
  const list = document.getElementById("history-list");
  const empty = document.getElementById("history-empty");
  if (state.sessions.length === 0) { list.innerHTML = ""; empty.classList.remove("hidden"); return; }
  empty.classList.add("hidden");
  list.innerHTML = "";
  [...state.sessions].sort((a, b) => b.endedAt - a.endedAt).forEach(s => {
    const mode = MODES.find(m => m.id === s.modeId);
    const item = document.createElement("div");
    item.className = "history-item";
    const date = new Date(s.endedAt);
    item.innerHTML = `<div class="left"><h4>${mode ? mode.name : s.modeId}</h4><span>${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div><div class="right">${formatTime(s.durationSeconds)}</div>`;
    list.appendChild(item);
  });
}

function renderPlans() {
  const container = document.getElementById("plans-list");
  container.innerHTML = "";
  document.getElementById("current-plan").innerHTML = `Current: <strong>${PLANS.find(p => p.id === state.plan)?.name || "Free"}</strong>`;
  PLANS.forEach(plan => {
    const isCurrent = state.plan === plan.id;
    const isGooner = plan.id === "gooner";
    const card = document.createElement("div");
    card.className = "plan-card" + (isGooner ? " featured" : "");
    let priceHtml = plan.price === 0 ? "Free" : plan.discountPrice ? `<span class="old-price">$${plan.price}</span><span class="new-price">$${plan.discountPrice}</span><span class="per-month">/mo</span><div class="discount-tag">−20%</div>` : `$${plan.price}<span class="per-month">/mo</span>`;
    card.innerHTML = `${plan.badge ? `<div class="badge">${plan.badge}</div>` : ""}<h3>${plan.name}</h3><div class="price">${priceHtml}</div><ul>${plan.features.map(f => `<li>${f}</li>`).join("")}</ul><button class="btn ${isCurrent ? "current" : "primary"}" data-plan="${plan.id}">${isCurrent ? "Current plan" : plan.price === 0 ? "Select" : isGooner ? "Get Gooner 👑" : "Upgrade"}</button>`;
    container.appendChild(card);
  });
  container.querySelectorAll("button[data-plan]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const planId = btn.dataset.plan;
      if (planId === state.plan) return;
      state.plan = planId;
      await saveProfile();
      renderPlans();
      renderModes();
    });
  });
}

// ==================== SESSION ====================
function startSession(modeId) {
  const mode = MODES.find(m => m.id === modeId);
  if (!mode || !canAccessMode(mode)) return;
  state.currentSession = { modeId, startedAt: Date.now(), tipsShown: 0 };
  state.elapsedSeconds = 0;
  state.paused = false;
  document.getElementById("session-mode-name").textContent = mode.name;
  document.getElementById("timer-display").textContent = "00:00:00";
  document.getElementById("stage-name").textContent = mode.stages[0].name;
  document.getElementById("stage-bar").style.width = "0%";
  document.getElementById("prompt-text").textContent = getRandomTip(modeId);
  document.getElementById("btn-pause").textContent = "Pause";
  showScreen("session");
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(tick, 1000);
}

function tick() {
  if (state.paused || !state.currentSession) return;
  state.elapsedSeconds++;
  document.getElementById("timer-display").textContent = formatTime(state.elapsedSeconds);
  const mode = MODES.find(m => m.id === state.currentSession.modeId);
  const stage = getCurrentStage(mode, state.elapsedSeconds);
  document.getElementById("stage-name").textContent = stage.name;
  document.getElementById("stage-bar").style.width = stage.progress + "%";
  if (state.elapsedSeconds > 0 && state.elapsedSeconds % 240 === 0) {
    document.getElementById("prompt-text").textContent = getRandomTip(mode.id);
  }
}

function pauseSession() {
  state.paused = !state.paused;
  document.getElementById("btn-pause").textContent = state.paused ? "Resume" : "Pause";
}

async function endSession(save = true) {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  if (save && state.currentSession && state.elapsedSeconds > 30) {
    const newSession = { modeId: state.currentSession.modeId, durationSeconds: state.elapsedSeconds, endedAt: Date.now() };
    state.sessions.push(newSession);
    await saveSession(newSession);
    renderStats();
    renderHistory();
  }
  state.currentSession = null;
  state.elapsedSeconds = 0;
  state.paused = false;
  showScreen("home");
}

// ==================== INIT ====================
function init() {
  document.getElementById("btn-auth-submit")?.addEventListener("click", handleAuth);
  document.getElementById("btn-auth-toggle")?.addEventListener("click", toggleAuthMode);
  document.getElementById("btn-profile")?.addEventListener("click", () => { if (confirm("Sign out?")) signOut(); });

  document.querySelectorAll(".pref-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const pref = btn.dataset.pref;
      if (state.prefs.includes(pref)) {
        state.prefs = state.prefs.filter(p => p !== pref);
        btn.classList.remove("selected");
      } else if (state.prefs.length < 3) {
        state.prefs.push(pref);
        btn.classList.add("selected");
      }
      document.getElementById("btn-start").disabled = state.prefs.length === 0;
    });
  });

  document.getElementById("btn-start")?.addEventListener("click", async () => {
    await saveProfile();
    showScreen("home");
    renderModes();
    renderStats();
  });

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const screen = btn.dataset.screen;
      if (screen === "history") renderHistory();
      if (screen === "subs") renderPlans();
      showScreen(screen);
    });
  });

  document.getElementById("btn-pause")?.addEventListener("click", pauseSession);
  document.getElementById("btn-finish")?.addEventListener("click", () => endSession(true));
  document.getElementById("btn-end-session")?.addEventListener("click", () => {
    if (confirm("End session without saving?")) endSession(false);
  });

  checkAuth();
}

init();
