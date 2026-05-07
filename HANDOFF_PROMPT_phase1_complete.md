# HAOS — Handoff Prompt (Phase 1 Complete)

Paste this entire file at the start of any new chat to continue HAOS work. Also upload `code.gs`, `index.html`, `PROJECT_CONTEXT.md`, `DESIGN.md`, `HAOS_FUTURE_PHASES.md` as references.

---

## STATE AS OF END OF PHASE 1

**Project:** Heebee Asset OS (HAOS) — single web app to track every owned asset across all Heebee outlets, plus vendors, utilities, repair workflow.

**Owner:** Gavish Batra · **Co-owner:** Nitigya · **Company:** Heebee Coffee Pvt. Ltd.

**Status:** Phase 1 LIVE in production. Successfully deployed and tested.

---

## STACK (LOCKED)

- **Backend:** Google Apps Script (`code.gs`) — pasted into script.google.com
- **Database:** Google Sheet `HAOS Master` — 13 tabs created by `setupHAOS()`
- **Frontend:** Single-file PWA (`index.html`) — hosted on **GitHub Pages** at `heebeecoffee-hash.github.io/heebee-haos/`
- **GitHub repo:** `heebeecoffee-hash/heebee-haos` (private)
- **Final hosting target:** Vercel (planned migration after v1 build, due to GitHub Pages downtime issues experienced on prior shift app)
- **File storage:** Google Drive folder `HAOS_Assets/` (Phase 2 onward)
- **API style:** Single `/exec` endpoint, POST with `text/plain` content-type to avoid CORS preflight, JSON body with `action` field

---

## OUTLETS (extensible from `Outlets` sheet tab)

| Code | Name             | Seats |
|------|------------------|-------|
| GHB  | Heebee GHB       | 20    |
| SHB  | Heebee SHB       | 120   |
| JLD  | Heebee Jalandhar | 60    |

## CATEGORIES (extensible from `Categories` sheet tab)

AC (Air Conditioning), CM (Coffee Machine), GR (Grinder), BL (Blender), FR (Fridge & Freezer), LT (Lighting), FN (Furniture, non-serviceable default), KT (Kitchen Equipment), EL (Electrical & Wiring), PL (Plumbing), DC (Decor & Signage, non-serviceable), CR (Crockery — V60, French press, non-serviceable), OT (Other).

## ASSET CODE FORMAT

`HB-{outlet}-{cat}-{##}` — auto-generated, increments per outlet+category combo.

---

## ROLES

| Role     | Sees values? | Can approve? | Creates users? | Adds assets? |
|----------|--------------|--------------|----------------|--------------|
| Owner    | ✅           | ✅           | ✅ (sheet only)| ✅           |
| Manager  | ❌           | ❌           | ❌             | ✅           |

**Role normalization is in place** — backend `normalizeRole()` function lowercases + capitalizes first letter, so `OWNER`, `Owner`, `owner` all work. Same applied in `validatePin()` and `getCurrentUser()`.

Users created from backend sheet only.

---

## SHEET TABS (all 13 created)

1. Users — email, name, pin, role, active, created_at, last_login
2. Config — key/value (drive root folder ID, app version, etc.)
3. Outlets — code, name, seats, address, active
4. Categories — code, name, default_serviceable, active
5. Assets — full asset registry (Phase 2)
6. Stockyard — out-of-service items (Phase 2)
7. Service_Log — preventive service entries (Phase 3)
8. Repair_Journal — repairs with workflow states + cost (Phase 3)
9. Vendors — repairmen, electricians, AMC partners (Phase 4)
10. Utilities — electricity/diesel/water by outlet/month (Phase 4)
11. Tasks — assignments with aging (Phase 4–5)
12. Approvals — owner approval queue (Phase 3 + 5)
13. Audit_Log — every edit/create/delete (used by all phases)

---

## REPAIR WORKFLOW STATES (Phase 3)

```
Reported → Owner Approved → Vendor Assigned → In Progress → Completed → Verified
```

Owner approves BEFORE vendor is called.

---

## AUTH SYSTEM

- Email + 4-digit PIN (auto-submit on 4th digit)
- Stage 1 (email) → Stage 2 (PIN with back button)
- Session in `localStorage` as `hb_haos_session`
- 2-hour auto-logout
- 30-second presence ping
- Token format: `base64WebSafe(email|timestamp|nonce)`
- Theme stored in `localStorage` as `hb_haos_theme` (light | dark)

---

## API ENDPOINTS LIVE (Phase 1)

POST to `/exec` with JSON body `{ action: "...", ...params }`:

| Action | Auth | Returns |
|--------|------|---------|
| `validatePin` | none | `{ ok, token, user: {email, name, role} }` |
| `getCurrentUser` | token | `{ ok, user }` |
| `getOutlets` | token | `{ ok, outlets[] }` |
| `getCategories` | token | `{ ok, categories[] }` |
| `pingPresence` | token | `{ ok, time }` |
| `getAppMeta` | token | `{ ok, version, user, sessionHours }` |
| `logout` | token | `{ ok }` |

Helper: `writeAudit(user, action, sheet, recordId, before, after)` — used by future write operations.

---

## DESIGN SYSTEM (LOCKED — see DESIGN.md)

- **Fonts:** Nunito Sans (200/300/400/600), Space Mono (400)
- **Brand:** "HEEBEE" weight 200, 8px tracking, uppercase
- **Light bg:** #f5f5f7 with warm cream/gold ambient orbs
- **Dark bg:** #0a0a0f with cool navy ambient orbs
- **Glass cards:** `backdrop-filter: saturate(180%) blur(20px)`, border-radius 22px
- **Theme switch:** body class `light` / `dark`, 0.55s cubic-bezier transition
- **Max width:** 540px, mobile-first
- **Gold accent:** #b8860b (light) / #f0c040 (dark) — sparingly
- **Geometric icons:** ◈ ◇ ◉ ✦ ◐ ◑ — never emojis

---

## OWNER PREFERENCES (LOCKED)

- Concise replies, no preamble, no filler
- Short declarative sentences, drop articles where clarity holds
- Phase-based checkpoints with time estimates BEFORE each phase
- Preview/confirmation before proceeding
- Run tools first, show result, no narration
- Owner builds via iPhone Safari sometimes — paste, deploy, refine
- Backend pasted to Apps Script manually; frontend edited in GitHub web UI

---

## DEPLOYMENT NOTES (lessons from Phase 1)

1. **Apps Script /exec URL** — same URL across redeploys IF using "Manage deployments" → existing deployment → New version. New deployment = new URL.
2. **CORS** — frontend uses `Content-Type: text/plain;charset=utf-8` to avoid preflight. Apps Script doesn't support OPTIONS.
3. **Mac TextEdit corruption** — saving HTML in TextEdit can produce RTF or wrong-encoded files (~83KB instead of 30KB). Always edit in GitHub web UI or VS Code.
4. **GitHub Pages cache** — deploys propagate in ~1 min. Hard refresh (Cmd+Shift+R) if changes don't appear.
5. **Role case sensitivity** — fixed via `normalizeRole()`. Future fields with similar issues should follow same pattern.
6. **Boolean checkbox in sheet** — `active=TRUE` must be a checkbox or boolean TRUE, not text string.

---

## NEXT: PHASE 2 — ASSET REGISTRY

**Scope:**
- Add Asset form (full fields: outlet, category, name, purchase date/value, vendor, warranty, serviceable Y/N, service type/freq, location, status, notes)
- Auto-code generation `HB-{outlet}-{cat}-{##}`
- Drive folder creation per asset → `HAOS_Assets/{outlet}/{code}/`
- Multi-photo + video upload to Drive folder, named `{type}_{date}.{ext}`
- Append-only `notes.txt` in each asset folder, dated entries
- Asset list view (filter by outlet, category, status)
- Asset detail view (gallery, history placeholder, edit)
- Both Owner + Manager roles can add/view (Manager sees no `purchase_value`)

**Estimated time:** 60 min generation + 15 min user setup/test.

**Open decisions for Phase 2 start:**
- Drive root folder: create new `HAOS_Assets` folder in your personal Drive, or under a Heebee shared drive?
- Photo size limit per upload? (Apps Script has 50MB body limit, may need direct-to-Drive resumable upload for videos)
- Asset add — single screen or wizard? (My recommendation: single scrolling form)

---

## FUTURE PHASES (saved separately)

See `HAOS_FUTURE_PHASES.md` — 14 features queued for after Phases 2–6 base build:
warranty intelligence, AMC tracker, QR codes, asset transfer, disposal, vendor scorecard, utility anomaly detection, budget caps, aging colour code, audit log UI, WhatsApp notifications, offline PWA, reports/export, insurance.

---

## IF YOU NEED TO RESUME

1. Open new Claude chat
2. Upload these 5 files: `PROJECT_CONTEXT.md`, `DESIGN.md`, `HAOS_FUTURE_PHASES.md`, `code.gs`, `index.html`
3. Paste this handoff prompt as your first message
4. Tell Claude which phase to start (likely Phase 2)
