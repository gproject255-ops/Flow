/*
 * Email/password authentication adapter, v3.
 * Add <script src="auth.js?v=3"></script> AFTER the existing inline app script.
 * This file implements authentication only, not subscriptions or cloud history.
 * Checkout is deliberately blocked while the original payment flow is incomplete.
 * Account deletion is not implemented and is never reported as completed.
 * A public browser key is used here. Never add a secret/service_role key.
 * Server-side authorization and database RLS are still required for protected data.
 */
(() => {
  "use strict";
  if (window.__accountAuthInstalled) return;
  window.__accountAuthInstalled = true;

  const PROJECT_URL = "https://atdweqzyuvhttrtuewwf.supabase.co";
  const PUBLIC_KEY = "sb_publishable_kgQyAkt4D6R3ivAal3k0VA_ND70tRWl";
  const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0";
  const $ = (id) => document.getElementById(id);
  const EMAIL_PENDING_KEY = "flow_email_confirmation_pending_v3";
  function pendingConfirmation() {
    try { return localStorage.getItem(EMAIL_PENDING_KEY) || ""; } catch (_) { return ""; }
  }
  function storePendingConfirmation(email) {
    try { localStorage.setItem(EMAIL_PENDING_KEY, email); } catch (_) {}
  }
  function clearPendingConfirmation() {
    try { localStorage.removeItem(EMAIL_PENDING_KEY); } catch (_) {}
  }
  function recoveryNotice() {
    return "Your confirmation link may open an unavailable localhost page. The email may still have been verified. Return to Flow (this page), enter your email and password, then press Sign in. Do not create another account.";
  }
  let client = null;
  let currentUser = null;
  let working = false;
  let startupError = null;

  // Keep each signed-in user\u0027s browser-only data separate from guest data.
  const GUEST_STORE = "goonsession_v2";
  const ACCOUNT_STORE_PREFIX = "flow_account_local_v2_";
  const originalSaveState = window.saveState;
  let activeUid = null;
  function privateSnapshot(s) {
    return {
      prefs: Array.isArray(s.prefs) ? s.prefs : [],
      mentor: typeof s.mentor === "string" ? s.mentor : null,
      sessions: Array.isArray(s.sessions) ? s.sessions : [],
      messagesEnabled: s.messagesEnabled !== false
    };
  }
  function saveForCurrentIdentity() {
    const s = appState();
    if (!s) return;
    try {
      if (activeUid) {
        localStorage.setItem(ACCOUNT_STORE_PREFIX + activeUid, JSON.stringify(privateSnapshot(s)));
      } else if (typeof originalSaveState === "function") {
        originalSaveState();
      } else {
        localStorage.setItem(GUEST_STORE, JSON.stringify(privateSnapshot(s)));
      }
    } catch (_error) { /* Local storage is optional. */ }
  }
  window.saveState = saveForCurrentIdentity;
  function switchLocalIdentity(nextUid) {
    if (nextUid === activeUid) return;
    saveForCurrentIdentity();
    stopLocalActivity();
    activeUid = nextUid;
    const key = nextUid ? ACCOUNT_STORE_PREFIX + nextUid : GUEST_STORE;
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch (_error) {}
    const s = appState();
    if (!s) return;
    s.prefs = Array.isArray(saved.prefs) ? saved.prefs : [];
    s.mentor = typeof saved.mentor === "string" ? saved.mentor : null;
    s.sessions = Array.isArray(saved.sessions) ? saved.sessions : [];
    s.messagesEnabled = saved.messagesEnabled !== false;
    s.currentSession = null;
    s.timerInterval = null;
    s.paused = false;
    s.elapsedSeconds = 0;
    s.totalSeconds = 0;
    s.plan = "free";
    s.pendingPlan = null;
  }

  function appState() {
    return typeof state === "object" && state !== null ? state : null;
  }
  function persistApp() {
    if (typeof window.saveState === "function") window.saveState();
  }
  function message(text) {
    const box = $("auth-error");
    if (box) {
      box.textContent = text;
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");
    }
  }
  function setBusy(value) {
    working = value;
    ["btn-signup", "btn-signin"].forEach((id) => {
      const button = $(id);
      if (button) button.disabled = value;
    });
  }
  function openAuth(text = "") {
    if (typeof window.showScreen === "function") window.showScreen("auth");
    message(text);
    $("auth-email")?.focus();
  }
  function returnToApp() {
    const s = appState();
    if (!s || typeof window.showScreen !== "function") return;
    if (Array.isArray(s.prefs) && s.prefs.length && s.mentor) {
      window.showScreen("home");
      if (typeof window.renderModes === "function") window.renderModes();
      if (typeof window.renderStats === "function") window.renderStats();
    } else {
      window.showScreen("onboarding");
    }
  }
  function stopLocalActivity() {
    const s = appState();
    if (s) {
      if (s.timerInterval) clearInterval(s.timerInterval);
      s.timerInterval = null;
      s.currentSession = null;
      s.paused = false;
      s.elapsedSeconds = 0;
    }
    if (typeof window.stopMessages === "function") window.stopMessages();
  }
  function applyUser(user) {
    const nextUid = user?.id || null;
    switchLocalIdentity(nextUid);
    currentUser = user || null;
    if (currentUser) clearPendingConfirmation();
    const s = appState();
    if (s) {
      // The browser never grants a paid plan; subscriptions require server verification.
      s.email = currentUser?.email || null;
      s.plan = "free";
      s.pendingPlan = null;
      persistApp();
    }
    if (typeof window.renderModes === "function") window.renderModes();
    if (typeof window.renderStats === "function") window.renderStats();
    if (typeof window.renderPlans === "function") window.renderPlans();
    const entry = $("account-auth-entry");
    if (entry) entry.textContent = currentUser ? "Account" : "Sign in";
    const status = $("account-auth-status");
    if (status) status.textContent = currentUser
      ? `Signed in: ${currentUser.email || "account"}`
      : "Not signed in. History is stored on this device only.";
  }
  function errorText(error) {
    const text = String(error?.message || error || "Authentication failed.");
    if (/email.*not.*authoriz/i.test(text)) {
      return "Email delivery is not configured for this address. The project owner must configure custom SMTP in Supabase.";
    }
    if (/email.*not.*confirm/i.test(text)) {
      return "Confirm your email using the message in your inbox, then sign in.";
    }
    if (/invalid login credentials/i.test(text)) {
      return "Incorrect email or password, or this sign-in method is unavailable.";
    }
    if (/rate.?limit|too many requests/i.test(text)) {
      return "Too many attempts. Try again later. The default email service has a low sending limit.";
    }
    if (/failed to fetch|network/i.test(text)) {
      return "Cannot reach the authentication service. Check your connection and the Supabase project URL.";
    }
    return text;
  }
  function credentials(signup) {
    const emailInput = $("auth-email");
    const passwordInput = $("auth-password");
    const email = (emailInput?.value || "").trim();
    const password = passwordInput?.value || "";
    if (!email || !password) throw new Error("Enter your email and password.");
    if (emailInput && !emailInput.checkValidity()) throw new Error("Enter a valid email address.");
    if (signup && password.length < 8) throw new Error("Use a password with at least 8 characters.");
    return { email, password };
  }
  function redirectUrl() {
    // Local file previews have no valid website redirect. Use the configured Site URL instead.
    if (!/^https?:$/.test(window.location.protocol)) return undefined;
    return new URL("./", window.location.href).href;
  }
  function clearPassword() {
    if ($("auth-password")) $("auth-password").value = "";
  }
  async function operation(action) {
    if (working) return;
    setBusy(true);
    message("");
    try {
      await ready;
      if (!client || startupError) throw startupError || new Error("Authentication could not initialize.");
      await action();
    } catch (error) {
      message(errorText(error));
    } finally {
      setBusy(false);
    }
  }

  // Replace the original placeholder handlers before loading the SDK.
  window.handleSignup = () => operation(async () => {
    const input = credentials(true);
    let result;
    try {
      result = await client.auth.signUp({
        ...input,
        options: { emailRedirectTo: redirectUrl() }
      });
    } finally {
      clearPassword();
    }
    if (result.error) throw result.error;
    if (result.data.session) {
      clearPendingConfirmation();
      applyUser(result.data.user);
      returnToApp();
    } else {
      // Verification often happens in Gmail, a separate browser or tab.
      // The email link may confirm successfully even when the configured redirect is broken.
      storePendingConfirmation(input.email);
      message("Check Gmail for the confirmation email. "+recoveryNotice());
    }
  });
  window.handleSignin = () => operation(async () => {
    const input = credentials(false);
    let result;
    try {
      result = await client.auth.signInWithPassword(input);
    } finally {
      clearPassword();
    }
    if (result.error) throw result.error;
    if (!result.data.session || !result.data.user) throw new Error("No authenticated session was returned.");
    clearPendingConfirmation();
    applyUser(result.data.user);
    returnToApp();
  });
  window.logout = () => {
    if (!window.confirm("Sign out on this device? Local history will remain on this device.")) return;
    openAuth();
    return operation(async () => {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      stopLocalActivity();
      const s = appState();
      if (s) s.plan = "free";
      applyUser(null);
      clearPassword();
      message("Signed out.");
    });
  };
  window.deleteAccount = () => {
    window.alert("Account deletion is not connected yet. No account or data has been deleted. Contact the project owner to request deletion.");
  };

  // Never run the old capture-then-verify payment implementation.
  function checkoutUnavailable() {
    if (!currentUser) {
      openAuth("You can create an account or sign in. Payments are temporarily unavailable.");
    } else {
      window.alert("Payments are temporarily unavailable. No payment was started.");
    }
  }
  window.buyPlan = checkoutUnavailable;
  window.showPayment = checkoutUnavailable;
  window.selectPlan = checkoutUnavailable;

  function installAccountUi() {
    const authScreen = $("screen-auth");
    const heading = authScreen?.querySelector("h1");
    const subtitle = authScreen?.querySelector(".subtitle");
    if (heading) heading.textContent = "Your account";
    if (subtitle) subtitle.textContent = "Create an account or sign in with your email and password. History currently stays on this device.";
    if ($("btn-signin")) $("btn-signin").textContent = "Sign in";
    $("auth-email")?.setAttribute("autocomplete", "username");
    $("auth-password")?.setAttribute("autocomplete", "current-password");
    const authInner = authScreen?.querySelector(".onboarding-inner");
    if (authInner && !$("account-auth-back")) {
      const back = document.createElement("button");
      back.id = "account-auth-back";
      back.type = "button";
      back.className = "btn secondary";
      back.textContent = "Back";
      back.style.marginTop = "12px";
      back.onclick = returnToApp;
      authInner.appendChild(back);
    }
    const settings = $("screen-settings")?.querySelector(".content");
    if (settings && !$("account-auth-entry")) {
      const row = document.createElement("div");
      row.className = "setting-row";
      const status = document.createElement("span");
      status.id = "account-auth-status";
      const button = document.createElement("button");
      button.id = "account-auth-entry";
      button.type = "button";
      button.className = "btn secondary";
      button.textContent = "Sign in";
      button.onclick = () => openAuth(currentUser ? `Signed in as ${currentUser.email || "your account"}.` : "");
      row.append(status, button);
      settings.prepend(row);
    }
  }
  function loadSdk() {
    if (window.supabase?.createClient) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const timeout = setTimeout(() => reject(new Error("Authentication library timed out. Reload the page and try again.")), 20000);
      script.src = SDK_URL;
      script.async = true;
      script.onload = () => {
        clearTimeout(timeout);
        if (window.supabase?.createClient) resolve();
        else reject(new Error("The authentication library could not initialize."));
      };
      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("The authentication library could not load. Check your connection or content blocker."));
      };
      document.head.appendChild(script);
    });
  }

  installAccountUi();
  // Discard the old, unverified email flag. It is not an authenticated session.
  applyUser(null);
  setBusy(true);
  const ready = (async () => {
    try {
      await loadSdk();
      client = window.supabase.createClient(PROJECT_URL, PUBLIC_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "implicit"
        }
      });
      // Synchronous listener: no nested Auth calls and no access tokens in app state.
      client.auth.onAuthStateChange((event, session) => {
        applyUser(session?.user || null);
        if (event === "SIGNED_OUT") {
          stopLocalActivity();
          const s = appState();
          if (s) s.plan = "free";
          persistApp();
          openAuth("Signed out.");
        }
      });
      const { data, error } = await client.auth.getUser();
      applyUser(error ? null : data?.user || null);
      if (error && error.name !== "AuthSessionMissingError") {
        // A stale session must not prevent a fresh password sign-in.
        openAuth("Your previous session could not be restored. Please sign in again.");
      } else if (!currentUser && pendingConfirmation()) {
        openAuth(recoveryNotice());
      } else {
        message("");
      }
      if (currentUser && $("screen-auth")?.classList.contains("active")) returnToApp();
    } catch (error) {
      // Fail closed. Do not reinstate the old fake registration handlers.
      startupError = error;
      applyUser(null);
      openAuth(errorText(error));
    } finally {
      setBusy(false);
    }
  })();
  // Resolves to a boolean for diagnostics; never exposes tokens or passwords.
  window.accountAuthReady = ready.then(() => !startupError);
})();