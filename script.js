
/* AURA Demo Authentication
   Sign Up, Sign In, LocalStorage, Validation & Theme
*/

const USERS_KEY = "aura_demo_users_v1";
const SESSION_KEY = "aura_demo_session_v1";
const REMEMBER_KEY = "aura_demo_remember_v1";

const $ = (id) => document.getElementById(id);

const signupForm = $("signupForm");
const signinForm = $("signinForm");
const notice = $("notice");

$("year").textContent = new Date().getFullYear();
$("dob").max = new Date().toISOString().split("T")[0];

// 01. GET SAVED USERS
function getUsers() {
    try {
        const value = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

// 02. SAVE USERS
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// 03. SHOW NOTIFICATION
function showNotice(message, type = "success") {
    notice.textContent = message;
    notice.className = `notice show ${type}`;
}

function clearNotice() {
    notice.textContent = "";
    notice.className = "notice";
}

// 04. SWITCH SIGNUP / SIGNIN
function switchMode(mode) {
    const isSignup = mode === "signup";

    clearNotice();

    $("signupTab").classList.toggle("active", isSignup);
    $("signinTab").classList.toggle("active", !isSignup);

    $("signupTab").setAttribute("aria-selected", String(isSignup));
    $("signinTab").setAttribute("aria-selected", String(!isSignup));

    document.querySelector(".mode-switch")
        .classList.toggle("signin", !isSignup);

    signupForm.classList.toggle("hidden", !isSignup);
    signinForm.classList.toggle("hidden", isSignup);

    $("formKicker").textContent = isSignup
        ? "GET STARTED — IT'S FREE"
        : "WELCOME BACK";

    $("formTitle").innerHTML = isSignup
        ? "Create your<br><span>account.</span>"
        : "Good to see<br><span>you again.</span>";

    $("formSubtitle").textContent = isSignup
        ? "A few details, then you're all set."
        : "Sign in to continue to your personal space.";

    $("visualTitle").innerHTML = isSignup
        ? "Make room<br>for <span>what's next.</span>"
        : "Welcome back<br>to <span>your space.</span>";

    $("visualCopy").textContent = isSignup
        ? "Your space, your pace. Create an account and enjoy a simpler, more personal experience."
        : "Pick up right where you left off. Your personal space is ready when you are.";

    document.title = isSignup
        ? "Create Account | AURA"
        : "Sign In | AURA";
}

$("signupTab").addEventListener("click", () => switchMode("signup"));
$("signinTab").addEventListener("click", () => switchMode("signin"));
$("goSignup").addEventListener("click", () => switchMode("signup"));

// 05. DARK / LIGHT MODE
$("themeToggle").addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark");

    $("themeToggle").querySelector(".theme-icon").textContent =
        dark ? "☀" : "☾";

    $("themeToggle").setAttribute(
        "aria-label",
        dark ? "Switch to light mode" : "Switch to dark mode"
    );

    try {
        localStorage.setItem(
            "aura_demo_theme",
            dark ? "dark" : "light"
        );
    } catch {}
});

// LOAD SAVED THEME
try {
    if (localStorage.getItem("aura_demo_theme") === "dark") {
        document.body.classList.add("dark");
        $("themeToggle").querySelector(".theme-icon").textContent = "☀";
        $("themeToggle").setAttribute("aria-label", "Switch to light mode");
    }
} catch {}

// 06. SHOW / HIDE PASSWORD
document.querySelectorAll("[data-toggle]").forEach(button => {

    button.addEventListener("click", () => {

        const input = $(button.dataset.toggle);
        const reveal = input.type === "password";

        input.type = reveal ? "text" : "password";
        button.textContent = reveal ? "Hide" : "Show";

        button.setAttribute(
            "aria-label",
            reveal ? "Hide password" : "Show password"
        );
    });

});

// 07. PASSWORD STRENGTH
function passwordStrength(value) {

    let score = 0;

    if (value.length >= 8) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    return score;
}

$("signupPassword").addEventListener("input", event => {

    const value = event.target.value;
    const score = passwordStrength(value);

    const labels = [
        "Use 8+ characters",
        "Weak password",
        "Fair password",
        "Good password",
        "Strong password"
    ];

    $("strengthBar").style.width = `${score * 25}%`;

    $("strengthBar").style.background =
        score < 2 ? "#d98fa7" :
        score < 4 ? "#d6b879" :
        "#79b49a";

    $("strengthText").textContent =
        labels[value ? score : 0];

});

// 08. FORM VALIDATION HELPERS
function setError(id, message) {
    $(id).textContent = message;
}

function clearSignupErrors() {
    [
        "nameError",
        "emailError",
        "passwordError",
        "mobileError"
    ].forEach(id => setError(id, ""));
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 09. CLEAR SIGNUP FORM
signupForm.addEventListener("reset", () => {

    clearSignupErrors();
    clearNotice();

    $("strengthBar").style.width = "0";
    $("strengthText").textContent = "Use 8+ characters";

    setTimeout(() => {

        document.querySelectorAll(".password-toggle").forEach(button => {

            const input = $(button.dataset.toggle);

            if (input) {
                input.type = "password";
                button.textContent = "Show";
            }

        });

    }, 0);

});

// 10. CREATE ACCOUNT
signupForm.addEventListener("submit", async event => {

    event.preventDefault();

    clearSignupErrors();
    clearNotice();

    const fullName = $("fullName").value.trim().replace(/\s+/g, " ");
    const email = $("signupEmail").value.trim().toLowerCase();
    const password = $("signupPassword").value;
    const mobile = $("mobile").value.trim();
    const dob = $("dob").value;

    let valid = true;

    if (fullName.length < 2) {
        setError("nameError", "Please enter your full name.");
        valid = false;
    }

    if (!validEmail(email)) {
        setError("emailError", "Enter a valid email address.");
        valid = false;
    }

    if (password.length < 8) {
        setError("passwordError", "Use at least 8 characters.");
        valid = false;
    }

    if (!/^03\d{9}$/.test(mobile)) {
        setError(
            "mobileError",
            "Enter an 11-digit number, e.g. 03XXXXXXXXX."
        );
        valid = false;
    }

    if (dob && new Date(`${dob}T00:00:00`) > new Date()) {
        showNotice("Date of birth cannot be in the future.", "error");
        valid = false;
    }

    if (!valid) return;

    // CHECK DUPLICATE EMAIL
    const users = getUsers();

    if (users.some(user => user.email === email)) {

        setError(
            "emailError",
            "This email already has an account. Please sign in."
        );

        return;
    }

    // HASH PASSWORD
    let passwordHash;

    try {

        const bytes = new TextEncoder().encode(password);
        const digest = await crypto.subtle.digest("SHA-256", bytes);

        passwordHash = Array.from(new Uint8Array(digest))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");

    } catch {

        showNotice(
            "Secure hashing is unavailable. Please use a modern browser over localhost.",
            "error"
        );

        return;
    }

    // SAVE ACCOUNT
    users.push({

        id: (
            crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`
        ),

        fullName,
        email,
        passwordHash,
        mobile,
        dob,

        createdAt: new Date().toISOString()

    });

    try {

        saveUsers(users);

        showNotice(
            "Your account has been created. You can now sign in.",
            "success"
        );

        signupForm.reset();

        $("signinEmail").value = email;

        setTimeout(() => switchMode("signin"), 850);

    } catch {

        showNotice(
            "Could not save your account. Your browser storage may be full or disabled.",
            "error"
        );

    }

});

// 11. USER SIGN IN
signinForm.addEventListener("submit", async event => {

    event.preventDefault();

    clearNotice();

    setError("signinEmailError", "");
    setError("signinPasswordError", "");

    const email = $("signinEmail").value.trim().toLowerCase();
    const password = $("signinPassword").value;

    let valid = true;

    if (!validEmail(email)) {
        setError("signinEmailError", "Enter a valid email address.");
        valid = false;
    }

    if (!password) {
        setError("signinPasswordError", "Please enter your password.");
        valid = false;
    }

    if (!valid) return;

    // FIND USER
    const user = getUsers().find(item => item.email === email);

    if (!user) {

        setError(
            "signinEmailError",
            "No account found with this email."
        );

        return;
    }

    // VERIFY PASSWORD
    let passwordHash;

    try {

        const digest = await crypto.subtle.digest(
            "SHA-256",
            new TextEncoder().encode(password)
        );

        passwordHash = Array.from(new Uint8Array(digest))
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");

    } catch {

        showNotice(
            "Password verification is unavailable. Please use localhost.",
            "error"
        );

        return;
    }

    if (passwordHash !== user.passwordHash) {

        setError(
            "signinPasswordError",
            "Incorrect password. Please try again."
        );

        return;
    }

    // CREATE LOGIN SESSION
    const remember = $("rememberMe").checked;

    const storage = remember
        ? localStorage
        : sessionStorage;

    try {

        storage.setItem(
            SESSION_KEY,
            JSON.stringify({
                userId: user.id,
                signedInAt: new Date().toISOString()
            })
        );

        if (remember) {
            localStorage.setItem(REMEMBER_KEY, "yes");
        } else {
            localStorage.removeItem(REMEMBER_KEY);
        }

        showNotice(
            "Signed in successfully. Opening your dashboard…",
            "success"
        );

        // REDIRECT TO DASHBOARD
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 650);

    } catch {

        showNotice(
            "Could not create a session. Please check browser storage settings.",
            "error"
        );

    }

});
