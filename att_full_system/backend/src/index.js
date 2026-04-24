require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    /\.vercel\.app$/,
    /airportstransferturkey\.com$/,
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Make prisma available to routes
app.locals.prisma = prisma;

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
});

module.exports = app;
