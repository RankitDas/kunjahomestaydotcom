/**
 * Kunja Homestay — Local Development & Render Test Server
 * Zero external dependencies: Uses native Node.js http, fs, crypto, and path modules.
 * Handles static assets and provides mock implementations for the PHP API endpoints
 * (/api/auth.php, /api/save-content.php, /api/upload-image.php) so both kunja-desk.html
 * and index.html can be tested locally and on Render web service without PHP.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8080;
const ROOT_DIR = __dirname;
const CREDENTIALS_FILE = path.join(ROOT_DIR, 'api', 'admin_credentials.json');
const DATA_FILE = path.join(ROOT_DIR, 'kunjaData.json');
const BACKUP_DIR = path.join(ROOT_DIR, 'api', 'backups');
const IMAGES_DIR = path.join(ROOT_DIR, 'images');

// In-memory active sessions for local server: token -> session data
const sessions = new Map();

// Helper: Parse cookies from request
function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  return list;
}

// Helper: Credentials management
function hasCredentials() {
  if (!fs.existsSync(CREDENTIALS_FILE)) return false;
  const creds = getCredentials();
  return !!(creds && creds.admins && creds.admins.length > 0);
}

function getCredentials() {
  if (!fs.existsSync(CREDENTIALS_FILE)) {
    return { admins: [], otps: {} };
  }
  try {
    const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
    if (!data.admins) data.admins = [];
    if (!data.otps) data.otps = {};
    return data;
  } catch (e) {
    return { admins: [], otps: {} };
  }
}

function saveCredentials(data) {
  if (!fs.existsSync(path.dirname(CREDENTIALS_FILE))) {
    fs.mkdirSync(path.dirname(CREDENTIALS_FILE), { recursive: true });
  }
  data.updated_at = new Date().toISOString();
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function validateStrongPassword(pw) {
  if (!pw || pw.length < 8) return false;
  if (!/[A-Z]/.test(pw)) return false;
  if (!/[a-z]/.test(pw)) return false;
  if (!/[0-9]/.test(pw)) return false;
  if (!/[^A-Za-z0-9]/.test(pw)) return false;
  return true;
}

function sanitizePhone(p) {
  return (p || '').replace(/\D+/g, '');
}

// Helper: Get or create session
function getSession(req, res) {
  const cookies = parseCookies(req);
  let sid = cookies.KUNJA_SID;
  if (!sid || !sessions.has(sid)) {
    sid = crypto.randomBytes(24).toString('hex');
    sessions.set(sid, {
      authenticated: false,
      username: null,
      csrfToken: crypto.randomBytes(32).toString('hex'),
      createdAt: Date.now()
    });
  }
  // Refresh cookie header
  res.setHeader('Set-Cookie', `KUNJA_SID=${sid}; Path=/; HttpOnly; SameSite=Strict`);
  return sessions.get(sid);
}

// Helper: Send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Robots-Tag': 'noindex, nofollow',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  res.end(JSON.stringify(data));
}

// Helper: Read raw request body
function readRequestBody(req) {
  return new Promise((resolve) => {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => resolve(Buffer.concat(body)));
  });
}

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Security headers for all responses
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Block protected files
  if (pathname.includes('admin_credentials.json') || pathname.includes('/backups/')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden: Access denied.');
  }

  // -------------------------------------------------------------
  // API ROUTE 1: /api/auth.php (and /api/auth)
  // -------------------------------------------------------------
  if (pathname === '/api/auth.php' || pathname === '/api/auth') {
    const session = getSession(req, res);
    const action = parsedUrl.searchParams.get('action');

    // 1. Status Check
    if (action === 'status') {
      const creds = getCredentials();
      const adminCount = creds.admins.length;
      return sendJson(res, 200, {
        authenticated: session.authenticated,
        setup_required: (adminCount === 0),
        admin_count: adminCount,
        max_admins: 3,
        can_register: (adminCount < 3),
        current_admin: session.authenticated ? session.admin : null,
        csrf_token: session.csrfToken
      });
    }

    // 2. Request OTP (Registration or Reset)
    if (action === 'request_otp' && req.method === 'POST') {
      const bodyBuffer = await readRequestBody(req);
      let payload = {};
      try { payload = JSON.parse(bodyBuffer.toString('utf8')); } catch (e) {}
      const email = (payload.email || '').trim().toLowerCase();
      const purpose = payload.purpose || 'register';
      const name = payload.name || 'Admin';

      if (!email.includes('@')) {
        return sendJson(res, 400, { success: false, error: 'Valid email required' });
      }

      const creds = getCredentials();
      if (purpose === 'register') {
        if (creds.admins.length >= 3) {
          return sendJson(res, 400, { success: false, error: 'Maximum 3 administrators reached.' });
        }
        if (creds.admins.some(a => a.email.toLowerCase() === email)) {
          return sendJson(res, 400, { success: false, error: 'Admin with this email already exists.' });
        }
      }

      const otp = String(Math.floor(100000 + Math.random() * 900000));
      creds.otps[email] = {
        code: otp,
        expires: Date.now() + (10 * 60 * 1000),
        purpose
      };
      saveCredentials(creds);

      console.log(`\n📧 [DEV OTP DISPATCH] To: ${email} | Purpose: ${purpose} | Code: ${otp}\n`);

      return sendJson(res, 200, {
        success: true,
        message: 'A 6-digit verification code has been sent to your email.',
        expires_in: 600,
        dev_hint: `Code: ${otp}`
      });
    }

    // 3. Register Admin
    if (action === 'register' && req.method === 'POST') {
      const bodyBuffer = await readRequestBody(req);
      let payload = {};
      try { payload = JSON.parse(bodyBuffer.toString('utf8')); } catch (e) {}

      const name = (payload.name || '').trim();
      const email = (payload.email || '').trim().toLowerCase();
      const phone = sanitizePhone(payload.phone);
      const password = payload.password || '';
      const otp = (payload.otp || '').trim();

      if (!name || name.length < 2) return sendJson(res, 400, { success: false, error: 'Full Name required' });
      if (!email.includes('@')) return sendJson(res, 400, { success: false, error: 'Valid email required' });
      if (phone.length < 10) return sendJson(res, 400, { success: false, error: '10-digit phone required' });
      if (!validateStrongPassword(password)) {
        return sendJson(res, 400, { success: false, error: 'Password must have 8+ chars, uppercase, lowercase, number, special char.' });
      }

      const creds = getCredentials();
      if (creds.admins.length >= 3) return sendJson(res, 400, { success: false, error: 'Max 3 admins reached' });
      if (creds.admins.some(a => a.email.toLowerCase() === email)) {
        return sendJson(res, 400, { success: false, error: 'Email already registered' });
      }
      if (creds.admins.some(a => sanitizePhone(a.phone) === phone)) {
        return sendJson(res, 400, { success: false, error: 'Phone already registered' });
      }

      const rec = creds.otps[email];
      if (!rec || Date.now() > rec.expires || rec.code !== otp) {
        return sendJson(res, 400, { success: false, error: 'Invalid or expired OTP verification code.' });
      }
      delete creds.otps[email];

      const newAdmin = {
        id: 'admin-' + Date.now(),
        name,
        email,
        phone,
        plain_password: password,
        created_at: new Date().toISOString()
      };
      creds.admins.push(newAdmin);
      saveCredentials(creds);

      session.authenticated = true;
      session.admin = { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email, phone: newAdmin.phone };

      return sendJson(res, 200, {
        success: true,
        message: 'Admin registered successfully',
        current_admin: session.admin,
        csrf_token: session.csrfToken
      });
    }

    // 4. Login (Email or Phone + Password, NO OTP)
    if (action === 'login' && req.method === 'POST') {
      const bodyBuffer = await readRequestBody(req);
      let payload = {};
      try { payload = JSON.parse(bodyBuffer.toString('utf8')); } catch (e) {}

      const identifier = (payload.identifier || payload.username || '').trim();
      const password = payload.password || '';
      const cleanPhone = sanitizePhone(identifier);
      const lowerId = identifier.toLowerCase();

      const creds = getCredentials();
      const admin = creds.admins.find(a => 
        a.email.toLowerCase() === lowerId || 
        (cleanPhone && sanitizePhone(a.phone) === cleanPhone) ||
        (a.username && a.username.toLowerCase() === lowerId)
      );

      if (!admin) {
        return sendJson(res, 401, { success: false, error: 'No admin found matching that Email or Phone.' });
      }

      if (admin.plain_password !== password) {
        return sendJson(res, 401, { success: false, error: 'Invalid password.' });
      }

      session.authenticated = true;
      session.admin = { id: admin.id, name: admin.name, email: admin.email, phone: admin.phone };

      return sendJson(res, 200, {
        success: true,
        message: 'Login successful',
        current_admin: session.admin,
        csrf_token: session.csrfToken
      });
    }

    // 5. Reset Password (with OTP)
    if (action === 'reset_password' && req.method === 'POST') {
      const bodyBuffer = await readRequestBody(req);
      let payload = {};
      try { payload = JSON.parse(bodyBuffer.toString('utf8')); } catch (e) {}

      const email = (payload.email || '').trim().toLowerCase();
      const otp = (payload.otp || '').trim();
      const newPassword = payload.new_password || '';

      if (!validateStrongPassword(newPassword)) {
        return sendJson(res, 400, { success: false, error: 'Password must have 8+ chars, uppercase, lowercase, number, special char.' });
      }

      const creds = getCredentials();
      const rec = creds.otps[email];
      if (!rec || Date.now() > rec.expires || rec.code !== otp) {
        return sendJson(res, 400, { success: false, error: 'Invalid or expired OTP code.' });
      }

      const admin = creds.admins.find(a => a.email.toLowerCase() === email);
      if (!admin) return sendJson(res, 404, { success: false, error: 'Admin not found.' });

      admin.plain_password = newPassword;
      delete creds.otps[email];
      saveCredentials(creds);

      return sendJson(res, 200, { success: true, message: 'Password reset successfully.' });
    }

    // 6. List Admins
    if (action === 'list_admins') {
      if (!session.authenticated) return sendJson(res, 401, { success: false, error: 'Unauthorized' });
      const creds = getCredentials();
      const list = creds.admins.map(a => ({ id: a.id, name: a.name, email: a.email, phone: a.phone, created_at: a.created_at }));
      return sendJson(res, 200, { success: true, admins: list, max: 3 });
    }

    // 7. Remove Admin
    if (action === 'remove_admin' && req.method === 'POST') {
      if (!session.authenticated) return sendJson(res, 401, { success: false, error: 'Unauthorized' });
      const bodyBuffer = await readRequestBody(req);
      let payload = {};
      try { payload = JSON.parse(bodyBuffer.toString('utf8')); } catch (e) {}

      const targetId = payload.admin_id;
      const creds = getCredentials();
      if (creds.admins.length <= 1) {
        return sendJson(res, 400, { success: false, error: 'At least one admin must remain active.' });
      }

      creds.admins = creds.admins.filter(a => a.id !== targetId);
      saveCredentials(creds);

      if (session.admin && session.admin.id === targetId) {
        session.authenticated = false;
        session.admin = null;
      }
      return sendJson(res, 200, { success: true, message: 'Admin removed successfully.' });
    }

    // 8. Logout
    if (action === 'logout' && req.method === 'POST') {
      session.authenticated = false;
      session.admin = null;
      return sendJson(res, 200, { success: true, message: 'Logged out' });
    }

    return sendJson(res, 400, { success: false, error: 'Invalid action or method' });
  }

  // -------------------------------------------------------------
  // API ROUTE 2: /api/save-content.php (and /api/save-content)
  // -------------------------------------------------------------
  if (pathname === '/api/save-content.php' || pathname === '/api/save-content') {
    const session = getSession(req, res);
    if (!session.authenticated) {
      return sendJson(res, 401, { success: false, error: 'Unauthorized. Please log in.' });
    }

    const bodyBuffer = await readRequestBody(req);
    let payload = {};
    try {
      payload = JSON.parse(bodyBuffer.toString('utf8'));
    } catch (e) {
      return sendJson(res, 400, { success: false, error: 'Invalid JSON payload' });
    }

    const data = payload.data;
    if (!data || !data.siteConfig || !data.contact) {
      return sendJson(res, 400, { success: false, error: 'Payload missing siteConfig or contact' });
    }

    // Write backup
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    if (fs.existsSync(DATA_FILE)) {
      const curData = fs.readFileSync(DATA_FILE, 'utf8');
      fs.writeFileSync(path.join(BACKUP_DIR, 'kunjaData.bak.json'), curData, 'utf8');
    }

    // Write fresh data
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');

    return sendJson(res, 200, {
      success: true,
      message: 'Homestay data saved and backed up successfully.'
    });
  }

  // -------------------------------------------------------------
  // API ROUTE 3: /api/upload-image.php (and /api/upload-image)
  // -------------------------------------------------------------
  if (pathname === '/api/upload-image.php' || pathname === '/api/upload-image') {
    const session = getSession(req, res);
    if (!session.authenticated) {
      return sendJson(res, 401, { success: false, error: 'Unauthorized. Please log in.' });
    }

    // Read multipart data
    const bodyBuffer = await readRequestBody(req);
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

    if (!boundaryMatch) {
      return sendJson(res, 400, { success: false, error: 'Invalid multipart body' });
    }

    const boundary = boundaryMatch[1] || boundaryMatch[2];
    const boundaryBuffer = Buffer.from('--' + boundary);

    // Simple extraction of the first file part
    let fileBuffer = null;
    let originalName = 'upload.jpg';

    const parts = splitBuffer(bodyBuffer, boundaryBuffer);
    let targetSubfolder = '';
    for (const part of parts) {
      const headerEnd = part.indexOf('\r\n\r\n');
      if (headerEnd === -1) continue;
      const headers = part.slice(0, headerEnd).toString('utf8');
      if (headers.includes('name="subfolder"')) {
        targetSubfolder = part.slice(headerEnd + 4, part.length - 2).toString('utf8').trim();
      }
      if (headers.includes('filename=')) {
        const nameMatch = headers.match(/filename="([^"]+)"/);
        if (nameMatch) originalName = nameMatch[1];
        fileBuffer = part.slice(headerEnd + 4, part.length - 2); // trim trailing \r\n
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return sendJson(res, 400, { success: false, error: 'No image uploaded' });
    }

    const cleanSubfolder = targetSubfolder.replace(/[^a-zA-Z0-9_\-\/]/g, '').replace(/^\/+|\/+$/g, '');
    const targetDir = cleanSubfolder ? path.join(IMAGES_DIR, cleanSubfolder) : IMAGES_DIR;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(originalName).toLowerCase() || '.jpeg';
    const cleanExt = (ext === '.jpg') ? '.jpeg' : ext;
    const cleanBase = path.basename(originalName, ext).toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 20);
    const filename = `kunja-${cleanBase}-${crypto.randomBytes(3).toString('hex')}${cleanExt}`;
    const dest = path.join(targetDir, filename);

    fs.writeFileSync(dest, fileBuffer);

    const relativePath = cleanSubfolder ? `images/${cleanSubfolder}/${filename}` : `images/${filename}`;

    return sendJson(res, 200, {
      success: true,
      message: 'Photo uploaded successfully.',
      imagePath: relativePath,
      filename: filename
    });
  }

  // -------------------------------------------------------------
  // API ROUTE 4: /api/sync-folders.php (and /api/sync-folders)
  // -------------------------------------------------------------
  if (pathname === '/api/sync-folders.php' || pathname === '/api/sync-folders') {
    const session = getSession(req, res);
    if (!session.authenticated) {
      return sendJson(res, 401, { success: false, error: 'Unauthorized. Please log in.' });
    }

    let data = {};
    if (fs.existsSync(DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }

    const existingPaths = new Set();
    (data.gallery || []).forEach(g => g.image && existingPaths.add(g.image.replace(/^\//, '')));
    (data.rooms || []).forEach(r => (r.images || []).forEach(img => existingPaths.add(img.replace(/^\//, ''))));
    (data.properties || []).forEach(p => {
      if (p.coverImage) existingPaths.add(p.coverImage.replace(/^\//, ''));
      (p.rooms || []).forEach(r => (r.images || []).forEach(img => existingPaths.add(img.replace(/^\//, ''))));
    });

    function scanDir(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(scanDir(filePath));
        } else if (/\.(jpeg|jpg|png|webp)$/i.test(file)) {
          results.push(filePath);
        }
      });
      return results;
    }

    const allImages = scanDir(IMAGES_DIR);
    let newFilesCount = 0;

    allImages.forEach(fullPath => {
      const relPath = 'images/' + path.relative(IMAGES_DIR, fullPath).replace(/\\/g, '/');
      if (!existingPaths.has(relPath)) {
        existingPaths.add(relPath);
        newFilesCount++;
        const ext = path.extname(relPath);
        const title = path.basename(relPath, ext).replace(/[-_]/g, ' ');
        if (relPath.startsWith('images/building-1/')) {
          if (data.properties && data.properties[0] && data.properties[0].rooms && data.properties[0].rooms[0]) {
            data.properties[0].rooms[0].images.push(relPath);
          }
        } else if (relPath.startsWith('images/building-2/')) {
          if (data.properties && data.properties[1] && data.properties[1].rooms && data.properties[1].rooms[0]) {
            data.properties[1].rooms[0].images.push(relPath);
          }
        } else if (relPath.startsWith('images/certificates/')) {
          if (data.siteConfig && data.siteConfig.recognition) {
            data.siteConfig.recognition.certificateImage = relPath;
          }
        } else {
          if (!data.gallery) data.gallery = [];
          data.gallery.push({
            id: 'gal-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            category: 'ambiance',
            title: title.charAt(0).toUpperCase() + title.slice(1),
            caption: 'Discovered in images folder.',
            image: relPath
          });
        }
      }
    });

    if (newFilesCount > 0) {
      if (data.properties) {
        let flat = [];
        data.properties.forEach(p => {
          if (p.rooms) flat = flat.concat(p.rooms);
        });
        data.rooms = flat;
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    }

    return sendJson(res, 200, {
      success: true,
      message: `${newFilesCount} new photos synchronized.`,
      newFilesCount
    });
  }

  // -------------------------------------------------------------
  // STATIC FILE SERVING
  // -------------------------------------------------------------
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Add noindex header for kunja-desk.html
  if (pathname === '/kunja-desk.html') {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }

  // Caching controls for dynamic data
  if (pathname === '/kunjaData.json') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  const filePath = path.join(ROOT_DIR, pathname);

  // Security check: ensure path stays within ROOT_DIR
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(ROOT_DIR))) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found: ' + pathname);
  }
});

// Helper to split Buffer by delimiter
function splitBuffer(buf, delimiter) {
  const parts = [];
  let start = 0;
  let index = buf.indexOf(delimiter, start);
  while (index !== -1) {
    if (index > start) {
      parts.push(buf.slice(start, index));
    }
    start = index + delimiter.length;
    index = buf.indexOf(delimiter, start);
  }
  if (start < buf.length) {
    parts.push(buf.slice(start));
  }
  return parts;
}

server.listen(PORT, () => {
  console.log(`\n🌿 Kunja Homestay Development Server running on: http://localhost:${PORT}`);
  console.log(`   - Public Website: http://localhost:${PORT}/`);
  console.log(`   - Owner Desk:     http://localhost:${PORT}/kunja-desk.html\n`);
});
