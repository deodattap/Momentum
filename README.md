<div align="center">

# ⚡ Momentum

**A personal productivity suite for building habits that stick.**

Habit tracking, task management, notes, analytics, and a gamified rewards system — all in one clean, fast, dependency-free web app.

[![Live Demo](https://img.shields.io/badge/demo-live-FF6B4A?style=for-the-badge)](https://momentum-pi-seven.vercel.app/)
![Vanilla JS](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![No Framework](https://img.shields.io/badge/Framework-None-1C1B1A?style=for-the-badge)
![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)

[Live App](https://momentum-pi-seven.vercel.app/) · [Report a Bug](https://github.com/deodattap/Momentum/issues) · [Request a Feature](https://github.com/deodattap/Momentum/issues)

</div>

---

## About the Project

Momentum is a multi-page productivity web app built to explore how far you can push a **pure HTML/CSS/JavaScript** stack

Every number on screen is real: streaks, XP, badge progress, and analytics charts are all computed live from the user's actual activity, not mocked or hardcoded. The app supports multiple accounts in the same browser, each with fully isolated data, and ships with a matching light/dark theme and a custom design system.

It was built to demonstrate practical front-end engineering: state management, per-user data scoping, date/streak logic, dynamic SVG chart rendering, and thoughtful UI — all without reaching for a framework.

**🔗 Live demo:** **[momentum-pi-seven.vercel.app](https://momentum-pi-seven.vercel.app/)**

---

## Features

### 🔐 Accounts & Auth
- Client-side sign-up / login system with per-user sessions
- Passwords are hashed before storage (not plaintext)
- All app data is namespaced per user (`momentum_u<id>_<key>`), so multiple accounts never leak data into each other
- Account deletion wipes every trace of that user's data

### 📊 Dashboard
- Live greeting that adapts to time of day and real activity counts
- Bento-style summary cards for today's habits, current streak, XP/level, and today's tasks
- 7-day mini activity chart and a week strip built from the real calendar
- Rotating motivational quotes and a live IST clock

### ✅ Habit Tracking
- Create habits with custom icon, color, frequency, and start date
- 14-day heatmap strip per habit with hover tooltips
- Automatic **current streak** and **longest streak** calculation from real check-in history (date-keyed, not a fixed-length array — never desyncs, no matter how long the app has been used)

### 📝 Todos
- Priority levels, due dates, and optional times
- Auto-sorted into **Today**, **Upcoming**, and **Completed**
- Live progress ring showing today's completion rate

### 🗒️ Notes
- Rich-text editor (bold, italic, lists, highlights, and more)
- Auto-saving with "last edited" timestamps
- **Export** notes as a fully self-contained, styled HTML page designed to look like a spiral notebook — downloadable, printable, or shareable via the Web Share API

### 📈 Analytics
- GitHub-style contribution heatmap across the last 6 months
- Month selector with weekly completion trend chart (hand-rendered SVG, no charting library)
- Per-habit breakdown with completion percentage over the last 14 days

### 🏆 Rewards
- XP and leveling system (+10 XP per habit check-in, +5 XP per completed todo)
- Tiered, **infinitely extending** badge chains for streaks, todos completed, and total check-ins
- Flavor badges for specific milestones (e.g. bouncing back after a missed day, a perfect day across all habits)
- Rank titles that scale with level, plus a small confetti celebration on badge unlock

### ⚙️ Settings
- Editable profile (name, email, avatar photo)
- Light / dark mode toggle
- Full account deletion with confirmation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | Semantic HTML5, one page per feature (multi-page app) |
| Styling | Hand-written CSS3 — custom properties for theming, no CSS framework |
| Behavior | Vanilla JavaScript (ES6+) — no React/Vue/jQuery |
| Persistence | Browser `localStorage`, namespaced per user |
| Typography | Fraunces (display serif) + Inter (UI sans) — a consistent type system across the app |
| Hosting | [Vercel](https://vercel.com) (static deployment) |

**Why no framework or backend?** Momentum is intentionally built as a static, client-only app. It's a demonstration of solving real product problems — multi-user data isolation, streak math, live derived stats, dynamic SVG charts — with fundamentals rather than libraries.

---

## Project Structure

```
Momentum/
├── index.html              # Entry point — redirects to login/dashboard
├── login.html              # Sign up / log in
├── dashboard.html          # Home — overview cards, live stats, greeting
├── habits.html             # Habit tracker with heatmap strips
├── todos.html              # Task manager
├── notes.html              # Rich-text notes with export/share
├── analytics.html          # Charts, trends, per-habit breakdown
├── rewards.html            # XP, levels, badges
├── settings.html           # Profile, theme, account management
├── css/
│   └── style.css           # Full design system + all page styles
└── js/
    ├── app.js              # Core app logic — state, rendering, all features
    └── auth.js             # Self-contained auth module (signup/login/session)
```

---

## Getting Started

Momentum has **zero dependencies** — no `npm install`, no build step.

```bash
# 1. Clone the repo
git clone https://github.com/deodattap/Momentum.git
cd Momentum

# 2. Open it — either directly...
open index.html          # macOS
start index.html         # Windows

# ...or serve it locally (recommended, avoids browser file:// restrictions)
npx serve .
# or
python3 -m http.server 5500
```

Then visit `http://localhost:5500` (or whichever port your server prints), sign up with any email, and start exploring.

---

## Design System

Momentum uses a consistent, hand-tuned visual language across every page:

- **Typography:** Fraunces for headings and expressive moments, Inter for UI text and body copy
- **Theming:** CSS custom properties drive both the light and dark themes from a single source of truth
- **Motion:** Subtle micro-interactions — icon animations on unlocked badges, confetti bursts, smooth ring/progress transitions — kept purposeful rather than decorative

---

## Architecture

Momentum is architected as a **modular, multi-page app** rather than a monolithic SPA:

- **`auth.js`** is a fully self-contained module (`window.MomentumAuth`) that owns identity — signup, login, sessions, and account lifecycle — completely decoupled from app logic. Every other page depends on it only through a small public API (`requireAuth()`, `currentUser()`), so the auth layer could be swapped for a server-backed provider without touching feature code.
- **`app.js`** owns all product state and rendering. State is loaded once per page load, mutated through small focused functions (`addHabit`, `toggleTodo`, `calcCurrentStreak`), and persisted immediately on every change — a simple, predictable write-through pattern instead of a global store or framework reactivity.
- **Per-user namespacing:** every piece of data is keyed as `momentum_u<id>_<key>`, so the storage layer behaves like a lightweight per-tenant database — multiple accounts coexist safely in the same browser with zero data bleed.
- **Derived, not stored:** streaks, XP, levels, badge tiers, and analytics are never saved as separate fields — they're computed live from raw history on every render. This keeps a single source of truth and makes the numbers impossible to desync.
- **Zero build step:** no bundler, no transpilation, no framework runtime. Every page loads two shared scripts, which keeps the app fast and trivial to deploy as a static site on Vercel.

---

## Roadmap

- [ ] Habit reminders / notifications
- [ ] CSV / JSON export of habit and todo history
- [ ] PWA support for offline use and installability
- [ ] Cross-device sync

---

## Author

**Deodatta Pagar**
Computer Engineering student, K.K. Wagh Institute — building full-stack, ML, and research projects.

- GitHub: [@deodattap](https://github.com/deodattap)

---

<div align="center">

If you found this useful or interesting, consider giving it a ⭐ — it helps a lot.

</div>
