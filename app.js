// ==================== DATA ====================
const MODES = [
  { id: "chill", name: "😌 Chill", desc: "Easy warm-up. Just relax and get into the mood.", durationMin: 45, stages: [{ name: "Warm-up", minutes: 15 }, { name: "Steady stroke", minutes: 20 }, { name: "Slow down", minutes: 10 }], minPlan: "free" },
  { id: "focused", name: "🔥 Focused", desc: "Stay edged. Build pressure without finishing.", durationMin: 150, stages: [{ name: "Build-up", minutes: 30 }, { name: "Edge zone", minutes: 70 }, { name: "Hold & deny", minutes: 50 }], minPlan: "novice" },
  { id: "deep", name: "🧠 Deep Goon", desc: "Long session. Lose track of time. Brain goes quiet.", durationMin: 300, stages: [{ name: "Entry", minutes: 40 }, { name: "Deep focus", minutes: 140 }, { name: "Trance", minutes: 90 }, { name: "Cool down", minutes: 30 }], minPlan: "advanced" },
  { id: "empty", name: "💦 Empty Balls", desc: "Full commitment. 6–8+ hours. Drain everything.", durationMin: 420, stages: [{ name: "Preparation", minutes: 30 }, { name: "Long edge", minutes: 180 }, { name: "Heavy goon", minutes: 150 }, { name: "Final stretch", minutes: 60 }], minPlan: "gooner" }
];

const PLANS = [
  { id: "free", name: "Free", price: 0, features: ["😌 Chill mode only", "Basic tips", "Local history", "Occasional mentor messages"] },
  { id: "novice", name: "Novice", price: 4.99, features: ["🔥 Focused mode unlocked", "More prompts & tips", "Streak tracking", "More frequent mentor messages"] },
  { id: "advanced", name: "Advanced", price: 9.99, features: ["🧠 Deep Goon mode", "Advanced prompts", "Full history & stats", "Frequent mentor messages"] },
  { id: "gooner", name: "👑 Gooner", price: 14.99, discountPrice: 11.99, badge: "Best Value", features: ["💦 Empty Balls mode unlocked", "All modes", "Maximum immersion", "Constant mentor messages", "Priority support"] }
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
  hetero: {
    "Supportive Girl": ["You're doing amazing baby 💕 Keep going for me.", "I love watching you focus like this.", "Good boy, stay in the zone.", "You're making me so proud right now."],
    "Your GF": ["Mmm keep stroking just like that.", "I wish I was there watching you.", "Don't stop, you're so sexy when you focus.", "Come on baby, you can go longer."],
    "Hot Friend": ["Damn, look at you gooning so hard 🔥", "Bet you can't last another 10 minutes.", "Keep those eyes on the screen loser... I mean, stud.", "You're doing great, don't ruin it."]
  },
  bbc: {
    "Bully": ["Look at this little white boy gooning to BBC 😂", "Your tiny dick can't handle this, can it?", "Keep stroking that little thing while you watch real men.", "Pathetic. But keep going, it's funny.", "You love being inferior, don't you?"],
    "Mommy": ["Good boy, keep watching those big black cocks for mommy.", "Mommy is so proud of how dedicated you are.", "Don't stop until you can't anymore, baby.", "Such a good little gooner for mommy."],
    "Your White GF": ["Wow, you're really into this BBC stuff huh?", "Keep going, I guess it's hot watching you struggle.", "Don't you wish that was you? Keep stroking.", "I'm almost impressed... almost."]
  },
  femdom: {
    "Mommy": ["Give all that cum to mommy, you little loser 👑", "Keep stroking until your balls are empty for me.", "Mommy owns that cock now. Don't stop.", "Good boy, drain yourself completely.", "You're nothing without my permission."],
    "Mistress": ["Pathetic little gooner. Keep stroking until I say stop.", "Your only purpose is to edge for me right now.", "Don't you dare cum without permission, slave.", "Look at you, so desperate. I love it.", "More. Faster. Don't think, just obey."],
    "Wife": ["You're such a good little husband, gooning for me.", "Keep going until you're completely drained, baby.", "I own every drop. Don't waste it.", "Mmm, watching you lose control is so hot.", "Don't stop until I tell you."]
  },
  gay: {
    "Dominant Top": ["Keep stroking that cock for me, boy.", "Eyes on the screen. Don't look away.", "You're doing exactly what I want.", "Good boy, stay edged."],
    "Your Boy": ["Damn you're really into this.", "Keep going, it's hot.", "Don't stop now.", "Focus."],
    "Muscle Guy": ["Look at you gooning so hard.", "Keep that hand moving.", "Don't quit.", "Stay in it."]
  },
  lesbian: {
    "Dominant Girl": ["Keep going for me, baby.", "Don't stop until I say.", "Good girl energy, but you're still stroking.", "Focus on the screen."],
    "Your GF": ["Mmm keep stroking.", "I love watching you like this.", "Don't cum yet.", "Stay in the zone."],
    "Tease": ["Bet you can't last much longer 😏", "Keep going, loser.", "Eyes on the girls.", "Don't stop."]
  },
  hentai: {
    "Anime Girl": ["Kyaa~ keep stroking senpai! 💕", "Don't look away from the screen!", "You're doing so good~", "More more more!"],
    "Senpai": ["Focus on the hentai, boy.", "Keep that hand moving.", "Don't stop now.", "Good."],
    "Waifu": ["Keep gooning for your waifu.", "Don't cum yet.", "Eyes on me... I mean the screen.", "Stay dedicated."]
  },
  mixed: {
    "Tease": ["Look at you gooning to everything 😂", "Can't decide what you like, huh?", "Keep stroking anyway.", "Don't stop."],
    "Dominant": ["Keep going. Don't think.", "Focus.", "More.", "Don't quit."],
    "Supportive": ["You're doing great.", "Keep the focus.", "Stay in the zone.", "Proud of you."]
  }
};

const PORN_LINKS = {
  hetero: [
    { name: "r/GOONED", url: "https://www.reddit.com/r/GOONED/", desc: "The main gooning hub — everything" },
    { name: "r/PornIsCheating", url: "https://www.reddit.com/r/PornIsCheating/", desc: "Porn worship" },
    { name: "r/PORNism", url: "https://www.reddit.com/r/PORNism/", desc: "Heavy goon content" },
    { name: "r/gooningaddicts", url: "https://www.reddit.com/r/gooningaddicts/", desc: "Gooning addiction talk" },
    { name: "r/EdgingTalk", url: "https://www.reddit.com/r/EdgingTalk/", desc: "Edging discussions" },
    { name: "r/GooningGalore", url: "https://www.reddit.com/r/GooningGalore/", desc: "Overstimulation & gooning" }
  ],
  bbc: [
    { name: "r/TheBlackedDominion", url: "https://www.reddit.com/r/TheBlackedDominion/", desc: "BBC superiority & BNWO" },
    { name: "r/BBClust", url: "https://www.reddit.com/r/BBClust/", desc: "Girls lusting for BBC" },
    { name: "r/BackshotsFromBBC", url: "https://www.reddit.com/r/BackshotsFromBBC/", desc: "BBC backshots" },
    { name: "r/BBCaddicts", url: "https://www.reddit.com/r/BBCaddicts/", desc: "BBC addiction" },
    { name: "r/blacked", url: "https://www.reddit.com/r/blacked/", desc: "Classic BBC content" },
    { name: "r/GOONED", url: "https://www.reddit.com/r/GOONED/", desc: "Lots of BBC goon posts" }
  ],
  femdom: [
    { name: "r/femdom", url: "https://www.reddit.com/r/femdom/", desc: "Main femdom community" },
    { name: "r/femdomgonewild", url: "https://www.reddit.com/r/femdomgonewild/", desc: "Femdom OC" },
    { name: "r/gentlefemdom", url: "https://www.reddit.com/r/gentlefemdom/", desc: "Softer femdom" },
    { name: "r/FemdomHumiliation", url: "https://www.reddit.com/r/FemdomHumiliation/", desc: "Humiliation focus" },
    { name: "r/PeggingAndFemdom", url: "https://www.reddit.com/r/PeggingAndFemdom/", desc: "Pegging + femdom" },
    { name: "r/GOONED", url: "https://www.reddit.com/r/GOONED/", desc: "Femdom goon posts" }
  ],
  hentai: [
    { name: "r/GooningHentai", url: "https://www.reddit.com/r/GooningHentai/", desc: "Captioned hentai for gooning" },
    { name: "r/HentaiiGooning", url: "https://www.reddit.com/r/HentaiiGooning/", desc: "Hentai + goon" },
    { name: "r/toongooning_revived", url: "https://www.reddit.com/r/toongooning_revived/", desc: "2D/3D hentai gooning" },
    { name: "r/hentai", url: "https://www.reddit.com/r/hentai/", desc: "Main hentai sub" },
    { name: "r/HENTAI_GIF", url: "https://www.reddit.com/r/HENTAI_GIF/", desc: "Animated hentai" },
    { name: "r/GOONED", url: "https://www.reddit.com/r/GOONED/", desc: "Hentai goon posts" }
  ],
  gay: [
    { name: "r/GOONED", url: "https://www.reddit.com/r/GOONED/", desc: "Lots of gay goon content" },
    { name: "r/gayporn", url: "https://www.reddit.com/r/gayporn/", desc: "Gay porn" },
    { name: "r/MassiveCock", url: "https://www.reddit.com/r/MassiveCock/", desc: "Big cocks" },
    { name: "r/GoonBudsNSFW", url: "https://www.reddit.com/r/GoonBudsNSFW/", desc: "Gooning with buddies" },
    { name: "r/EdgingTalk", url: "https://www.reddit.com/r/EdgingTalk/", desc: "Edging discussions" }
  ],
  lesbian: [
    { name: "r/lesbians", url: "https://www.reddit.com/r/lesbians/", desc: "Lesbian content" },
    { name: "r/GOONED", url: "https://www.reddit.com/r/GOONED/", desc: "Lesbian goon posts" },
    { name: "r/girlsmasturbating", url: "https://www.reddit.com/r/girlsmasturbating/", desc: "Girls masturbating" },
    { name: "r/orgasms", url: "https://www.reddit.com/r/orgasms/", desc: "Orgasm focus" },
    { name: "r/Goonettehub", url: "https://www.reddit.com/r/Goonettehub/", desc: "Goonettes community" }
  ],
  mixed: [
    { name: "r/GOONED", url: "https://www.reddit.com/r/GOONED/", desc: "Everything mixed" },
    { name: "r/PORNism", url: "https://www.reddit.com/r/PORNism/", desc: "Heavy variety" },
    { name: "r/GooningGalore", url: "https://www.reddit.com/r/GooningGalore/", desc: "Overstimulation" },
    { name: "r/PornIsCheating", url: "https://www.reddit.com/r/PornIsCheating/", desc: "Porn worship" },
    { name: "r/gooningaddicts", url: "https://www.reddit.com/r/gooningaddicts/", desc: "Addiction talk" }
  ]
};

const TIMER_LABELS = [
  "Time to goon!",
  "Full focus on porn now",
  "Don't look away",
  "Stay in the zone",
  "Keep stroking",
  "Eyes on the screen",
  "No thinking, just goon",
  "Drain those balls"
];

const SUB_REMINDERS = [
  "Want more messages from me? Get a subscription 😏",
  "Subscribe and I'll message you way more often.",
  "Free users only get occasional messages... upgrade for more.",
  "Want me to keep talking? Take the plan."
];

// ==================== STATE ====================
const state = {
  prefs: [],
  mentor: null,
  plan: "free",
  sessions: [],
  currentSession: null,
  timerInterval: null,
  messageInterval: null,
  paused: false,
  elapsedSeconds: 0,
  totalSeconds: 0,
  messagesEnabled: true
};

// ==================== STORAGE ====================
function loadState() {
  try {
    const raw = localStorage.getItem("goonsession_v2");
    if (raw) {
      const data = JSON.parse(raw);
      state.prefs = data.prefs || [];
      state.mentor = data.mentor || null;
      state.plan = data.plan || "free";
      state.sessions = data.sessions || [];
      state.messagesEnabled = data.messagesEnabled !== false;
    }
  } catch (e) { console.warn(e); }
}

function saveState() {
  localStorage.setItem("goonsession_v2", JSON.stringify({
    prefs: state.prefs,
    mentor: state.mentor,
    plan: state.plan,
    sessions: state.sessions,
    messagesEnabled: state.messagesEnabled
  }));
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
function getRandomTip() { return TIMER_LABELS[Math.floor(Math.random() * TIMER_LABELS.length)]; }

function getMessageInterval() {
  const base = state.plan === "free" ? 180 : state.plan === "novice" ? 120 : state.plan === "advanced" ? 90 : 60;
  return base * 1000;
}

function showMessage(text) {
  if (!state.messagesEnabled) return;
  const toast = document.getElementById("message-toast");
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 4500);
}

function getRandomMessage() {
  if (!state.mentor || !state.prefs.length) return null;
  const cat = state.prefs[0];
  const pool = MESSAGES[cat]?.[state.mentor] || MESSAGES.hetero["Supportive Girl"];
  if (Math.random() < 0.25 && state.plan === "free") {
    return SUB_REMINDERS[Math.floor(Math.random() * SUB_REMINDERS.length)];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function startMessageLoop() {
  if (state.messageInterval) clearInterval(state.messageInterval);
  if (!state.messagesEnabled) return;
  state.messageInterval = setInterval(() => {
    const msg = getRandomMessage();
    if (msg) showMessage(msg);
  }, getMessageInterval());
}

function stopMessageLoop() {
  if (state.messageInterval) clearInterval(state.messageInterval);
}

// ==================== UI ====================
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById("screen-" + id);
  if (el) el.classList.add("active");
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.screen === id));
}

function renderMentors() {
  const grid = document.getElementById("mentor-grid");
  grid.innerHTML = "";
  const cat = state.prefs[0] || "hetero";
  const list = MENTORS[cat] || MENTORS.hetero;
  list.forEach(m => {
    const btn = document.createElement("button");
    btn.className = "pref-btn";
    btn.textContent = m;
    btn.addEventListener("click", () => {
      document.querySelectorAll("#mentor-grid .pref-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.mentor = m;
      document.getElementById("btn-mentor-continue").disabled = false;
    });
    grid.appendChild(btn);
  });
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

function renderPorn() {
  const list = document.getElementById("porn-list");
  list.innerHTML = "";
  const cat = state.prefs[0] || "hetero";
  const links = PORN_LINKS[cat] || PORN_LINKS.hetero;
  links.forEach(item => {
    const a = document.createElement("a");
    a.href = item.url;
    a.target = "_blank";
    a.className = "porn-item";
    a.innerHTML = `<h4>${item.name}</h4><p>${item.desc}</p>`;
    list.appendChild(a);
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
    btn.addEventListener("click", () => {
      const planId = btn.dataset.plan;
      if (planId === state.plan) return;
      state.plan = planId;
      saveState();
      renderPlans();
      renderModes();
    });
  });
}

// ==================== TIMER ====================
function updateCircularTimer() {
  const progress = document.getElementById("timer-progress");
  const circumference = 2 * Math.PI * 90;
  const remaining = Math.max(0, state.totalSeconds - state.elapsedSeconds);
  const percent = remaining / state.totalSeconds;
  progress.style.strokeDashoffset = circumference * (1 - percent);
  document.getElementById("timer-display").textContent = formatTime(remaining);
  if (state.elapsedSeconds % 30 === 0) {
    document.getElementById("timer-label").textContent = getRandomTip();
  }
}

function startSession(modeId) {
  const mode = MODES.find(m => m.id === modeId);
  if (!mode || !canAccessMode(mode)) return;
  state.currentSession = { modeId, startedAt: Date.now() };
  state.elapsedSeconds = 0;
  state.totalSeconds = mode.durationMin * 60;
  state.paused = false;
  document.getElementById("session-mode-name").textContent = mode.name;
  document.getElementById("timer-label").textContent = "Time to goon!";
  document.getElementById("prompt-text").textContent = "Full focus on porn now.";
  document.getElementById("btn-pause").textContent = "Pause";
  updateCircularTimer();
  showScreen("session");
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(tick, 1000);
  startMessageLoop();
  showMessage(getRandomMessage() || "Time to goon!");
}

function tick() {
  if (state.paused || !state.currentSession) return;
  state.elapsedSeconds++;
  updateCircularTimer();
  if (state.elapsedSeconds >= state.totalSeconds) {
    endSession(true);
  }
}

function pauseSession() {
  state.paused = !state.paused;
  document.getElementById("btn-pause").textContent = state.paused ? "Resume" : "Pause";
}

function endSession(save = true) {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  stopMessageLoop();
  if (save && state.currentSession && state.elapsedSeconds > 30) {
    state.sessions.push({ modeId: state.currentSession.modeId, durationSeconds: state.elapsedSeconds, endedAt: Date.now() });
    saveState();
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
  loadState();

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

  document.getElementById("btn-start").addEventListener("click", () => {
    showScreen("mentor");
    renderMentors();
  });

  document.getElementById("btn-mentor-continue").addEventListener("click", () => {
    saveState();
    showScreen("home");
    renderModes();
    renderStats();
  });

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const screen = btn.dataset.screen;
      if (screen === "history") renderHistory();
      if (screen === "subs") renderPlans();
      if (screen === "porn") renderPorn();
      showScreen(screen);
    });
  });

  document.getElementById("btn-settings").addEventListener("click", () => showScreen("settings"));
  document.getElementById("btn-settings-back").addEventListener("click", () => showScreen("home"));
  document.getElementById("toggle-messages").checked = state.messagesEnabled;
  document.getElementById("toggle-messages").addEventListener("change", (e) => {
    state.messagesEnabled = e.target.checked;
    saveState();
    if (!state.messagesEnabled) stopMessageLoop();
  });
  document.getElementById("btn-change-mentor").addEventListener("click", () => {
    showScreen("onboarding");
  });

  document.getElementById("btn-pause").addEventListener("click", pauseSession);
  document.getElementById("btn-finish").addEventListener("click", () => endSession(true));
  document.getElementById("btn-end-session").addEventListener("click", () => {
    if (confirm("End session without saving?")) endSession(false);
  });

  if (state.prefs.length > 0 && state.mentor) {
    showScreen("home");
    renderModes();
    renderStats();
    renderHistory();
  } else if (state.prefs.length > 0) {
    showScreen("mentor");
    renderMentors();
  } else {
    showScreen("onboarding");
  }
}

init();
