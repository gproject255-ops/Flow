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

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "😌 Chill mode only",
      "Basic tips",
      "Local history"
    ]
  },
  {
    id: "novice",
    name: "Novice",
    price: 4.99,
    features: [
      "🔥 Focused mode unlocked",
      "More prompts & tips",
      "Streak tracking",
      "Session history"
    ]
  },
  {
    id: "advanced",
    name: "Advanced",
    price: 9.99,
    features: [
      "🧠 Deep Goon mode",
      "Advanced prompts",
      "Full history & stats",
      "Custom tip intensity"
    ]
  },
  {
    id: "gooner",
    name: "👑 Gooner",
    price: 14.99,
    discountPrice: 11.99,
    badge: "Best Value",
    features: [
      "💦 Empty Balls mode unlocked",
      "All modes fully available",
      "Maximum immersion tips",
      "Priority & intense prompts",
      "Gooner status badge",
      "Early access to new modes",
      "Full progress analytics",
      "Exclusive long-session guides"
    ]
  }
];

const TIPS = {
  general: [
    "Add more lube. Dry friction kills long sessions.",
    "Keep your eyes on the screen. Don't look away.",
    "Breathe slowly. Don't rush the strokes.",
    "If you feel close — stop completely for 20–30 seconds.",
    "Loosen your grip. Light touch lasts longer.",
    "Stay present. Don't start planning the rest of the day.",
    "Change position if your arm gets tired.",
    "Headphones help. Cut off the outside world."
  ],
  edge: [
    "You're getting close. Slow down right now.",
    "Stop stroking. Just hold and breathe.",
    "Look at the screen but don't move your hand.",
    "Count to 30 before you touch again.",
    "This is the edge. Stay here as long as you can."
  ],
  deep: [
    "Don't think. Just watch and feel.",
    "Time doesn't matter anymore. Keep going.",
    "Your only job is to stay in this state.",
    "More lube. Always more lube on long sessions.",
    "If your mind wanders — bring it back to the screen."
  ]
};

// ==================== STATE ====================

const state = {
  prefs: [],
  plan: "free", // free | novice | advanced | gooner
  sessions: [],
  currentSession: null,
  timerInterval: null,
  paused: false,
  elapsedSeconds: 0
};

// ==================== STORAGE ====================

function loadState() {
  try {
    const raw = localStorage.getItem("goonsession_v1");
    if (raw) {
      const data = JSON.parse(raw);
      state.prefs = data.prefs || [];
      state.plan = data.plan || "free";
      state.sessions = data.sessions || [];
    }
  } catch (e) {
    console.warn("Failed to load state", e);
  }
}

function saveState() {
  localStorage.setItem(
    "goonsession_v1",
    JSON.stringify({
      prefs: state.prefs,
      plan: state.plan,
      sessions: state.sessions
    })
  );
}

// ==================== HELPERS ====================

function planLevel(planId) {
  const order = ["free", "novice", "advanced", "gooner"];
  return order.indexOf(planId);
}

function canAccessMode(mode) {
  return planLevel(state.plan) >= planLevel(mode.minPlan);
}

function formatTime(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function formatDuration(minutes) {
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `~${h}h ${m}m` : `~${h}h`;
}

function getRandomTip(modeId) {
  let pool = [...TIPS.general];
  if (modeId === "focused" || modeId === "deep" || modeId === "empty") {
    pool = pool.concat(TIPS.edge);
  }
  if (modeId === "deep" || modeId === "empty") {
    pool = pool.concat(TIPS.deep);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function getCurrentStage(mode, elapsedSeconds) {
  let accumulated = 0;
  for (let i = 0; i < mode.stages.length; i++) {
    accumulated += mode.stages[i].minutes * 60;
    if (elapsedSeconds < accumulated) {
      const stageStart = accumulated - mode.stages[i].minutes * 60;
      const progress = ((elapsedSeconds - stageStart) / (mode.stages[i].minutes * 60)) * 100;
      return {
        index: i,
        name: mode.stages[i].name,
        progress: Math.min(100, progress)
      };
    }
  }
  // finished all stages
  return {
    index: mode.stages.length - 1,
    name: mode.stages[mode.stages.length - 1].name,
    progress: 100
  };
}

// ==================== UI RENDERING ====================

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const el = document.getElementById("screen-" + id);
  if (el) el.classList.add("active");

  // update nav active state
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.screen === id);
  });
}

function renderModes() {
  const container = document.getElementById("modes-list");
  container.innerHTML = "";

  MODES.forEach((mode) => {
    const hasAccess = canAccessMode(mode);
    const card = document.createElement("div");
    // Always look open — no locked visual state
    card.className = "mode-card";
    card.innerHTML = `
      <h3>${mode.name}</h3>
      <p>${mode.desc}</p>
      <div class="duration">${formatDuration(mode.durationMin)}</div>
    `;
    card.addEventListener("click", () => {
      if (!hasAccess) {
        // Redirect to plans and push Gooner
        showScreen("subs");
        renderPlans();
        // Small delay so the screen is visible, then scroll/highlight Gooner
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

  // simple streak (consecutive days with at least one session)
  let streak = 0;
  if (state.sessions.length > 0) {
    const days = new Set(
      state.sessions.map((s) => new Date(s.endedAt).toDateString())
    );
    const sortedDays = [...days].sort((a, b) => new Date(b) - new Date(a));
    const today = new Date().toDateString();
    let current = new Date();
    for (let i = 0; i < sortedDays.length; i++) {
      const check = current.toDateString();
      if (sortedDays.includes(check)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
  }

  document.getElementById("stat-sessions").textContent = totalSessions;
  document.getElementById("stat-hours").textContent = hours + "h";
  document.getElementById("stat-streak").textContent = streak;
}

function renderHistory() {
  const list = document.getElementById("history-list");
  const empty = document.getElementById("history-empty");

  if (state.sessions.length === 0) {
    list.innerHTML = "";
    empty.classList.remove("hidden");
    return;
  }

  empty.classList.add("hidden");
  list.innerHTML = "";

  const sorted = [...state.sessions].sort((a, b) => b.endedAt - a.endedAt);

  sorted.forEach((s) => {
    const mode = MODES.find((m) => m.id === s.modeId);
    const item = document.createElement("div");
    item.className = "history-item";
    const date = new Date(s.endedAt);
    item.innerHTML = `
      <div class="left">
        <h4>${mode ? mode.name : s.modeId}</h4>
        <span>${date.toLocaleDateString()} · ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div class="right">${formatTime(s.durationSeconds)}</div>
    `;
    list.appendChild(item);
  });
}

function renderPlans() {
  const container = document.getElementById("plans-list");
  container.innerHTML = "";

  document.getElementById("current-plan").innerHTML = `Current: <strong>${
    PLANS.find((p) => p.id === state.plan)?.name || "Free"
  }</strong>`;

  PLANS.forEach((plan) => {
    const isCurrent = state.plan === plan.id;
    const isGooner = plan.id === "gooner";
    const card = document.createElement("div");
    card.className = "plan-card" + (isGooner ? " featured" : "");

    let priceHtml = "";
    if (plan.price === 0) {
      priceHtml = `Free`;
    } else if (plan.discountPrice) {
      priceHtml = `
        <span class="old-price">$${plan.price}</span>
        <span class="new-price">$${plan.discountPrice}</span>
        <span class="per-month">/mo</span>
        <div class="discount-tag">−20%</div>
      `;
    } else {
      priceHtml = `$${plan.price}<span class="per-month">/mo</span>`;
    }

    card.innerHTML = `
      ${plan.badge ? `<div class="badge">${plan.badge}</div>` : ""}
      <h3>${plan.name}</h3>
      <div class="price">${priceHtml}</div>
      <ul>
        ${plan.features.map((f) => `<li>${f}</li>`).join("")}
      </ul>
      <button class="btn ${isCurrent ? "current" : "primary"}" data-plan="${plan.id}">
        ${isCurrent ? "Current plan" : plan.price === 0 ? "Select" : isGooner ? "Get Gooner 👑" : "Upgrade"}
      </button>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("button[data-plan]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const planId = btn.dataset.plan;
      if (planId === state.plan) return;
      // In real app this would open payment. For now we just switch.
      state.plan = planId;
      saveState();
      renderPlans();
      renderModes();
    });
  });
}

// ==================== SESSION LOGIC ====================

function startSession(modeId) {
  const mode = MODES.find((m) => m.id === modeId);
  if (!mode || !canAccessMode(mode)) return;

  state.currentSession = {
    modeId,
    startedAt: Date.now(),
    tipsShown: 0
  };
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

  const mode = MODES.find((m) => m.id === state.currentSession.modeId);
  const stage = getCurrentStage(mode, state.elapsedSeconds);

  document.getElementById("stage-name").textContent = stage.name;
  document.getElementById("stage-bar").style.width = stage.progress + "%";

  // Change tip every ~4 minutes
  if (state.elapsedSeconds > 0 && state.elapsedSeconds % 240 === 0) {
    document.getElementById("prompt-text").textContent = getRandomTip(mode.id);
  }
}

function pauseSession() {
  state.paused = !state.paused;
  document.getElementById("btn-pause").textContent = state.paused ? "Resume" : "Pause";
}

function endSession(save = true) {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  if (save && state.currentSession && state.elapsedSeconds > 30) {
    state.sessions.push({
      modeId: state.currentSession.modeId,
      durationSeconds: state.elapsedSeconds,
      endedAt: Date.now()
    });
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

  // Onboarding
  const prefBtns = document.querySelectorAll(".pref-btn");
  const btnStart = document.getElementById("btn-start");

  prefBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const pref = btn.dataset.pref;
      if (state.prefs.includes(pref)) {
        state.prefs = state.prefs.filter((p) => p !== pref);
        btn.classList.remove("selected");
      } else {
        if (state.prefs.length >= 3) return; // max 3
        state.prefs.push(pref);
        btn.classList.add("selected");
      }
      btnStart.disabled = state.prefs.length === 0;
    });
  });

  btnStart.addEventListener("click", () => {
    saveState();
    showScreen("home");
    renderModes();
    renderStats();
  });

  // Navigation
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const screen = btn.dataset.screen;
      if (screen === "history") renderHistory();
      if (screen === "subs") renderPlans();
      showScreen(screen);
    });
  });

  // Session controls
  document.getElementById("btn-pause").addEventListener("click", pauseSession);
  document.getElementById("btn-finish").addEventListener("click", () => endSession(true));
  document.getElementById("btn-end-session").addEventListener("click", () => {
    if (confirm("End session without saving?")) {
      endSession(false);
    }
  });

  // Decide initial screen
  if (state.prefs.length > 0) {
    showScreen("home");
    renderModes();
    renderStats();
    renderHistory();
  } else {
    showScreen("onboarding");
  }
}

init();
