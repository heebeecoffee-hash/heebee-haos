# HAOS — Future Phases (Post v1)

Saved features to add after the v1 base build (Phases 1–6) is locked.
Upload this file at the start of any chat to resume the roadmap.

---

## Phase 7 — Warranty Intelligence
- Warranty expiry field on every asset (already captured in v1)
- Auto-block / warn before any repair approval if asset still under warranty
- Dashboard tile: "Assets under warranty" count + value
- Alert 30 days before warranty lapse

## Phase 8 — AMC Tracker
- New sheet tab: AMC_Contracts
- Vendor + asset(s) covered + start/end date + cost + service frequency
- Auto-link to vendor directory
- Dashboard: AMCs expiring this month/quarter
- Cross-check: if AMC active, repair requests auto-route to AMC vendor

## Phase 9 — QR Code System
- Generate printable QR per asset (PDF sheet for sticking on equipment)
- QR opens public-safe asset page: report issue, view last service, no values shown
- Barista role with QR-scan-only access
- Auto-creates repair request in queue

## Phase 10 — Asset Transfer Log
- Move asset between outlets with reason
- Transfer history per asset
- Stockyard ↔ active outlet transitions logged here too
- Capital value re-attributes to receiving outlet

## Phase 11 — Disposal / Write-Off
- Mark asset as disposed/scrapped/sold/lost
- Salvage value captured
- Removes from active capital, retains in archived register
- Reason + approval chain

## Phase 12 — Vendor Scorecard
- Auto-built from Repair_Journal:
  - Avg cost per repair type
  - Avg turnaround time
  - Frequency of use
  - Rework rate (same asset, same issue, repeat vendor)
- Sort/rank vendors per category

## Phase 13 — Utility Comparison + Anomaly Detection
- Month-on-month % change per outlet
- Auto-flag spikes (>20% increase)
- Per-seat / per-sqft normalization for fair compare across outlets
- Annual trend chart

## Phase 14 — Budget Caps
- Monthly repair budget per outlet (set by owner)
- Live tracker: spent vs cap
- Alert at 75% / 100% utilisation
- Approval auto-flag if request would breach cap

## Phase 15 — Aging Colour Code
- Task pending >3 days = yellow
- Task pending >7 days = red
- Owner dashboard sortable by age
- Auto-escalation on red

## Phase 16 — Audit Log
- Every edit/create/delete logged with user + timestamp + before/after
- Owner-only audit view
- Filter by user, date range, action type

## Phase 17 — Notifications
- WhatsApp via Wati for: service due, repair approved, vendor assigned, task overdue
- Email fallback
- Owner gets approval requests via WhatsApp with one-tap approve link

## Phase 18 — Offline PWA
- Service worker for offline asset list + add-issue queue
- Sync when back online
- Same pattern as shift system

## Phase 19 — Reports & Export
- Monthly outlet report PDF (capital, repairs, utilities, pending tasks)
- Annual asset depreciation calc
- Tax-ready CSV export

## Phase 20 — Insurance Module
- Per-asset insurance flag, policy number, expiry, claim history
- Pre-claim checklist
- Renewal reminders

---

## Open ideas (not yet phased)
- Photo OCR for invoice auto-extraction
- Predictive service: "Coffee machine X averages failure every 11 months — book service"
- Inter-outlet asset borrow tracking (short-term)
- Asset depreciation schedule (straight-line / WDV)
- Cleaning schedule integration (separate from service)
