# Stilo

Calming productivity app — tasks, smart sections, focus timer, themes.

## Quick start (recommended)

Open Terminal and run:

```bash
cd "/Users/ahanaprabhu/Desktop/My App/apps/web"
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

> **Important:** Run commands inside `apps/web`, not the parent folder, unless you use `npm run install:web` from the project root first.

## Requirements

- [Node.js](https://nodejs.org/) **18 or newer** (includes `npm`)
- Check: `node -v` and `npm -v` should print version numbers

If `command not found: npm`, install Node.js from nodejs.org, then try again.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `command not found: npm` | Install Node.js 18+ |
| `Cannot find module` | Run `npm install` inside `apps/web` |
| Blank white screen | Hard refresh (Cmd+Shift+R) or clear site data for localhost |
| Port in use | Run `npm run dev -- -p 3001` and open http://localhost:3001 |
| Stuck on loading spinner | Clear localStorage: DevTools → Application → Local Storage → delete `stilo-storage-v1` |

## From project root (optional)

```bash
cd "/Users/ahanaprabhu/Desktop/My App"
npm run install:web
npm run dev
```

## What's included

- Onboarding, Home, Plan, Focus, Calendar, Settings
- 6 themes, smart task sections, natural-language quick capture
- **Calendar sync:** Google Calendar, Outlook (Microsoft), Apple iCloud (CalDAV)
- Data saved in your browser (localStorage); calendar tokens on server (local dev)

## Connect Google & Outlook calendars

1. Copy env file:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
2. Add OAuth credentials (see **Settings → Calendar accounts** in the app for links)
3. Restart `npm run dev`
4. Open **Settings → Calendar accounts** → Connect → **Sync now**

**Apple Calendar** works without OAuth — use an [app-specific password](https://appleid.apple.com/account/manage) from your Apple ID.

## Docs

- [docs/STILO_BLUEPRINT.md](docs/STILO_BLUEPRINT.md) — full product spec
# pulse-3.0
