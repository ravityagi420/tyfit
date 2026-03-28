const supabaseClient = supabase.createClient(
"https://miqghbmmnmmqyegctnzy.supabase.co",
"sb_publishable_g_9cULdcHU2dic-CwoinGg_kKXHmqVw"
);

// 🔐 Google Login
async function googleLogin() {
await supabaseClient.auth.signInWithOAuth({
provider: "google",
options: {
redirectTo: "https://tyfit.de/index.html"
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

// 👤 Show user on index page
async function showUser() {
const { data: { user } } = await supabaseClient.auth.getUser();

if (user) {
const name =
user.user_metadata.full_name ||
user.email;

```
const el = document.getElementById("welcomeText");
if (el) {
  el.innerText = "Welcome " + name;
}
```

}
}

// 🚪 Logout
async function logout() {
await supabaseClient.auth.signOut();
window.location.href = "login.html";
}
