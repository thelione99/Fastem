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

// --- SICUREZZA ---
app.use(cors());
app.use(express.json({ limit: '10kb' })); 
app.disable('x-powered-by'); 

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// --- RATE LIMITING ---
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; 
const MAX_REQUESTS = 100; 

const rateLimit = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const record = requestCounts.get(ip) || { count: 0, startTime: now };

    if (now - record.startTime > RATE_LIMIT_WINDOW) {
        record.count = 1;
        record.startTime = now;
    } else {
        record.count++;
    }
    requestCounts.set(ip, record);

    if (record.count > MAX_REQUESTS) {
        return res.status(429).json({ error: 'Troppe richieste. Riprova tra 15 minuti.' });
    }
    next();
};

app.use('/api/register', rateLimit);
app.use('/api/promoter/login', rateLimit);

// --- DATABASE POOL ---
const pool = mysql.createPool({ 
    uri: process.env.DATABASE_URL, 
    waitForConnections: true, 
    connectionLimit: 50, 
    queueLimit: 0,
    charset: 'utf8mb4',
    timezone: 'Z',
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// --- UTILS ---
const sanitize = (str) => str ? String(str).trim().replace(/[<>]/g, "") : ''; 

const checkAuth = (req, res, next) => {
    const clientPassword = req.headers['x-admin-password'];
    if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: 'Server Config Error' });
    if (clientPassword !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
    next();
};

const getSetting = async (key) => {
    try {
        const [rows] = await pool.query('SELECT value FROM settings WHERE key_name = ?', [key]);
        return rows.length > 0 ? rows[0].value : null;
    } catch { return null; }
};

// --- ROUTES ---

// 1. Settings
app.get('/api/settings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT key_name, value FROM settings');
    const settings = rows.reduce((acc, row) => ({ ...acc, [row.key_name]: row.value }), {});
    res.json(settings);
  } catch (e) { res.status(500).json({ error: "Errore DB Settings" }); }
});

app.post('/api/admin/settings', checkAuth, async (req, res) => {
  const settings = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const [key, value] of Object.entries(settings)) {
      await connection.execute(
        'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?', 
        [key, value, value]
      );
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

// 2. Guests - MODIFICATO PER STATS GLOBALI
app.get('/api/guests', checkAuth, async (req, res) => {
  try { 
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 24;
      const offset = (page - 1) * limit;
      const search = req.query.search ? `%${req.query.search}%` : '%';
      const status = req.query.status && req.query.status !== 'ALL' ? req.query.status : null;

      // 1. Query per i Dati Filtrati (Lista utenti)
      let queryData = `SELECT * FROM guests WHERE (firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR invitedBy LIKE ?)`;
      const paramsData = [search, search, search, search];

      if (status) {
          queryData += ` AND status = ?`;
          paramsData.push(status);
      }

      // Count filtrato per paginazione
      const [countResult] = await pool.query(queryData.replace('SELECT *', 'SELECT COUNT(*) as total'), paramsData);
      const totalFiltered = countResult[0].total;

      // Fetch dati paginati
      queryData += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
      paramsData.push(limit, offset);
      const [rows] = await pool.query(queryData, paramsData);

      // 2. Query per le Statistiche Globali (Indipendenti dai filtri)
      // Calcoliamo i totali reali del database per le card in alto
      const [statsResult] = await pool.query(`
          SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN isUsed = 1 THEN 1 ELSE 0 END) as used
          FROM guests
      `);
      
      const stats = statsResult[0];

      res.json({ 
          data: rows, 
          pagination: { 
              total: totalFiltered, 
              page, 
              limit, 
              totalPages: Math.ceil(totalFiltered / limit) 
          },
          stats: {
              total: stats.total || 0,
              pending: stats.pending || 0,
              approved: stats.approved || 0,
              used: stats.used || 0
          }
      }); 
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. Registrazione
app.post('/api/register', async (req, res) => {
  try {
    const maxGuests = await getSetting('maxGuests');
    if (maxGuests) {
        const [count] = await pool.query('SELECT COUNT(*) as c FROM guests WHERE status != "REJECTED"');
        if (count[0].c >= parseInt(maxGuests)) return res.status(403).json({ error: 'Lista Chiusa (Sold Out)' });
    }

    let { firstName, lastName, email, instagram, promoterCode } = req.body;
    firstName = sanitize(firstName);
    lastName = sanitize(lastName);
    email = sanitize(email).toLowerCase();
    instagram = sanitize(instagram);
    promoterCode = sanitize(promoterCode).toUpperCase();

    if (!firstName || !lastName || !email) return res.status(400).json({ error: 'Dati incompleti' });
    
    const [existing] = await pool.query('SELECT id FROM guests WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email già registrata' });

    const id = randomUUID();
    let validCode = null;

    if (promoterCode) {
      const [prs] = await pool.execute('SELECT code FROM promoters WHERE code = ?', [promoterCode]);
      if (prs.length > 0) validCode = prs[0].code;
    }

    await pool.execute(
        'INSERT INTO guests (id, firstName, lastName, email, instagram, status, isUsed, createdAt, invitedBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [id, firstName, lastName, email, instagram, 'PENDING', false, Date.now(), validCode]
    );
    res.json({ success: true, id });
  } catch (e) { res.status(500).json({ error: "Errore Server" }); }
});

// 4. Approvazione
app.post('/api/approve', checkAuth, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.body;
    
    const [rows] = await connection.query('SELECT status, invitedBy, email, firstName FROM guests WHERE id = ? FOR UPDATE', [id]);
    if (rows.length === 0) { await connection.rollback(); return res.status(404).json({ error: 'Ospite non trovato' }); }
    const guest = rows[0];

    if (guest.status !== 'APPROVED') {
        await connection.execute('UPDATE guests SET status = ?, qrCode = ? WHERE id = ?', ['APPROVED', id, id]);
        if (guest.invitedBy) {
            await connection.execute('UPDATE promoters SET invites_count = invites_count + 1 WHERE code = ?', [guest.invitedBy]);
        }
    }
    await connection.commit();

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 5) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        resend.emails.send({ 
            from: 'RUSSOLOCO <onboarding@resend.dev>', 
            to: [guest.email], 
            subject: 'SEI DENTRO | RUSSOLOCO', 
            html: `<div style="text-align:center;"><h1>RUSSOLOCO</h1><p>Ciao ${guest.firstName}, sei dentro.</p><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${id}" /></div>` 
        }).catch(err => console.error("Mail error:", err));
    }
    res.json({ success: true });
  } catch (e) { await connection.rollback(); res.status(500).json({ error: e.message }); } finally { connection.release(); }
});

// 5. Gestione Guest
app.post('/api/reject', checkAuth, async (req, res) => {
  try { await pool.execute('UPDATE guests SET status = ? WHERE id = ?', ['REJECTED', req.body.id]); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/update-guest', checkAuth, async (req, res) => {
    try {
        let { id, firstName, lastName, email, instagram } = req.body;
        await pool.execute('UPDATE guests SET firstName = ?, lastName = ?, email = ?, instagram = ? WHERE id = ?', [sanitize(firstName), sanitize(lastName), sanitize(email), sanitize(instagram), id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

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

app.post('/api/manual-checkin', checkAuth, async (req, res) => {
    try {
        await pool.execute('UPDATE guests SET isUsed = true, usedAt = ? WHERE id = ?', [Date.now(), req.body.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/resend-qr', checkAuth, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM guests WHERE id = ?', [req.body.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        
        if (process.env.RESEND_API_KEY) {
            const resend = new Resend(process.env.RESEND_API_KEY);
            await resend.emails.send({ 
                from: 'RUSSOLOCO <onboarding@resend.dev>', 
                to: [rows[0].email], 
                subject: 'IL TUO QR CODE | RUSSOLOCO', 
                html: `<div style="text-align:center;"><h1>RUSSOLOCO</h1><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${req.body.id}" /></div>` 
            });
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. Scanner
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
    try { await pool.execute('DELETE FROM guests'); res.json({ success: true }); } catch (e) { res.status(500).json({ error: e.message }); } 
});

// 7. Promoters
app.get('/api/admin/promoters', checkAuth, async (req, res) => {
  try { const [rows] = await pool.query('SELECT * FROM promoters ORDER BY invites_count DESC'); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/create-promoter', checkAuth, async (req, res) => {
   const maxPromoters = await getSetting('maxPromoters');
   if (maxPromoters) {
       const [count] = await pool.query('SELECT COUNT(*) as c FROM promoters');
       if (count[0].c >= parseInt(maxPromoters)) return res.status(403).json({ error: 'Limite raggiunto' });
   }
   
   let { firstName, lastName, code, password, rewardsConfig } = req.body;
   code = sanitize(code).toUpperCase();

   try {
     await pool.execute(
        'INSERT INTO promoters (id, firstName, lastName, code, password, rewards_config, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [randomUUID(), sanitize(firstName), sanitize(lastName), code, password, JSON.stringify(rewardsConfig), Date.now()]
     );
     res.json({ success: true });
   } catch (e) { 
       if(e.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Codice esistente' });
       res.status(500).json({ error: e.message }); 
   }
});

app.post('/api/admin/update-promoter', checkAuth, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        let { id, firstName, lastName, code, password, rewardsConfig } = req.body;
        code = sanitize(code).toUpperCase();

        // Check duplicati codice escludendo se stesso
        const [existing] = await connection.query('SELECT id FROM promoters WHERE code = ? AND id != ?', [code, id]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Codice già in uso' });
        }
        
        // Recupera il vecchio codice per aggiornare eventuali guest
        const [oldPromoter] = await connection.query('SELECT code FROM promoters WHERE id = ?', [id]);
        const oldCode = oldPromoter[0]?.code;

        await connection.execute(
            'UPDATE promoters SET firstName = ?, lastName = ?, code = ?, password = ?, rewards_config = ? WHERE id = ?',
            [sanitize(firstName), sanitize(lastName), code, password, JSON.stringify(rewardsConfig), id]
        );

        // Se il codice è cambiato, aggiorna gli invitati esistenti
        if (oldCode && oldCode !== code) {
            await connection.execute('UPDATE guests SET invitedBy = ? WHERE invitedBy = ?', [code, oldCode]);
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

app.post('/api/admin/delete-promoter', checkAuth, async (req, res) => {
    try {
        await pool.execute('DELETE FROM promoters WHERE id = ?', [req.body.id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/promoter/login', async (req, res) => {
  try { 
      const [rows] = await pool.query('SELECT * FROM promoters WHERE code = ? AND password = ?', [sanitize(req.body.code).toUpperCase(), req.body.password]); 
      if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' }); 
      res.json(rows[0]); 
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on ${PORT}`));