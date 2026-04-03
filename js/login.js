const supabaseClient = supabase.createClient(
"https://miqghbmmnmmqyegctnzy.supabase.co",
"sb_publishable_g_9cULdcHU2dic-CwoinGg_kKXHmqVw"
);

// 🔐 Google Login
async function googleLogin() {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/index.html"
    }
  });

  if (error) {
    alert(error.message);
  }
}

// 🔐 Email Signup
async function signup() {
const name = document.getElementById("name")?.value;
const email = document.getElementById("email")?.value;
const password = document.getElementById("password")?.value;

const { data, error } = await supabaseClient.auth.signUp({
email,
password,
options: {
data: {
full_name: name
}
}
});

if (error) {
alert(error.message);
} else {
alert("Signup successful! Now login.");
}
}

// 🔑 Email Login
async function login() {
const email = document.getElementById("email")?.value;
const password = document.getElementById("password")?.value;

const { error } = await supabaseClient.auth.signInWithPassword({
email,
password
});

if (error) {
alert(error.message);
} else {
window.location.href = window.location.origin + "/index.html";
}
}

supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_IN" && session) {
    await ensureProfile(session);
    await showUser();
    toggleAuthButtons(true);
  }

  if (event === "SIGNED_OUT") {
    toggleAuthButtons(false);
    const el = document.getElementById("welcomeText");
    if (el) el.innerText = "Welcome Guest";
  }
});

// store data in profiles table after login/signup
async function ensureProfile(session) {
  if (!session || !session.user) return;

  const user = session.user;
  const meta = user.user_metadata || {};

  const fullName =
    meta.full_name ||
    meta.name ||
    "";

  let firstName = meta.given_name || "";
  let lastName = meta.family_name || "";

  if (!firstName && !lastName && fullName) {
    const parts = fullName.trim().split(" ");
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  const provider =
    user.app_metadata?.provider || "email";

  const profilePayload = {
    id: user.id,
    email: user.email,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName || [firstName, lastName].filter(Boolean).join(" "),
    auth_provider: provider,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });

  if (error) {
    console.error("Profile upsert failed:", error.message);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session) {
    await ensureProfile(session);
    await showUser();
    toggleAuthButtons(true);
  } else {
    toggleAuthButtons(false);
  }
});

// 👤 Show user on index page
async function showUser() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  const el = document.getElementById("welcomeText");

  if (!el) return;

  if (session && session.user) {
    const user = session.user;
    const meta = user.user_metadata || {};

    let name = "User";

    if (meta.full_name) {
      name = meta.full_name;
    } else if (meta.name) {
      name = meta.name;
    } else if (user.email) {
      name = user.email.split("@")[0];
    }

    el.innerText = "Welcome " + name;
  } else {
    el.innerText = "Welcome Guest";
  }
}

function toggleAuthButtons(isLoggedIn) {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginBtn) loginBtn.style.display = isLoggedIn ? "none" : "inline-block";
  if (logoutBtn) logoutBtn.style.display = isLoggedIn ? "inline-block" : "none";
}

// 🚪 Logout
async function logout() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert(error.message);
    return;
  }

  window.location.href = "login.html";
}
