# Airports Transfer Turkey — Backend & Admin Panel Setup Guide

## 📁 Folder Structure

```
backend/                  ← Node.js + Express API
  src/
    index.js              ← Main entry point
    middleware/auth.js    ← JWT middleware
    routes/
      auth.js             ← POST /api/auth/login
      vehicles.js         ← GET/POST/PUT/DELETE /api/vehicles
      reservations.js     ← GET/PUT/DELETE /api/reservations
      booking.js          ← POST /api/booking  (from frontend)
      tracking.js         ← POST/GET /api/customers-tracking
      tours.js            ← CRUD /api/tours
      blog.js             ← CRUD /api/blog
      faq.js              ← CRUD /api/faq
      pages.js            ← CRUD /api/pages
      contact.js          ← POST/GET /api/contact
      stats.js            ← GET /api/stats
  prisma/
    schema.prisma         ← Database schema
    seed.js               ← Initial data (admin user + vehicles)
  .env.example            ← Environment variables template
  package.json

home/admin/index.html     ← Admin Panel (single HTML file)
```

---

## 🗄️ STEP 1: Database Setup

### Option A: Railway (Recommended — Free tier available)
1. Go to https://railway.app → New Project → Add PostgreSQL
2. Click on PostgreSQL → Variables tab → copy `DATABASE_URL`

### Option B: Supabase
1. Go to https://supabase.com → New Project
2. Settings → Database → Connection String → copy URI

### Option C: Neon (Free serverless PostgreSQL)
1. Go to https://neon.tech → New Project
2. Copy the connection string

---

## ⚙️ STEP 2: Backend Setup

```bash
# 1. Go to backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit .env and fill in your DATABASE_URL and JWT_SECRET

# 4. Generate Prisma client
npx prisma generate

# 5. Run database migrations (creates all tables)
npx prisma migrate dev --name init

# 6. Seed initial data (admin user + default vehicles)
node prisma/seed.js

# 7. Start the server
npm start
# or for development:
npm run dev
```

### ✅ Your .env file should look like:
```
DATABASE_URL="postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway"
JWT_SECRET="att-super-secret-jwt-key-2026-change-this-to-something-random"
PORT=3001
FRONTEND_URL="https://airportstransferturkey.com"
NODE_ENV="production"
```

---

## 🚀 STEP 3: Deploy Backend

### Deploy to Railway:
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Connect your GitHub repo (push the `backend/` folder as a repo)
3. Railway will auto-detect Node.js
4. Add environment variables in Railway dashboard
5. Your API will be at: `https://your-app.up.railway.app`

### Deploy to Render:
1. Go to https://render.com → New → Web Service
2. Connect GitHub repo
3. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
4. Start command: `npm start`
5. Add environment variables

---

## 🔧 STEP 4: Connect Admin Panel to Backend

Open `home/admin/index.html` and find this line near the top of the `<script>` tag:

```javascript
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : 'https://YOUR-BACKEND.railway.app'; // ← change this
```

Replace `https://YOUR-BACKEND.railway.app` with your actual Railway/Render URL.

---

## 🌐 STEP 5: Connect Frontend Website to Backend

In `home/results.html`, find:
```javascript
var BOOKING_API_URL = '/api/booking';
```
Change to:
```javascript
var BOOKING_API_URL = 'https://YOUR-BACKEND.railway.app/api/booking';
```

In `home/contact.html`, find:
```javascript
var CONTACT_API_URL = '/api/contact';
```
Change to:
```javascript
var CONTACT_API_URL = 'https://YOUR-BACKEND.railway.app/api/contact';
```

---

## 📡 STEP 6: User Tracking (Optional but recommended)

Add this to `home/index.html` before `</body>` to track visitors:

```html
<script>
(function() {
  var API = 'https://YOUR-BACKEND.railway.app';
  var sid = localStorage.getItem('att_session');
  if (!sid) { sid = 'sess-' + Math.random().toString(36).substr(2,12) + '-' + Date.now(); localStorage.setItem('att_session', sid); }
  fetch(API + '/api/customers-tracking', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sid, current_step: 'homepage', last_action: 'Visited homepage' })
  }).catch(function(){});
})();
</script>
```

Add similar snippets to `results.html` with `current_step: 'vehicle_selected'` and in the booking modal with `current_step: 'form_filled'`.

---

## 🔑 Admin Panel Login

- **URL:** `https://your-site.com/admin/`
- **Email:** `bekpenturizm@gmail.com`
- **Password:** `.241176.`

---

## ⚠️ Common Errors & Fixes

### ❌ "Cannot connect to database"
- Check `DATABASE_URL` in `.env` is correct
- Make sure PostgreSQL service is running
- Run `npx prisma migrate deploy` again

### ❌ "CORS error" in browser
- Add your frontend domain to `FRONTEND_URL` in `.env`
- The backend CORS config already allows `*.vercel.app` and `airportstransferturkey.com`

### ❌ "Invalid token" in admin panel
- Token expired — just log in again
- Make sure `JWT_SECRET` is set in `.env`

### ❌ "Prisma Client not found"
- Run `npx prisma generate` again
- Make sure `DATABASE_URL` is set before running generate

### ❌ Admin panel shows "Could not load" errors
- Check the `API_URL` in `admin/index.html` is correct
- Make sure backend is running and accessible
- Check browser console for the exact error

---

## 🔒 Security Notes

1. **Change JWT_SECRET** to a long random string before production
2. **Admin panel** is protected by JWT — no one can access data without logging in
3. **CORS** is configured to only allow your domains
4. All admin API routes require a valid Bearer token

---

## 📊 API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | ❌ | Admin login |
| GET | /api/auth/me | ✅ | Current user |
| GET | /api/vehicles | ❌ | List vehicles (public) |
| POST | /api/vehicles | ✅ | Add vehicle |
| PUT | /api/vehicles/:id | ✅ | Update vehicle |
| DELETE | /api/vehicles/:id | ✅ | Delete vehicle |
| POST | /api/booking | ❌ | Submit booking (public) |
| GET | /api/reservations | ✅ | List reservations |
| PUT | /api/reservations/:id/status | ✅ | Update status |
| POST | /api/customers-tracking | ❌ | Track user step (public) |
| GET | /api/customers-tracking | ✅ | View tracking data |
| GET/POST/PUT/DELETE | /api/tours | Mixed | Tour management |
| GET/POST/PUT/DELETE | /api/blog | Mixed | Blog management |
| GET/POST/PUT/DELETE | /api/faq | Mixed | FAQ management |
| GET/PUT | /api/pages | Mixed | Page content |
| POST | /api/contact | ❌ | Contact form (public) |
| GET | /api/contact | ✅ | View messages |
| GET | /api/stats | ✅ | Dashboard stats |
