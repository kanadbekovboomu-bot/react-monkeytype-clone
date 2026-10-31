# Monkeytype React Clone ⌨️

A minimalist, customizable typing speed application inspired by Monkeytype. Built with React 19, Vite, Lucide Icons, Vitest, and Firebase Auth & Firestore with offline fallback.

![Monkeytype Clone UI Preview](https://img.shields.io/badge/Monkeytype-Clone-e2b714?style=for-the-badge&logo=fastapi&logoColor=black)
![React 19](https://img.shields.io/badge/React-19.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4.1.12-729B1B?style=for-the-badge&logo=vitest&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-v13-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## 🌟 Key Features

- **Configurable Test Modes**:
  - **Time Mode**: 15s, 30s, 60s countdowns. Timer starts automatically on first keypress.
  - **Words Mode**: 10, 25, 50, 100 fixed word counts. Concludes when the last word is typed.
- **Dynamic Word Generation**:
  - Curated vocabulary pool of 500+ high-frequency English words.
  - Optional **Punctuation** toggle: Injects commas, periods, question marks, exclamation marks, and capitalization.
  - Optional **Numbers** toggle: Injects numerical digits and year tokens.
- **Precision Typing Engine & Visual Feedback**:
  - Character color coding: Dim gray (`pending`), Crisp white (`correct`), Accent red (`incorrect`), Dark red (`extra`), Underlined (`missed`).
  - Animated smooth caret with active letter positioning and idle pulsing.
  - 3-line multi-line viewport with smooth upward auto-scrolling that keeps the active typing line centered.
  - Extra character tolerance capped at +10 characters per word.
  - Spacebar advances word; untyped letters flagged as missed; consecutive spaces on empty words ignored.
  - Instant restart shortcuts: `Tab + Enter` or `Esc`.
- **International Typing Speed Standards**:
  - **Gross (Raw) WPM**: $\frac{\text{Total Keystrokes} / 5}{\text{Time (min)}}$
  - **Net WPM**: $\max\left(0, \frac{\text{Correct Keystrokes} / 5}{\text{Time (min)}}\right)$
  - **Accuracy %**: $\left(\frac{\text{Correct Keystrokes}}{\text{Total Keystrokes}}\right) \times 100$
  - **Consistency %**: Calculated from standard deviation of rolling 1-second WPM samples.
  - Character error breakdown: `correct / incorrect / extra / missed`.
- **Session Results & Sparkline Progression**:
  - Interactive SVG sparkline chart graphing WPM curve across elapsed seconds.
  - Red dashed markers pinpointing exact error timestamps.
  - Stat badges for Net WPM, Raw WPM, Accuracy, Consistency, and Character breakdown.
  - One-click copy summary to clipboard.
- **Firebase Authentication & Firestore Persistence**:
  - Guest / Anonymous sign-in without credentials.
  - Email & Password registration and login.
  - User profile pill displaying status and sync state.
  - Persistent test history in Cloud Firestore (`monkeytype_results`).
  - **Resilient Offline / Demo Fallback**: Automatically falls back to browser `localStorage` when running offline or without live Firebase API credentials.
- **Themes**:
  - Dark Serika (signature Monkeytype dark yellow palette).
  - Light Serika.
  - Carbon contrast theme.

---

## 📂 Project Architecture

```
react-monkeytype-clone/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Brand logo, theme toggle, auth pill, history modal trigger
│   │   ├── ModeSelector.jsx     # Modifiers (@ punctuation, # numbers) and mode pills (time/words)
│   │   ├── TypingArea.jsx       # 3-line smooth scrolling viewport, smooth caret, active typing letters
│   │   ├── StatsModal.jsx       # Post-session summary, SVG sparkline progression chart, restart actions
│   │   ├── AuthModal.jsx        # Firebase Anonymous + Email/Password authentication
│   │   └── HistoryModal.jsx     # Test leaderboard and personal test history
│   ├── services/
│   │   ├── firebase.js          # Firebase Modular Auth & Firestore initialization
│   │   └── storageAdapter.js    # Resilient storage adapter (Cloud Firestore + LocalStorage fallback)
│   ├── utils/
│   │   ├── typingMetrics.js     # Net/Gross WPM, Accuracy, Consistency math & SVG sparkline generator
│   │   └── wordGenerator.js     # 500+ curated word dictionary with Fisher-Yates shuffle
│   ├── __tests__/
│   │   └── typingMetrics.test.jsx # 24 Vitest unit tests covering math, edge cases, and generators
│   ├── App.jsx                  # Main typing orchestrator and keyboard state machine
│   ├── index.css                # Minimalist stylesheet with CSS variables & responsive layout
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (`npm.cmd` on Windows)

### Installation
```bash
# Clone the repository
git clone https://github.com/kanadbekovboomu-bot/react-monkeytype-clone.git
cd react-monkeytype-clone

# Install dependencies
npm.cmd install
```

### Running Locally
```bash
npm.cmd run dev
```
Open your browser at `http://localhost:5173/`.

### Running Tests
```bash
npm.cmd test
```

### Production Build
```bash
npm.cmd run build
```

---

## ⚙️ Firebase Configuration (Optional)

To connect live Firebase services instead of the offline demo fallback, create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

If these keys are omitted or set to demo values, the application runs in local mode using `localStorage`.

---

## 📄 License
MIT License. Built for portfolio presentation.
