// Front-end only demo: accounts are kept in this browser's localStorage.
// Passwords are hashed with SHA-256 so they are never stored as plain text,
// but this is NOT a substitute for a real server-side authentication system.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const USERS_KEY = 'demo-users';
const REMEMBER_KEY = 'demo-remembered-email';

function loadUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
    } catch {
        return {};
    }
}

function saveUsers(users) {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return true;
    } catch {
        return false;
    }
}

async function hash(text) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

function setError(input, message) {
    const el = document.getElementById(`${input.id}-error`);
    if (el) el.textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
}

function setStatus(message, type) {
    const el = document.getElementById('status');
    el.textContent = message;
    el.className = `status ${type || ''}`;
}

function validateEmail(input) {
    const value = input.value.trim();
    if (!value) return setError(input, 'Please enter your email.');
    if (!EMAIL_RE.test(value)) return setError(input, 'Please enter a valid email address.');
    return setError(input, '');
}

function passwordScore(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0–5
}

// Clear a field's error as soon as the user starts fixing it
document.querySelectorAll('form input').forEach(input => {
    input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') setError(input, '');
    });
});

// Show / hide password buttons
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? 'Hide' : 'Show';
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
});

// ---------- Login page ----------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const remember = document.getElementById('remember');

    try {
        const saved = localStorage.getItem(REMEMBER_KEY);
        if (saved) {
            email.value = saved;
            remember.checked = true;
        }
    } catch { /* storage unavailable */ }

    email.addEventListener('blur', () => email.value && validateEmail(email));

    document.getElementById('forgot').addEventListener('click', e => {
        e.preventDefault();
        setStatus('Password reset needs a backend. This demo stores accounts only in your browser.', '');
    });

    loginForm.addEventListener('submit', async e => {
        e.preventDefault();
        setStatus('');
        const okEmail = validateEmail(email);
        const okPassword = setError(password, password.value ? '' : 'Please enter your password.');
        if (!okEmail || !okPassword) return;

        const users = loadUsers();
        const user = users[email.value.trim().toLowerCase()];
        if (!user || user.passwordHash !== await hash(password.value)) {
            setStatus('Incorrect email or password.', 'error');
            return;
        }

        try {
            if (remember.checked) localStorage.setItem(REMEMBER_KEY, email.value.trim());
            else localStorage.removeItem(REMEMBER_KEY);
        } catch { /* storage unavailable */ }

        setStatus(`Welcome back, ${user.username}!`, 'success');
        loginForm.reset();
        if (remember.checked) email.value = user.email;
    });
}

// ---------- Sign-up page ----------
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirm = document.getElementById('confirm');
    const bar = document.getElementById('strength-bar');
    const label = document.getElementById('strength-label');

    const validateUsername = () => {
        const v = username.value.trim();
        if (!v) return setError(username, 'Please choose a username.');
        if (!USERNAME_RE.test(v)) return setError(username, 'Use 3–20 letters, numbers or underscores.');
        return setError(username, '');
    };

    const validatePassword = () => {
        const v = password.value;
        if (!v) return setError(password, 'Please enter a password.');
        if (v.length < 8) return setError(password, 'Password must be at least 8 characters.');
        if (passwordScore(v) < 3) return setError(password, 'Add upper and lower case letters, a number or a symbol.');
        return setError(password, '');
    };

    const validateConfirm = () => {
        if (!confirm.value) return setError(confirm, 'Please confirm your password.');
        if (confirm.value !== password.value) return setError(confirm, 'Passwords do not match.');
        return setError(confirm, '');
    };

    password.addEventListener('input', () => {
        const score = passwordScore(password.value);
        const levels = [
            { w: 0, c: 'transparent', t: '' },
            { w: 20, c: 'var(--weak)', t: 'Weak' },
            { w: 40, c: 'var(--weak)', t: 'Weak' },
            { w: 60, c: 'var(--medium)', t: 'Okay' },
            { w: 80, c: 'var(--strong)', t: 'Strong' },
            { w: 100, c: 'var(--strong)', t: 'Very strong' },
        ];
        const level = password.value ? levels[Math.max(score, 1)] : levels[0];
        bar.style.width = `${level.w}%`;
        bar.style.background = level.c;
        label.textContent = level.t;
        if (confirm.value) validateConfirm();
    });

    username.addEventListener('blur', () => username.value && validateUsername());
    email.addEventListener('blur', () => email.value && validateEmail(email));
    confirm.addEventListener('input', () => confirm.value && validateConfirm());

    signupForm.addEventListener('submit', async e => {
        e.preventDefault();
        setStatus('');
        const results = [validateUsername(), validateEmail(email), validatePassword(), validateConfirm()];
        if (results.includes(false)) return;

        const users = loadUsers();
        const key = email.value.trim().toLowerCase();
        if (users[key]) {
            setError(email, 'An account with this email already exists.');
            return;
        }

        users[key] = {
            username: username.value.trim(),
            email: email.value.trim(),
            passwordHash: await hash(password.value),
            createdAt: new Date().toISOString(),
        };

        if (!saveUsers(users)) {
            setStatus('Could not save your account in this browser.', 'error');
            return;
        }

        setStatus('Account created! Redirecting to log in…', 'success');
        signupForm.querySelector('.btn').disabled = true;
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    });
}
