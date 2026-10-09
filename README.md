# Arch Package Clicker
### [pacman -S]… but fun.

A small incremental game designed with the look and feel of an Arch Linux terminal.
You build packages, buy upgrades, and optimize your Packages Per Second (PPS) like a true AUR maintainer.

 

---

## 🕹 Features
* Package building via clicking (CPS: Clicks Per Second)
* Automation through Pacbot, Compiler, and AUR Helper (PPS: Packages Per Second)
* Global system multiplier (Multi-Core Upgrade)
* Zero-Day random bonus (1% chance)
* Retro terminal UI featuring the Arch Linux aesthetic
* Validated autosaves and JSON export/import; existing v2 saves migrate by upgrade name
* Elapsed-time production, including up to eight hours of offline progress
* Mobile viewport, visible keyboard focus and reduced-motion support

---

## 🚀 Getting Started
Simply open `index.html` in your web browser.

No dependencies, no build tooling – pure HTML/CSS/JS. Keep `persistence.js` beside
`index.html` when copying the game.

Progress stays in this browser. Export a JSON backup to move it between devices.
Import asks before replacing the current game and rejects malformed saves without
changing it. An unreadable existing save is preserved until you explicitly choose
to save again. If browser storage is unavailable, the game still runs and export
remains available. No save data is sent anywhere.

Automation credits actual elapsed time, capped at eight hours per absence. Old
v2 saves have no timestamp, so their first migration adds no invented offline
production. Upgrade costs and multipliers are recomputed from owned counts.
Concurrent tabs are not coordinated: use one active game tab per browser.

## Checks

```bash
node --test tests/*.test.cjs
```

Tests cover save migration, validation, offline timing and startup recovery.
Startup, buttons, elapsed production and prestige also run in a Node DOM stub.
Visual browser, file-picker/download and physical iOS/Safari checks remain open;
the available browser download failed in this environment.

---

## 📝 License
MIT License.

---

## 🤓 Motivation
Built for the fun of the Arch ecosystem, Hyprland aesthetics, and a dash of nerd culture. This project simply demonstrates how technical concepts can be approached playfully.
