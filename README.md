# Login and Sign-Up Pages

Responsive login and sign-up screens with real form validation, built with plain HTML, CSS and JavaScript. Started during the Nexus internship (Project 1) and since modernized.

## Features

- Glass-style card UI that works on phones and desktops
- **Sign up:** username rules (3–20 letters, numbers or `_`), email format check, password strength meter, and confirm-password match
- **Log in:** checks the email and password against accounts created on the sign-up page
- Show/hide password buttons
- "Remember me" fills in your email next time
- Errors appear under each field and clear as you type
- Accessible labels, keyboard focus styles and screen-reader announcements

## Files

| File | Purpose |
|---|---|
| `index.html` | Login page |
| `signup.html` | Sign-up page |
| `style.css` | Shared styles |
| `script.js` | Validation and demo account logic |
| `background.webp`, `avatar.webp` | Images (compressed from 845 KB to 17 KB) |

## Running

No build step. Serve the folder and open it in a browser:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Or enable **GitHub Pages** for this repository.

## How accounts are stored

This is a front-end demo with no server. Accounts are saved in your browser's `localStorage`, and passwords are hashed with SHA-256 before saving, so they are never stored as plain text. A real app would send the form to a backend that stores passwords with a slow hash such as bcrypt.

## Tech stack

HTML, CSS, JavaScript (Web Crypto API, localStorage)
