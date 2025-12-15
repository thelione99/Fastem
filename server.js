import express from 'express';
import mysql from 'mysql2/promise';
import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(cors());

// --- RATE LIMITING (Sicurezza Anti-Spam) ---
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minuti
const MAX_REQUESTS = 50; // Max 50 richieste per IP

const rateLimit = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, startTime: now });
    } else {
        const data = requestCounts.get(ip);
        if (now - data.startTime > RATE_LIMIT_WINDOW) {
            requestCounts.set(ip, { count: 1, startTime: now });
        } else {
            data.count++;
            if (data.count > MAX_REQUESTS) {
                return res.status(429).json({ error: 'Troppe richieste. Riprova più tardi.' });
            }
        }
    }
    next();
};

// Applichiamo il rate limit solo agli endpoint pubblici sensibili
app.use('/api/register', rateLimit);
app.use('/api/promoter/login', rateLimit);

// --- DATABASE CONNECTION ---
const pool = mysql.createPool({ 
    uri: process.env.DATABASE_URL, 
    waitForConnections: true, 
    connectionLimit: 10, 
    queueLimit: 0,
    charset: 'utf8mb4' 
});

// --- MIDDLEWARE AUTH ---
const checkAuth = (req, res, next) => {
    const clientPassword = req.headers['x-admin-password'];
    const serverPassword = process.env.ADMIN_PASSWORD;
    if (!serverPassword) return res.status(500).json({ error: 'Config Error: ADMIN_PASSWORD missing' });
    if (clientPassword !== serverPassword) return res.status(401).json({ error: 'Unauthorized' });
    next();
};

const getSetting = async (key) => {
    try {
        const [rows] = await pool.query('SELECT value FROM settings WHERE key_name = ?', [key]);
        return rows.length > 0 ? rows[0].value : null;
    } catch { return null; }
};

// --- ENDPOINTS IMPOSTAZIONI ---
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT key_name, value FROM settings');
    const settings = rows.reduce((acc, row) => ({ ...acc, [row.key_name]: row.value }), {});
    res.json(settings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/settings', checkAuth, async (req, res) => {
  const settings = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const [key, value] of Object.entries(settings)) {
      await connection.execute('INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?', [key, value, value]);
    }
    await connection.commit();
    res.json({ success: true });
  } catch (e) {
    await connection.rollback();
    res.status(500).json({ error: e.message });
  } finally {
    connection.release();
  }
});

// --- ENDPOINTS GUESTS ---
app.get('/api/guests', checkAuth, async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM guests ORDER BY createdAt DESC'); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/register', async (req, res) => {
  try {
    const maxGuests = await getSetting('maxGuests');
    if (maxGuests) {
        const [count] = await pool.query('SELECT COUNT(*) as c FROM guests WHERE status != "REJECTED"');
        if (count[0].c >= parseInt(maxGuests)) return res.status(403).json({ error: 'Sold Out / Lista Chiusa' });
    }

    const { firstName, lastName, email, instagram, promoterCode } = req.body;
    
    // Check duplicati email
    const [existing] = await pool.query('SELECT id FROM guests WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email già registrata' });

    const id = randomUUID();
    let validCode = null;
    if (promoterCode) {
      const [prs] = await pool.execute('SELECT code FROM promoters WHERE code = ?', [promoterCode]);
      if (prs.length > 0) validCode = prs[0].code;
    }
    await pool.execute('INSERT INTO guests (id, firstName, lastName, email, instagram, status, isUsed, createdAt, invitedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, firstName, lastName, email, instagram, 'PENDING', false, Date.now(), validCode]);
    res.json({ success: true, id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/approve', checkAuth, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.body;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const [current] = await connection.query('SELECT status, invitedBy, email, firstName FROM guests WHERE id = ?', [id]);
    if (current.length === 0) { await connection.rollback(); return res.status(404).json({ error: 'Not found' }); }
    const guest = current[0];

    if (guest.status !== 'APPROVED') {
        await connection.execute('UPDATE guests SET status = ?, qrCode = ? WHERE id = ?', ['APPROVED', id, id]);
        if (guest.invitedBy) await connection.execute('UPDATE promoters SET invites_count = invites_count + 1 WHERE code = ?', [guest.invitedBy]);
    }
    await connection.commit();

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 10) {
        try {
            await resend.emails.send({ 
                from: 'RUSSOLOCO <onboarding@resend.dev>', 
                to: [guest.email], 
                subject: 'SEI DENTRO | RUSSOLOCO', 
                html: `<div style="text-align:center;"><h1>RUSSOLOCO</h1><p>Ciao ${guest.firstName}, sei dentro.</p><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${id}" /><p>Mostra questo QR.</p></div>` 
            });
        } catch (err) { console.error("Email error:", err); }
    }
    res.json({ success: true, guest });
  } catch (e) { await connection.rollback(); res.status(500).json({ error: e.message }); } finally { connection.release(); }
});

app.post('/api/reject', checkAuth, async (req, res) => {
  try { await pool.execute('UPDATE guests SET status = ? WHERE id = ?', ['REJECTED', req.body.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

// Modifica Ospite
app.post('/api/update-guest', checkAuth, async (req, res) => {
    try {
        const { id, firstName, lastName, email, instagram } = req.body;
        const [existing] = await pool.query('SELECT id FROM guests WHERE email = ? AND id != ?', [email, id]);
        if (existing.length > 0) return res.status(400).json({ error: 'Email già in uso' });

        await pool.execute('UPDATE guests SET firstName = ?, lastName = ?, email = ?, instagram = ? WHERE id = ?', [firstName, lastName, email, instagram, id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Cancella Ospite
app.post('/api/delete-guest', checkAuth, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.body;
        const [guest] = await connection.query('SELECT status, invitedBy FROM guests WHERE id = ?', [id]);
        if (guest.length > 0 && guest[0].status === 'APPROVED' && guest[0].invitedBy) {
             await connection.execute('UPDATE promoters SET invites_count = GREATEST(invites_count - 1, 0) WHERE code = ?', [guest[0].invitedBy]);
        }
        await connection.execute('DELETE FROM guests WHERE id = ?', [id]);
        await connection.commit();
        res.json({ success: true });
    } catch (e) { await connection.rollback(); res.status(500).json({ error: e.message }); } finally { connection.release(); }
});

// Manual Check-in
app.post('/api/manual-checkin', checkAuth, async (req, res) => {
    try {
        const { id } = req.body;
        await pool.execute('UPDATE guests SET isUsed = true, usedAt = ? WHERE id = ?', [Date.now(), id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Reinvia Email QR
app.post('/api/resend-qr', checkAuth, async (req, res) => {
    const { id } = req.body;
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
        const [rows] = await pool.query('SELECT * FROM guests WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        const guest = rows[0];
        if (guest.status !== 'APPROVED') return res.status(400).json({ error: 'Not approved' });

        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({ 
                from: 'RUSSOLOCO <onboarding@resend.dev>', 
                to: [guest.email], 
                subject: 'IL TUO QR CODE | RUSSOLOCO', 
                html: `<div style="text-align:center;"><h1>RUSSOLOCO</h1><p>Ecco di nuovo il tuo accesso.</p><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${id}" /></div>` 
            });
            res.json({ success: true });
        } else { res.status(500).json({ error: 'Email service missing' }); }
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Scan QR
app.post('/api/scan', checkAuth, async (req, res) => {
  try {
    const { qrContent } = req.body;
    const [gRows] = await pool.query('SELECT * FROM guests WHERE id = ?', [qrContent]);
    if (gRows.length > 0) {
        const g = gRows[0];
        if (g.status !== 'APPROVED') return res.json({ valid: false, message: 'NON APPROVATO', type: 'error', guest: g });
        if (g.isUsed) return res.json({ valid: false, guest: g, message: 'GIÀ ENTRATO', type: 'warning' });
        await pool.execute('UPDATE guests SET isUsed = true, usedAt = ? WHERE id = ?', [Date.now(), g.id]);
        return res.json({ valid: true, guest: { ...g, isUsed: true }, message: 'BENVENUTO', type: 'success' });
    }
    const [pRows] = await pool.query('SELECT * FROM promoters WHERE id = ?', [qrContent]);
    if (pRows.length > 0) return res.json({ valid: true, type: 'promoter', message: 'PR VERIFICATO', promoter: pRows[0] });
    return res.json({ valid: false, message: 'CODICE SCONOSCIUTO', type: 'error' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reset', checkAuth, async (req, res) => { 
    try { await pool.execute('DELETE FROM guests'); res.json({ success: true }); } 
    catch (e) { res.status(500).json({ error: e.message }); } 
});

// --- ENDPOINTS PROMOTERS ---
app.get('/api/admin/promoters', checkAuth, async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM promoters ORDER BY invites_count DESC'); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/create-promoter', checkAuth, async (req, res) => {
   const maxPromoters = await getSetting('maxPromoters');
   if (maxPromoters) {
       const [count] = await pool.query('SELECT COUNT(*) as c FROM promoters');
       if (count[0].c >= parseInt(maxPromoters)) return res.status(403).json({ error: 'Limite promoter raggiunto' });
   }
   const { firstName, lastName, code, password, rewardsConfig } = req.body;
   const id = randomUUID();
   const configString = JSON.stringify(rewardsConfig);
   try {
     await pool.execute('INSERT INTO promoters (id, firstName, lastName, code, password, rewards_config, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, firstName, lastName, code, password, configString, Date.now()]);
     res.json({ success: true, id });
   } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/promoter/login', async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM promoters WHERE code = ? AND password = ?', [req.body.code, req.body.password]); if (rows.length === 0) return res.status(401).json({ error: 'Invalid' }); res.json(rows[0]); } catch (e) { res.status(500).json({ error: e.message }); }
});

// Serve Frontend
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server attivo su ${PORT}`));