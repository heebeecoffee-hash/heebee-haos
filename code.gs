// =====================================================================
// HAOS — Heebee Asset OS — Backend (Phase 1: Foundation)
// =====================================================================
// SETUP STEPS:
// 1. Open script.google.com from a NEW Google Sheet you've named anything
// 2. Paste this entire file into Code.gs
// 3. Save (Ctrl/Cmd + S)
// 4. From the Run menu: select  setupHAOS  → click Run
// 5. Approve all permissions Google asks for
// 6. After it completes, your sheet has 13 tabs ready
// 7. Open the Users tab and add yourself + Nitigya:
//    email | name | pin (4 digits) | role=Owner | active=TRUE | (leave rest blank)
// 8. Deploy: Deploy → New deployment → Web app
//      Description: HAOS v1
//      Execute as: Me
//      Who has access: Anyone
//    → Copy the /exec URL — paste it into index.html constant API_URL
// 9. Open index.html in browser → log in
// =====================================================================

const APP_VERSION = 'haos-v1.0-phase1';
const SHEET_NAME = 'HAOS Master';
const SESSION_HOURS = 2;

const SHEETS = {
  Users:           ['email', 'name', 'pin', 'role', 'active', 'created_at', 'last_login'],
  Config:          ['key', 'value', 'updated_at'],
  Outlets:         ['code', 'name', 'seats', 'address', 'active', 'created_at'],
  Categories:      ['code', 'name', 'default_serviceable', 'active', 'created_at'],
  Assets:          ['code', 'outlet', 'category', 'name', 'purchase_date', 'purchase_value',
                    'vendor_purchased', 'warranty_until', 'serviceable', 'service_type',
                    'service_frequency_months', 'last_service_date', 'location', 'status',
                    'notes', 'drive_folder_id', 'photo_count', 'created_by', 'created_at'],
  Stockyard:       ['asset_code', 'reason', 'moved_date', 'moved_by', 'estimated_value', 'notes'],
  Service_Log:     ['id', 'asset_code', 'service_date', 'vendor_id', 'cost', 'notes',
                    'performed_by', 'photos_added'],
  Repair_Journal:  ['id', 'asset_code', 'reported_date', 'reported_by', 'issue', 'status',
                    'owner_approved_date', 'owner_approved_by', 'vendor_id',
                    'vendor_assigned_date', 'started_date', 'completed_date',
                    'verified_date', 'cost', 'notes'],
  Vendors:         ['id', 'name', 'category', 'phone', 'alt_phone', 'email', 'address',
                    'amc', 'rating', 'active', 'notes', 'created_at'],
  Utilities:       ['id', 'outlet', 'type', 'month', 'amount', 'paid_date', 'paid_by',
                    'notes', 'created_at'],
  Tasks:           ['id', 'type', 'related_id', 'description', 'assigned_to',
                    'assigned_date', 'due_date', 'status', 'completed_date', 'notes'],
  Approvals:       ['id', 'type', 'related_id', 'requested_by', 'requested_date',
                    'approved_by', 'approved_date', 'status', 'notes'],
  Audit_Log:       ['timestamp', 'user', 'action', 'sheet', 'record_id', 'before', 'after']
};

const SEED_OUTLETS = [
  ['GHB', 'Heebee GHB',       20,  'Ludhiana',  true],
  ['SHB', 'Heebee SHB',       120, 'Ludhiana',  true],
  ['JLD', 'Heebee Jalandhar', 60,  'Jalandhar', true]
];

const SEED_CATEGORIES = [
  ['AC', 'Air Conditioning',             true,  true],
  ['CM', 'Coffee Machine',               true,  true],
  ['GR', 'Grinder',                      true,  true],
  ['BL', 'Blender',                      true,  true],
  ['FR', 'Fridge & Freezer',             true,  true],
  ['LT', 'Lighting',                     true,  true],
  ['FN', 'Furniture',                    false, true],
  ['KT', 'Kitchen Equipment',            true,  true],
  ['EL', 'Electrical & Wiring',          true,  true],
  ['PL', 'Plumbing',                     true,  true],
  ['DC', 'Decor & Signage',              false, true],
  ['CR', 'Crockery (V60, French press)', false, true],
  ['OT', 'Other',                        true,  true]
];

const SEED_CONFIG = [
  ['app_version',           APP_VERSION],
  ['drive_root_folder_id',  ''],
  ['drive_root_folder_name','HAOS_Assets'],
  ['session_hours',         String(SESSION_HOURS)]
];

// =====================================================================
// SETUP — run once
// =====================================================================

function setupHAOS() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss.getName() !== SHEET_NAME) ss.rename(SHEET_NAME);

  Object.keys(SHEETS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    const headers = SHEETS[name];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#f5f5f7')
      .setFontFamily('Inter');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  });

  const now = new Date().toISOString();

  // Seed Outlets
  const ot = ss.getSheetByName('Outlets');
  if (ot.getLastRow() < 2) {
    SEED_OUTLETS.forEach(r => ot.appendRow([...r, now]));
  }

  // Seed Categories
  const ct = ss.getSheetByName('Categories');
  if (ct.getLastRow() < 2) {
    SEED_CATEGORIES.forEach(r => ct.appendRow([...r, now]));
  }

  // Seed Config
  const cf = ss.getSheetByName('Config');
  if (cf.getLastRow() < 2) {
    SEED_CONFIG.forEach(r => cf.appendRow([...r, now]));
  }

  // Delete default Sheet1 if empty
  const def = ss.getSheetByName('Sheet1');
  if (def && def.getLastRow() <= 1 && ss.getSheets().length > 1) {
    ss.deleteSheet(def);
  }

  // Reorder tabs
  Object.keys(SHEETS).forEach((name, i) => {
    const s = ss.getSheetByName(name);
    if (s) {
      ss.setActiveSheet(s);
      ss.moveActiveSheet(i + 1);
    }
  });

  SpreadsheetApp.getUi().alert(
    'HAOS Setup Complete ✓',
    'All 13 sheet tabs created and seeded.\n\n' +
    'Next steps:\n' +
    '1. Open Users tab — add yourself + Nitigya\n' +
    '   (email | name | pin | role=Owner | active=TRUE)\n\n' +
    '2. Deploy → New deployment → Web app\n' +
    '   Execute as: Me  |  Who has access: Anyone\n\n' +
    '3. Copy /exec URL into index.html → API_URL constant',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// =====================================================================
// WEB APP ENTRY
// =====================================================================

function doGet(e) {
  // Health check / fallback page if someone opens /exec directly
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    service: 'HAOS',
    version: APP_VERSION,
    message: 'Heebee Asset OS backend running. Frontend served from GitHub Pages / Vercel.'
  })).setMimeType(ContentService.MimeType.JSON);
}

// All frontend calls come through here as POST with text/plain content
// (avoids CORS preflight that Apps Script can't handle)
function doPost(e) {
  let result;
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    switch (action) {
      case 'validatePin':    result = validatePin(data.email, data.pin); break;
      case 'getCurrentUser': result = getCurrentUser(data.token); break;
      case 'getOutlets':     result = getOutlets(data.token); break;
      case 'getCategories':  result = getCategories(data.token); break;
      case 'pingPresence':   result = pingPresence(data.token); break;
      case 'getAppMeta':     result = getAppMeta(data.token); break;
      case 'logout':         result = logout(data.token); break;
      default:               result = { ok: false, error: 'Unknown action: ' + action };
    }
  } catch (err) {
    result = { ok: false, error: 'Server error: ' + err.toString() };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// =====================================================================
// AUTH
// =====================================================================

function validatePin(email, pin) {
  email = String(email || '').trim().toLowerCase();
  pin = String(pin || '').trim();

  if (!email || !pin) return { ok: false, error: 'Email and PIN required' };
  if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'PIN must be 4 digits' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const h = data[0];
  const c = {
    email:   h.indexOf('email'),
    pin:     h.indexOf('pin'),
    role:    h.indexOf('role'),
    active:  h.indexOf('active'),
    name:    h.indexOf('name'),
    last:    h.indexOf('last_login')
  };

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[c.email] || '').trim().toLowerCase() === email
        && String(row[c.pin] || '').trim() === pin
        && row[c.active] === true) {
      sheet.getRange(i + 1, c.last + 1).setValue(new Date().toISOString());
      const token = generateToken(email);
      return {
        ok: true,
        token: token,
        user: { email: email, name: row[c.name], role: row[c.role] }
      };
    }
  }
  return { ok: false, error: 'Invalid email or PIN' };
}

function generateToken(email) {
  const parts = [email, Date.now().toString(), Math.random().toString(36).substr(2, 9)];
  return Utilities.base64EncodeWebSafe(parts.join('|'));
}

function decodeToken(token) {
  try {
    const decoded = Utilities.base64DecodeWebSafe(token);
    const str = Utilities.newBlob(decoded).getDataAsString();
    const parts = str.split('|');
    return { email: parts[0], timestamp: parseInt(parts[1]), nonce: parts[2] };
  } catch (e) { return null; }
}

function getCurrentUser(token) {
  const decoded = decodeToken(token);
  if (!decoded) return { ok: false, error: 'Invalid session' };

  const ageMs = Date.now() - decoded.timestamp;
  if (ageMs > SESSION_HOURS * 60 * 60 * 1000) {
    return { ok: false, error: 'Session expired' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Users');
  const data = sheet.getDataRange().getValues();
  const h = data[0];
  const c = {
    email:  h.indexOf('email'),
    name:   h.indexOf('name'),
    role:   h.indexOf('role'),
    active: h.indexOf('active')
  };

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[c.email] || '').trim().toLowerCase() === decoded.email
        && row[c.active] === true) {
      return {
        ok: true,
        user: { email: decoded.email, name: row[c.name], role: row[c.role] }
      };
    }
  }
  return { ok: false, error: 'User not found or inactive' };
}

// =====================================================================
// DROPDOWN DATA
// =====================================================================

function getOutlets(token) {
  const auth = getCurrentUser(token);
  if (!auth.ok) return auth;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = ss.getSheetByName('Outlets').getDataRange().getValues();
  if (data.length < 2) return { ok: true, outlets: [] };
  const h = data[0];
  const out = [];
  for (let i = 1; i < data.length; i++) {
    const o = {};
    h.forEach((k, j) => o[k] = data[i][j]);
    if (o.active === true) out.push(o);
  }
  return { ok: true, outlets: out };
}

function getCategories(token) {
  const auth = getCurrentUser(token);
  if (!auth.ok) return auth;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = ss.getSheetByName('Categories').getDataRange().getValues();
  if (data.length < 2) return { ok: true, categories: [] };
  const h = data[0];
  const cats = [];
  for (let i = 1; i < data.length; i++) {
    const c = {};
    h.forEach((k, j) => c[k] = data[i][j]);
    if (c.active === true) cats.push(c);
  }
  return { ok: true, categories: cats };
}

function pingPresence(token) {
  const auth = getCurrentUser(token);
  return { ok: auth.ok, time: new Date().toISOString() };
}

function logout(token) {
  return { ok: true };
}

function getAppMeta(token) {
  const auth = getCurrentUser(token);
  if (!auth.ok) return auth;
  return {
    ok: true,
    version: APP_VERSION,
    user: auth.user,
    sessionHours: SESSION_HOURS
  };
}

// =====================================================================
// AUDIT (used by future phases on every write)
// =====================================================================

function writeAudit(user, action, sheet, recordId, before, after) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const log = ss.getSheetByName('Audit_Log');
    log.appendRow([
      new Date().toISOString(),
      user || '',
      action || '',
      sheet || '',
      recordId || '',
      JSON.stringify(before || {}),
      JSON.stringify(after || {})
    ]);
  } catch (e) {
    Logger.log('Audit failed: ' + e.toString());
  }
}
