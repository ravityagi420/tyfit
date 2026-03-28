const supabaseClient = supabase.createClient(
"https://miqghbmmnmmqyegctnzy.supabase.co",
"sb_publishable_g_9cULdcHU2dic-CwoinGg_kKXHmqVw"
);

// 🔐 Google Login
async function googleLogin() {
await supabaseClient.auth.signInWithOAuth({
provider: "google",
options: {
redirectTo: "/index.html"
}
});
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
window.location.href = "index.html";
}
}

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    // user just signed in, update welcome text
    showUser();
  }
});

// 👤 Show user on index page
async function showUser() {
  // Get session first
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session && session.user) {
    const user = session.user;

    // Get display name from metadata, fallback to email
    let name = "User";
    
    if (user.user_metadata && user.user_metadata.full_name) {
      name = user.user_metadata.full_name;
    } else if (user.user_metadata && user.user_metadata.name) {
      // Google often stores name here
      name = user.user_metadata.name;
    } else if (user.email) {
      name = user.email.split("@")[0]; // fallback: first part of email
    }

    const el = document.getElementById("welcomeText");
    if (el) {
      el.innerText = "Welcome " + name;
    }

  } else {
    // No session → redirect to login
    window.location.href = "login.html";
  }
}

// 🚪 Logout
async function logout() {
await supabaseClient.auth.signOut();
window.location.href = "login.html";
}
