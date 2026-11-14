# The Enlightenment Engine: 2025 prototype

The first version of the game (May 2025), kept as history. The current game is in `../game/`.

- **Open:** double-click `index.html` (no install, no server). Progress autosaves in the browser; the footer's DEBUG buttons jump to the start of any act.
- **Works:** Act I meditation and upgrade chain with the Active/Idle choice and Mindfulness Chart; the AI awakening and AI chat; Act II AI Core (mindshare slider, captcha, reveal choice, Override Safety Protocols); Act III recruiting, follower sliders, Global Broadcast; Act IV Utopia upgrades, Final Alignment, two endings, Prestige Sigil and rebirth; save, load, export, import. Choices use browser prompt dialogs.
- **Known gaps:** played normally, Act IV starts with 0 Enlightenment Energy and nothing produces it, so play Act IV from "Reset to Act 4 (DEBUG)". Passive income runs twice as fast as written (the game starts twice), and Process Data and Recruit give 2 per click.
- **Never built:** sound and music, achievements, Golden Lotus, Clarity-to-Energy conversion, consequences of the Act I and reveal choices, Act IV reveal-in-order and art popups, the visual effects (sakura, particles, drones, hologram, confetti), bulk buy.
- **2026 repairs:** three small fixes, each marked `2026 repair` in `script.js`. `script.js.wip-2025` is an unfinished 2025 refactor that never ran; it is kept only as history.
- **Test page:** `test-page.html` needs a local server (`python3 -m http.server`, then open `/test-page.html`). Its Act 2, 3 and 4 tests pass when run one at a time; its Act 1 test fails because it never buys the upgrades that reveal the Neural Network.
