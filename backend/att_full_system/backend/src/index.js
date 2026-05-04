require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
// ── CORS — file:// + localhost + production ───────────────────────────────────
app.use(function(req, res, next) {
  const origin = req.headers.origin;
  // file:// sends origin=null, we allow it in dev
  if (!origin || origin === 'null') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Make prisma available to routes
app.locals.prisma = prisma;

// ── Admin Panel ───────────────────────────────────────────────────────────────
const adminPath = path.join('/app', 'admin');
console.log('Admin path:', adminPath);
app.use('/admin', express.static(adminPath));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(adminPath, 'index.html'));
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',               require('./routes/auth'));
app.use('/api/vehicles',           require('./routes/vehicles'));
app.use('/api/reservations',       require('./routes/reservations'));
app.use('/api/customers-tracking', require('./routes/tracking'));
app.use('/api/tours',              require('./routes/tours'));
app.use('/api/blog',               require('./routes/blog'));
app.use('/api/faq',                require('./routes/faq'));
app.use('/api/pages',              require('./routes/pages'));
app.use('/api/contact',            require('./routes/contact'));
app.use('/api/booking',            require('./routes/booking'));
app.use('/api/stats',              require('./routes/stats'));
app.use('/api/payment-links',      require('./routes/paymentLinks'));
app.use('/api/settings',           require('./routes/settings'));
app.use('/api/driver-applications',require('./routes/driverApplications'));
app.use('/api/drivers',            require('./routes/drivers'));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ message: 'Airports Transfer Turkey API', version: '1.0.0' });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ ATT Backend running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  // Start trip completion scheduler
  const { startScheduler } = require('./scheduler');
  startScheduler(prisma);
});

module.exports = app;
