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

const APP_VERSION = 'haos-v1.0-phase2';
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
      case 'addAsset':       result = addAsset(data.token, data.payload); break;
      case 'listAssets':     result = listAssets(data.token, data.filters); break;
      case 'getAsset':       result = getAsset(data.token, data.code); break;
      case 'updateAsset':    result = updateAsset(data.token, data.code, data.payload); break;
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
        user: { email: email, name: row[c.name], role: normalizeRole(row[c.role]) }
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
        user: { email: decoded.email, name: row[c.name], role: normalizeRole(row[c.role]) }
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

// =====================================================================
// HELPERS
// =====================================================================

// Converts any value Google Sheets might give us for a date to yyyy-MM-dd.
// Sheets stores dates as Date objects; cells typed as text come as strings.
function normalizeDateStr(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  const s = String(val).trim();
  // Already yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Try parsing
  const dt = new Date(s);
  if (!isNaN(dt)) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  return s;
}

// Returns next available code like HB-GHB-AC-03.
// Scans Assets sheet for existing codes matching the outlet+category prefix.
function nextAssetCode(outlet, category) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Assets');
  const data = sheet.getDataRange().getValues();
  const prefix = 'HB-' + outlet + '-' + category + '-';
  let max = 0;
  for (let i = 1; i < data.length; i++) {
    const code = String(data[i][0] || '');
    if (code.startsWith(prefix)) {
      const num = parseInt(code.slice(prefix.length), 10);
      if (!isNaN(num) && num > max) max = num;
    }
  }
  return prefix + String(max + 1).padStart(2, '0');
}

// Returns value from Config sheet for a given key.
function getConfigValue(key) {
  const data = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Config').getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === key) return String(data[i][1]).trim();
  }
  return '';
}

// Returns existing child folder by name, or creates it.
function getOrCreateFolder(parentFolder, name) {
  const it = parentFolder.getFoldersByName(name);
  return it.hasNext() ? it.next() : parentFolder.createFolder(name);
}

// Reads a sheet into an array of objects keyed by header row.
function sheetToObjects(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = ss.getSheetByName(sheetName).getDataRange().getValues();
  if (data.length < 2) return [];
  const h = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    h.forEach((k, j) => { obj[k] = data[i][j]; });
    rows.push(obj);
  }
  return rows;
}

// Strips fields the Manager role must not see.
function stripForRole(asset, role) {
  if (role !== 'Owner') {
    delete asset.purchase_value;
  }
  return asset;
}

// =====================================================================
// ASSET CRUD
// =====================================================================

function addAsset(token, payload) {
  const auth = getCurrentUser(token);
  if (!auth.ok) return auth;
  if (!payload) return { ok: false, error: 'Payload required' };

  const outlet   = String(payload.outlet   || '').trim().toUpperCase();
  const category = String(payload.category || '').trim().toUpperCase();
  const name     = String(payload.name     || '').trim();

  if (!outlet)   return { ok: false, error: 'Outlet required' };
  if (!category) return { ok: false, error: 'Category required' };
  if (!name)     return { ok: false, error: 'Asset name required' };

  const code = nextAssetCode(outlet, category);
  const now  = new Date().toISOString();

  // Build the row matching SHEETS.Assets column order exactly.
  const row = [
    code,
    outlet,
    category,
    name,
    normalizeDateStr(payload.purchase_date),
    payload.purchase_value !== undefined ? payload.purchase_value : '',
    String(payload.vendor_purchased || '').trim(),
    normalizeDateStr(payload.warranty_until),
    payload.serviceable === true || payload.serviceable === 'true' ? true : false,
    String(payload.service_type || '').trim(),
    payload.service_frequency_months !== undefined ? Number(payload.service_frequency_months) || '' : '',
    '',                                          // last_service_date — empty on creation
    String(payload.location || '').trim(),
    String(payload.status   || 'active').trim(),
    String(payload.notes    || '').trim(),
    '',                                          // drive_folder_id — set below
    0,                                           // photo_count
    auth.user.email,
    now
  ];

  // Create Drive folder: HAOS_Assets/{outlet}/{code}/
  let driveFolderId = '';
  try {
    const rootId = getConfigValue('drive_root_folder_id');
    if (!rootId) throw new Error('drive_root_folder_id is empty in Config');
    const root      = DriveApp.getFolderById(rootId);
    const outletDir = getOrCreateFolder(root, outlet);
    const assetDir  = getOrCreateFolder(outletDir, code);
    driveFolderId   = assetDir.getId();
  } catch (e) {
    Logger.log('Drive folder creation failed: ' + e.toString());
  }

  // Slot drive_folder_id into the row (index 15, 0-based).
  row[15] = driveFolderId;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheetByName('Assets').appendRow(row);

  writeAudit(auth.user.email, 'addAsset', 'Assets', code, {}, payload);

  return { ok: true, code: code, drive_folder_id: driveFolderId };
}

function listAssets(token, filters) {
  const auth = getCurrentUser(token);
  if (!auth.ok) return auth;

  const rows = sheetToObjects('Assets');
  const f = filters || {};

  const filtered = rows.filter(a => {
    if (f.outlet   && a.outlet   !== f.outlet)   return false;
    if (f.category && a.category !== f.category) return false;
    if (f.status   && a.status   !== f.status)   return false;
    return true;
  });

  const assets = filtered.map(a => {
    // Normalize date fields so frontend always gets strings, not Date objects.
    a.purchase_date   = normalizeDateStr(a.purchase_date);
    a.warranty_until  = normalizeDateStr(a.warranty_until);
    a.last_service_date = normalizeDateStr(a.last_service_date);
    a.created_at      = normalizeDateStr(a.created_at);
    return stripForRole(a, normalizeRole(auth.user.role));
  });

  return { ok: true, assets: assets };
}

function getAsset(token, code) {
  const auth = getCurrentUser(token);
  if (!auth.ok) return auth;
  if (!code) return { ok: false, error: 'Code required' };

  const rows = sheetToObjects('Assets');
  const asset = rows.find(a => String(a.code).trim() === String(code).trim());
  if (!asset) return { ok: false, error: 'Asset not found: ' + code };

  asset.purchase_date     = normalizeDateStr(asset.purchase_date);
  asset.warranty_until    = normalizeDateStr(asset.warranty_until);
  asset.last_service_date = normalizeDateStr(asset.last_service_date);
  asset.created_at        = normalizeDateStr(asset.created_at);

  return { ok: true, asset: stripForRole(asset, normalizeRole(auth.user.role)) };
}

function updateAsset(token, code, payload) {
  const auth = getCurrentUser(token);
  if (!auth.ok) return auth;
  if (!code)    return { ok: false, error: 'Code required' };
  if (!payload) return { ok: false, error: 'Payload required' };

  // Manager cannot update purchase_value.
  if (normalizeRole(auth.user.role) !== 'Owner') {
    delete payload.purchase_value;
  }

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Assets');
  const data  = sheet.getDataRange().getValues();
  const h     = data[0];
  const codeIdx = h.indexOf('code');

  let rowIdx = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][codeIdx]).trim() === String(code).trim()) {
      rowIdx = i + 1; // 1-based sheet row
      break;
    }
  }
  if (rowIdx === -1) return { ok: false, error: 'Asset not found: ' + code };

  // Snapshot before state for audit.
  const before = {};
  h.forEach((k, j) => { before[k] = data[rowIdx - 1][j]; });

  // Allowed editable fields (code, created_by, created_at, drive_folder_id, photo_count not editable via UI).
  const editable = [
    'name', 'purchase_date', 'purchase_value', 'vendor_purchased',
    'warranty_until', 'serviceable', 'service_type', 'service_frequency_months',
    'location', 'status', 'notes'
  ];

  editable.forEach(field => {
    if (payload[field] === undefined) return;
    const colIdx = h.indexOf(field);
    if (colIdx === -1) return;
    let val = payload[field];
    if (field === 'purchase_date' || field === 'warranty_until') val = normalizeDateStr(val);
    if (field === 'serviceable') val = (val === true || val === 'true');
    if (field === 'service_frequency_months') val = Number(val) || '';
    sheet.getRange(rowIdx, colIdx + 1).setValue(val);
  });

  writeAudit(auth.user.email, 'updateAsset', 'Assets', code, before, payload);

  return { ok: true, code: code };
}

// =====================================================================
// ROLE HELPER (also used by asset functions above)
// =====================================================================

function normalizeRole(r) {
  if (!r) return '';
  const s = String(r).trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
