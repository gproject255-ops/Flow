// ==================== DATA ====================
const MODES = [
  { id: "chill", name: "😌 Chill", desc: "Easy warm-up.", durationMin: 45, minPlan: "free" },
  { id: "focused", name: "🔥 Focused", desc: "Stay edged.", durationMin: 150, minPlan: "novice" },
  { id: "deep", name: "🧠 Deep Goon", desc: "Long session.", durationMin: 300, minPlan: "advanced" },
  { id: "empty", name: "💦 Empty Balls", desc: "Full commitment.", durationMin: 420, minPlan: "gooner" }
];

const PLANS = [
  { id: "free", name: "Free", price: 0, features: ["Chill mode only", "Basic tips"] },
  { id: "novice", name: "Novice", price: 4.99, features: ["Focused mode", "More tips"] },
  { id: "advanced", name: "Advanced", price: 9.99, features: ["Deep Goon", "Full stats"] },
  { id: "gooner", name: "👑 Gooner", price: 14.99, discountPrice: 11.99, badge: "Best Value", features: ["All modes", "Maximum immersion"] }
];

const MENTORS = {
  hetero: ["Supportive Girl", "Your GF", "Hot Friend"],
  gay: ["Dominant Top", "Your Boy", "Muscle Guy"],
  lesbian: ["Dominant Girl", "Your GF", "Tease"],
  bbc: ["Bully", "Mommy", "Your White GF"],
  hentai: ["Anime Girl", "Senpai", "Waifu"],
  mixed: ["Tease", "Dominant", "Supportive"],
  femdom: ["Mommy", "Mistress", "Wife"]
};

const MESSAGES = {
  hetero: { "Supportive Girl": ["You're doing amazing baby 💕", "Keep going for me."], "Your GF": ["Mmm keep stroking.", "Don't stop."], "Hot Friend": ["Damn, look at you gooning 🔥", "Keep going."] },
  bbc: { "Bully": ["Look at this little white boy gooning to BBC 😂", "Pathetic. Keep going."], "Mommy": ["Good boy, keep watching those big black cocks.", "Mommy is proud."], "Your White GF": ["Wow, you're really into this BBC stuff.", "Keep stroking."] },
  femdom: { "Mommy": ["Give all that cum to mommy, you little loser 👑", "Keep stroking until empty."], "Mistress": ["Pathetic little gooner. Keep stroking.", "Don't cum without permission."], "Wife": ["You're such a good little husband.", "Keep going until drained."] }
};

const PORN_LINKS = {
  hetero: [{ name: "r/GOONED", url: "https://www.reddit.com/r/GOONED/", desc: "Main gooning hub" }, { name: "r/PornIsCheating", url: "https://www.reddit.com/r/PornIsCheating/", desc: "Porn worship" }],
  bbc: [{ name: "r/TheBlackedDominion", url: "https://www.reddit.com/r/TheBlackedDominion/", desc: "BBC superiority" }, { name: "r/BBClust", url: "https://www.reddit.com/r/BBClust/", desc: "Girls lusting for BBC" }],
  femdom: [{ name: "r/femdom", url: "https://www.reddit.com/r/femdom/", desc: "Main femdom" }, { name: "r/femdomgonewild", url: "https://www.reddit.com/r/femdomgonewild/", desc: "Femdom OC" }]
};

const TIMER_LABELS = ["Time to goon!", "Full focus on porn now", "Don't look away", "Stay in the zone"];

// ==================== STATE ====================
const state = { prefs: [], mentor: null, plan: "free", sessions: [], currentSession: null, timerInterval: null, paused: false, elapsedSeconds: 0, totalSeconds: 0, messagesEnabled: true };

function loadState() {
  try {
    const raw = localStorage.getItem("goonsession_v2");
    if (raw) Object.assign(state, JSON.parse(raw));
  } catch(e) {}
}
function saveState() {
  try { localStorage.setItem("goonsession_v2", JSON.stringify(state)); } catch(e) {}
}

// ==================== GLOBAL FUNCTIONS (for inline onclick) ====================
window.togglePref = function(btn) {
  const pref = btn.dataset.pref;
  if (state.prefs.includes(pref)) {
    state.prefs = state.prefs.filter(p => p !== pref);
    btn.classList.remove("selected");
  } else if (state.prefs.length < 3) {
    state.prefs.push(pref);
    btn.classList.add("selected");
  }
  document.getElementById("btn-start").disabled = state.prefs.length === 0;
};

window.goToMentor = function() {
  showScreen("mentor");
  renderMentors();
};

window.finishOnboarding = function() {
  saveState();
  showScreen("home");
  renderModes();
  renderStats();
};

window.showScreen = function(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById("screen-" + id);
  if (el) el.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.screen === id);
  });
};

window.pauseSession = function() {
  state.paused = !state.paused;
  const btn = document.getElementById("btn-pause");
  if (btn) btn.textContent = state.paused ? "Resume" : "Pause";
};

window.endSession = function(save) {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  if (save && state.currentSession && state.elapsedSeconds > 30) {
    state.sessions.push({ modeId: state.currentSession.modeId, durationSeconds: state.elapsedSeconds, endedAt: Date.now() });
    saveState();
  }
  state.currentSession = null;
  state.elapsedSeconds = 0;
  state.paused = false;
  showScreen("home");
  renderStats();
};

window.toggleMessages = function(enabled) {
  state.messagesEnabled = enabled;
  saveState();
};

window.handleSignup = function() { showScreen("home"); };
window.handleSignin = function() { showScreen("home"); };

// ==================== RENDER ====================
function renderMentors() {
  const grid = document.getElementById("mentor-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const cat = state.prefs[0] || "hetero";
  (MENTORS[cat] || MENTORS.hetero).forEach(m => {
    const btn = document.createElement("button");
    btn.className = "pref-btn";
    btn.textContent = m;
    btn.onclick = () => {
      document.querySelectorAll("#mentor-grid .pref-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.mentor = m;
      document.getElementById("btn-mentor-continue").disabled = false;
    };
    grid.appendChild(btn);
  });
}

function renderModes() {
  const container = document.getElementById("modes-list");
  if (!container) return;
  container.innerHTML = "";
  MODES.forEach(mode => {
    const hasAccess = ["free","novice","advanced","gooner"].indexOf(state.plan) >= ["free","novice","advanced","gooner"].indexOf(mode.minPlan);
    const card = document.createElement("div");
    card.className = "mode-card";
    card.innerHTML = `<h3>${mode.name}</h3><p>${mode.desc}</p>`;
    card.onclick = () => {
      if (!hasAccess) { showScreen("subs"); renderPlans(); return; }
      startSession(mode.id);
    };
    container.appendChild(card);
  });
}

function renderStats() {
  const total = state.sessions.length;
  const mins = state.sessions.reduce((s, x) => s + (x.durationSeconds||0)/60, 0);
  const ss = document.getElementById("stat-sessions");
  const sh = document.getElementById("stat-hours");
  const st = document.getElementById("stat-streak");
  if (ss) ss.textContent = total;
  if (sh) sh.textContent = (mins/60).toFixed(1) + "h";
  if (st) st.textContent = total > 0 ? 1 : 0;
}

function renderHistory() {
  const list = document.getElementById("history-list");
  const empty = document.getElementById("history-empty");
  if (!list) return;
  if (!state.sessions.length) { list.innerHTML = ""; if (empty) empty.classList.remove("hidden"); return; }
  if (empty) empty.classList.add("hidden");
  list.innerHTML = "";
  [...state.sessions].reverse().forEach(s => {
    const mode = MODES.find(m => m.id === s.modeId);
    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `<div class="left"><h4>${mode?mode.name:s.modeId}</h4></div><div class="right">${Math.floor(s.durationSeconds/60)}m</div>`;
    list.appendChild(item);
  });
}

function renderPorn() {
  const list = document.getElementById("porn-list");
  if (!list) return;
  list.innerHTML = "";
  const cat = state.prefs[0] || "hetero";
  (PORN_LINKS[cat] || PORN_LINKS.hetero).forEach(item => {
    const a = document.createElement("a");
    a.href = item.url; a.target = "_blank"; a.className = "porn-item";
    a.innerHTML = `<h4>${item.name}</h4><p>${item.desc}</p>`;
    list.appendChild(a);
  });
}

function renderPlans() {
  const container = document.getElementById("plans-list");
  if (!container) return;
  container.innerHTML = "";
  const cp = document.getElementById("current-plan");
  if (cp) cp.innerHTML = `Current: <strong>${PLANS.find(p=>p.id===state.plan)?.name||"Free"}</strong>`;
  PLANS.forEach(plan => {
    const isCurrent = state.plan === plan.id;
    const card = document.createElement("div");
    card.className = "plan-card" + (plan.id==="gooner" ? " featured" : "");
    const price = plan.price === 0 ? "Free" : `$${plan.discountPrice||plan.price}/mo`;
    card.innerHTML = `${plan.badge?`<div class="badge">${plan.badge}</div>`:""}<h3>${plan.name}</h3><div class="price">${price}</div><ul>${plan.features.map(f=>`<li>${f}</li>`).join("")}</ul>
      <button class="btn ${isCurrent?"current":"primary"}" onclick="selectPlan('${plan.id}')">${isCurrent?"Current":"Select"}</button>`;
    container.appendChild(card);
  });
}

window.selectPlan = function(id) {
  if (id === state.plan) return;
  state.plan = id;
  saveState();
  renderPlans();
  renderModes();
};

// ==================== TIMER ====================
function startSession(modeId) {
  const mode = MODES.find(m => m.id === modeId);
  if (!mode) return;
  state.currentSession = { modeId, startedAt: Date.now() };
  state.elapsedSeconds = 0;
  state.totalSeconds = mode.durationMin * 60;
  state.paused = false;
  document.getElementById("session-mode-name").textContent = mode.name;
  document.getElementById("timer-label").textContent = "Time to goon!";
  showScreen("session");
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    if (state.paused) return;
    state.elapsedSeconds++;
    const remaining = Math.max(0, state.totalSeconds - state.elapsedSeconds);
    document.getElementById("timer-display").textContent = formatTime(remaining);
    if (state.elapsedSeconds % 30 === 0) {
      document.getElementById("timer-label").textContent = TIMER_LABELS[Math.floor(Math.random()*TIMER_LABELS.length)];
    }
    if (remaining <= 0) endSession(true);
  }, 1000);
}

function formatTime(sec) {
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
  return [h,m,s].map(v=>String(v).padStart(2,"0")).join(":");
}

// ==================== INIT ====================
loadState();
if (state.prefs.length && state.mentor) {
  showScreen("home");
  renderModes();
  renderStats();
} else if (state.prefs.length) {
  showScreen("mentor");
  renderMentors();
} else {
  showScreen("onboarding");
}
