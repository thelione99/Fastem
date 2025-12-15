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

const pool = mysql.createPool({ uri: process.env.DATABASE_URL, waitForConnections: true, connectionLimit: 10, queueLimit: 0 });

const checkAuth = (req, res, next) => {
    const clientPassword = req.headers['x-admin-password'];
    const serverPassword = process.env.ADMIN_PASSWORD;
    if (!serverPassword) return res.status(500).json({ error: 'Config Error' });
    if (clientPassword !== serverPassword) return res.status(401).json({ error: 'Unauthorized' });
    next();
};

// Helper per leggere settings lato server
const getSetting = async (key) => {
    try {
        const [rows] = await pool.query('SELECT value FROM settings WHERE key_name = ?', [key]);
        return rows.length > 0 ? rows[0].value : null;
    } catch { return null; }
};

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

app.get('/api/guests', checkAuth, async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM guests ORDER BY createdAt DESC'); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/promoters', checkAuth, async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM promoters ORDER BY invites_count DESC'); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/create-promoter', checkAuth, async (req, res) => {
   // CHECK LIMITI PROMOTER
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

    if (process.env.RESEND_API_KEY) {
        await resend.emails.send({ from: 'RUSSOLOCO <no-reply@russoloco.it>', to: [guest.email], subject: 'SEI DENTRO.', html: `<div style="text-align:center;"><h1>RUSSOLOCO</h1><p>Ciao ${guest.firstName}, sei dentro.</p><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${id}" /><p>Mostra questo QR.</p></div>` });
    }
    res.json({ success: true, guest });
  } catch (e) { await connection.rollback(); res.status(500).json({ error: e.message }); } finally { connection.release(); }
});

app.post('/api/reject', checkAuth, async (req, res) => {
  try { await pool.execute('UPDATE guests SET status = ? WHERE id = ?', ['REJECTED', req.body.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

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

app.post('/api/reset', checkAuth, async (req, res) => { try { await pool.execute('DELETE FROM guests'); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); } });

app.post('/api/promoter/login', async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM promoters WHERE code = ? AND password = ?', [req.body.code, req.body.password]); if (rows.length === 0) return res.status(401).json({ error: 'Invalid' }); res.json(rows[0]); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/register', async (req, res) => {
  try {
    // CHECK LIMITI GUESTS
    const maxGuests = await getSetting('maxGuests');
    if (maxGuests) {
        const [count] = await pool.query('SELECT COUNT(*) as c FROM guests');
        if (count[0].c >= parseInt(maxGuests)) return res.status(403).json({ error: 'Sold Out / Lista Chiusa' });
    }

    const { firstName, lastName, email, instagram, promoterCode } = req.body;
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

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server attivo su ${PORT}`));