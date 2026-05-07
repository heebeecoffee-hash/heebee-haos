# GOAL
Build Heebee Asset OS (HAOS) — a single web app for Heebee Coffee Pvt. Ltd. to track every owned asset across all outlets (GHB 20-seat, SHB 120-seat, JLD 60-seat), plus vendors, utilities, and a repair workflow with owner approval. 6-phase plan. Owner: Gavish Batra. Co-owner: Nitigya.

# KEY DECISIONS
- **Stack:** Apps Script backend + Google Sheet "HAOS Master" (13 tabs) + GitHub Pages PWA → Vercel migration planned (GitHub Pages had downtime issues on prior shift app).
- **Repo:** `heebeecoffee-hash/heebee-haos` (private). Live at `heebeecoffee-hash.github.io/heebee-haos/`.
- **API style:** Single `/exec` endpoint, POST with `Content-Type: text/plain;charset=utf-8` to dodge CORS preflight (Apps Script can't handle OPTIONS). JSON body with `action` field.
- **Auth:** Email + 4-digit PIN, auto-submit on 4th digit. Session in `localStorage` as `hb_haos_session`. 2hr auto-logout. 30s presence ping. Token = `base64WebSafe(email|timestamp|nonce)`.
- **Roles:** Owner (full + values + creates users) and Manager (no values, no capital totals). Users created from backend sheet only. Backend `normalizeRole()` makes role case-insensitive.
- **Asset codes:** `HB-{outlet}-{cat}-{##}`, auto-generated, increments per outlet+category combo.
- **Drive root:** `HAOS_Assets/` in personal Drive (where Sheet lives). Per-asset folder pattern: `HAOS_Assets/{outlet}/{code}/` with photos/videos/`notes.txt`.
- **Repair workflow states:** Reported → Owner Approved → Vendor Assigned → In Progress → Completed → Verified. Owner approves BEFORE vendor is called.
- **Phase 1 status:** LIVE in production. Sheet, auth, role routing, theme toggle, presence ping all working.
- **Phase 2 plan locked:** Single scrolling form (not wizard). Photos deferred to Phase 2.5. Phase 2 = pure asset CRUD + auto-codes + Drive folder creation only.
- **Loader upgrade complete:** Pulsing gold dot + crossfading label ("Signing in" → "Verifying" → "Welcome") with PIN-box success glow. Replaced spinner.
- **Resume protocol:** Gavish uploads 6 files from `~/Projects/heebee-haos/` (PROJECT_CONTEXT.md, DESIGN.md, HAOS_FUTURE_PHASES.md, code.gs, index.html, HANDOFF_PROMPT_phase1_complete.md) at start of new chat. Skip transcript re-read.
- **Owner preferences (locked):** Concise, no preamble, no filler. Short declarative sentences. Drop articles where clarity holds. Phase-based checkpoints. Time estimates before each phase. Preview/confirm before proceeding. Run tools first, show result, no narration.
- **Mac TextEdit corruption gotcha:** Saving HTML in TextEdit produces ~83KB RTF instead of ~30KB plain HTML. Always edit in GitHub web UI or VS Code.
- **Apps Script redeploy:** Use Manage deployments → existing deployment → New version to keep `/exec` URL stable. New deployment = new URL.
- **Sheet booleans:** `active=TRUE` must be checkbox or boolean TRUE, not text string.
- **Future phases (post v1):** 14 features queued in HAOS_FUTURE_PHASES.md — warranty intelligence, AMC tracker, QR codes, asset transfer, disposal, vendor scorecard, utility anomaly detection, budget caps, aging colour code, audit log UI, WhatsApp via Wati, offline PWA, reports/export, insurance.

# ARTIFACTS (verbatim)

## Loader CSS (already merged into index.html)
```css
/* =====================================================================
   LUXURY LOADER — pulsing gold dot + crossfade label
   ===================================================================== */
.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 12px 0 4px;
  animation: loaderEnter 0.4s cubic-bezier(0.4,0,0.2,1) both;
}
@keyframes loaderEnter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.loader-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 0 0 rgba(184,134,11,0.45);
  animation: dotPulse 1.4s cubic-bezier(0.4,0,0.6,1) infinite;
}
body.dark .loader-dot {
  box-shadow: 0 0 0 0 rgba(240,192,64,0.55);
}
@keyframes dotPulse {
  0%, 100% {
    transform: scale(0.75);
    opacity: 0.45;
    box-shadow: 0 0 0 0 rgba(184,134,11,0.45);
  }
  50% {
    transform: scale(1.25);
    opacity: 1;
    box-shadow: 0 0 0 8px rgba(184,134,11,0);
  }
}

.loader-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--text3);
  min-height: 14px;
  position: relative;
}
.loader-label-text {
  display: inline-block;
  animation: labelFade 0.45s cubic-bezier(0.4,0,0.2,1) both;
}
@keyframes labelFade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.pin-box.auth-ok {
  border-color: var(--gold) !important;
  box-shadow: 0 0 0 4px rgba(184,134,11,0.18) !important;
  animation: pinSuccess 0.6s cubic-bezier(0.4,0,0.2,1);
}
@keyframes pinSuccess {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}
```

## Loader JS (already merged into index.html — replaces old submitLogin)
```javascript
function showLoader(label) {
  feedback.className = 'feedback muted';
  feedback.innerHTML =
    '<div class="loader">' +
      '<div class="loader-dot"></div>' +
      '<div class="loader-label"><span class="loader-label-text" key="' + Date.now() + '">' + label + '</span></div>' +
    '</div>';
}

function updateLoaderLabel(label) {
  const el = feedback.querySelector('.loader-label');
  if (!el) return;
  el.innerHTML = '<span class="loader-label-text">' + label + '</span>';
}

async function submitLogin() {
  const pin = pinBoxes.map(b => b.value).join('');
  if (pin.length !== 4) { setFeedback('Complete the PIN', 'err'); return; }

  showLoader('Signing in');
  pinBoxes.forEach(b => b.disabled = true);

  const res = await api('validatePin', { email: workingEmail, pin: pin });

  if (!res.ok) {
    pinBoxes.forEach(b => b.disabled = false);
    setFeedback(res.error || 'Login failed', 'err');
    pinBoxes.forEach(b => b.value = '');
    pinBoxes[0].focus();
    return;
  }

  pinBoxes.forEach(b => b.classList.add('auth-ok'));
  updateLoaderLabel('Verifying');

  await new Promise(r => setTimeout(r, 350));

  setSession({
    token: res.token,
    user:  res.user,
    savedAt: Date.now()
  });

  updateLoaderLabel('Welcome');
  await new Promise(r => setTimeout(r, 450));

  pinBoxes.forEach(b => { b.classList.remove('auth-ok'); b.disabled = false; });

  await routeToRole(res.user);
}
```

## Sheet structure (created by setupHAOS() — already run)
```
Users           email | name | pin | role | active | created_at | last_login
Config          key | value | updated_at
Outlets         code | name | seats | address | active | created_at
Categories      code | name | default_serviceable | active | created_at
Assets          code | outlet | category | name | purchase_date | purchase_value | vendor_purchased | warranty_until | serviceable | service_type | service_frequency_months | last_service_date | location | status | notes | drive_folder_id | photo_count | created_by | created_at
Stockyard       asset_code | reason | moved_date | moved_by | estimated_value | notes
Service_Log     id | asset_code | service_date | vendor_id | cost | notes | performed_by | photos_added
Repair_Journal  id | asset_code | reported_date | reported_by | issue | status | owner_approved_date | owner_approved_by | vendor_id | vendor_assigned_date | started_date | completed_date | verified_date | cost | notes
Vendors         id | name | category | phone | alt_phone | email | address | amc | rating | active | notes | created_at
Utilities       id | outlet | type | month | amount | paid_date | paid_by | notes | created_at
Tasks           id | type | related_id | description | assigned_to | assigned_date | due_date | status | completed_date | notes
Approvals       id | type | related_id | requested_by | requested_date | approved_by | approved_date | status | notes
Audit_Log       timestamp | user | action | sheet | record_id | before | after
```

## Outlets seeded
```
GHB | Heebee GHB       | 20  | Ludhiana  | TRUE
SHB | Heebee SHB       | 120 | Ludhiana  | TRUE
JLD | Heebee Jalandhar | 60  | Jalandhar | TRUE
```

## Categories seeded
```
AC | Air Conditioning             | TRUE  | TRUE
CM | Coffee Machine               | TRUE  | TRUE
GR | Grinder                      | TRUE  | TRUE
BL | Blender                      | TRUE  | TRUE
FR | Fridge & Freezer             | TRUE  | TRUE
LT | Lighting                     | TRUE  | TRUE
FN | Furniture                    | FALSE | TRUE
KT | Kitchen Equipment            | TRUE  | TRUE
EL | Electrical & Wiring          | TRUE  | TRUE
PL | Plumbing                     | TRUE  | TRUE
DC | Decor & Signage              | FALSE | TRUE
CR | Crockery (V60, French press) | FALSE | TRUE
OT | Other                        | TRUE  | TRUE
```

## API endpoints live (Phase 1)
```
validatePin(email, pin)           → { ok, token, user: {email, name, role} }
getCurrentUser(token)             → { ok, user }
getOutlets(token)                 → { ok, outlets[] }
getCategories(token)              → { ok, categories[] }
pingPresence(token)               → { ok, time }
getAppMeta(token)                 → { ok, version, user, sessionHours }
logout(token)                     → { ok }
writeAudit(user, action, sheet, recordId, before, after)  // helper, not exposed
normalizeRole(r)                  // helper, not exposed
```

# OPEN QUESTIONS
- Photo size limit per upload (Phase 2.5) — Apps Script has 50MB body limit. May need direct-to-Drive resumable upload for videos.
- Phase 2 build not yet started — about to begin.

# NEXT STEPS
1. Build Phase 2 — Asset Registry (single scrolling form, no photos):
   - Add Asset form: outlet (dropdown), category (dropdown), name, purchase_date, purchase_value (Owner-only field), vendor_purchased, warranty_until, serviceable Y/N (default from category), service_type (on-call / 3mo / 6mo / 1yr), service_frequency_months, location, status (active/stockyard/disposed), notes
   - Backend: `addAsset(token, payload)` — auto-generates `HB-{outlet}-{cat}-{##}`, creates Drive folder `HAOS_Assets/{outlet}/{code}/`, stores folder ID in Assets row, writes to Audit_Log
   - Backend: `listAssets(token, filters)` — filter by outlet, category, status; Manager response strips `purchase_value`
   - Backend: `getAsset(token, code)` — full detail; Manager response strips `purchase_value`
   - Backend: `updateAsset(token, code, payload)` — edit, with audit
   - Frontend: Owner & Manager dashboards get unlocked "Asset Registry" nav item → opens List view → `+ Add Asset` button → form panel
   - Frontend: List view with filter chips (outlet, category, status), grid/list toggle
   - Frontend: Detail view with all fields, edit button, gallery placeholder ("Photos in Phase 2.5")
2. Test end-to-end: log in, add asset, verify Drive folder created, verify Sheet row, verify Manager doesn't see purchase_value
3. Generate `HANDOFF_PROMPT_phase2_complete.md` reflecting actual final state
4. Phase 2.5 — photo/video upload to Drive folder + dated `notes.txt` append
5. Phase 3 — Service Scheduler + Repair Workflow (states, owner approval queue)
6. Phase 4 — Vendors + Utilities + Stockyard
7. Phase 5 — Owner Dashboard (capital totals, repair spend rollups, approval queue, task aging)
8. Phase 6 — Polish + PWA (sw.js, manifest, mobile tuning, theme refinements)
9. Migrate hosting to Vercel after v1 stable
