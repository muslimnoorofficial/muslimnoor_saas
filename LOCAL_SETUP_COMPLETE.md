# 🚀 LOCAL SETUP COMPLETE & READY FOR TESTING

**Date**: April 4, 2026  
**Status**: ✅ Local Supabase database seeded and running
**Frontend**: http://localhost:3000  
**Backend**: http://localhost:4000  
**Supabase Studio**: http://127.0.0.1:54323  

---

## 📍 PORT REFERENCE (CLEAR EXPLANATION)

| Port | Service | Purpose | Connection |
|------|---------|---------|-----------|
| **54321** | Supabase API (REST/GraphQL) | Frontend & Backend call this | http://127.0.0.1:54321 |
| **54322** | PostgreSQL Database | pgAdmin connects to this | postgresql://postgres:postgres@127.0.0.1:54322 |
| **54323** | Supabase Studio | Browse DB with web UI | http://127.0.0.1:54323 |
| **54324** | Mailpit (Email testing) | See transactional emails | http://127.0.0.1:54324 |
| **3000** | Next.js Frontend | Your dashboard app | http://localhost:3000 |
| **4000** | NestJS Backend | API server | http://localhost:4000 |

**Why the confusion?** 
- `.env` files use **54321** (API layer) ✅
- pgAdmin uses **54322** (direct DB) ✅
- Both are correct!

---

## 🔐 LOGIN CREDENTIALS (LOCALLY SEEDED)

### Super Admin
```
Email:    admin@mosqueos.local
Password: SuperAdmin123!@#
Mosque:   All (platform-wide access)
```

### Mosque Admins
```
Email:    admin.manhattan@mosqueos.local
Password: MosqueAdmin123!@#
Mosque:   Masjid Manhattan (New York)
---
Email:    admin.alnoor@mosqueos.local
Password: MosqueAdmin123!@#
Mosque:   Al-Noor Islamic Center (Houston)
```

### Regular Members
```
Email:    member@alnoor.local
Password: Member123!@#

Email:    donor@alnoor.local
Password: Donor123!@#
```

---

## 📊 DATABASE STATUS

### ✅ Seeded Data (in local DB)

| Table | Records | Status |
|-------|---------|--------|
| **mosques** | 3 | ✅ Al-Noor, Manhattan, San Francisco |
| **users** | 5 | ✅ Admin + 4 test users |
| **donations** | 4 | ✅ Sample donations ($50-200) |
| **feature_flags** | 15 | ✅ All features enabled |
| **events** | 3 | ✅ Sample events |
| **announcements** | 3 | ✅ Sample announcements |
| **prayer_times** | 90 | ✅ 30-day schedule |

### How to Check Data

**Option 1: Supabase Studio (Web UI)**
```
URL: http://127.0.0.1:54323
No login needed - browse all tables visually
```

**Option 2: pgAdmin (Direct DB)**
```
URL: http://127.0.0.1:5050 (if running)
OR use any PostgreSQL client:
  Host: 127.0.0.1
  Port: 54322
  User: postgres
  Pass: postgres
  DB:   postgres
```

**Option 3: Terminal (psql)**
```bash
psql postgres://postgres:postgres@127.0.0.1:54322/postgres

# Then run:
\dt                    # List all tables
SELECT COUNT(*) FROM users;        # Count users
SELECT * FROM donations;           # View donations
```

---

## 🛠️ QUICK START (What You Need to Know)

### 1. **Supabase Local is REQUIRED**
```bash
# If not running, start it in project root:
cd /Users/tareque/Destination_distinction/Muslim_Noor/MuslimNoor_Saas
npx supabase start

# To stop:
npx supabase stop

# To check status:
npx supabase status
```

### 2. **Frontend runs on port 3000**
```bash
cd apps/admin
pnpm dev
# Redirects to /login automatically
```

### 3. **Backend runs on port 4000**
```bash
cd apps/api
pnpm start:dev
```

### 4. **Environment config is correct**
- Frontend: `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321` ✅
- Backend: `SUPABASE_URL=http://127.0.0.1:54321` ✅
- API client injects JWT + mosque slug automatically ✅

---

## 🧪 TEST STRIPE DONATION (HIGHEST PRIORITY)

### Step 1: Ensure All Running
```
✅ Supabase: http://127.0.0.1:54323 (running)
✅ Backend:  curl http://localhost:4000 (should return "Hello World!")
✅ Frontend: http://localhost:3000/login (should load)
```

### Step 2: Login to Dashboard
1. Go to **http://localhost:3000/login**
2. Login with: `admin.manhattan@mosqueos.local` / `MosqueAdmin123!@#`
3. You'll be redirected to dashboard

### Step 3: Navigate to Donations Page
- Dashboard sidebar → **Donations** (or direct URL: http://localhost:3000/dashboard/donations)

### Step 4: Fill & Submit $1 Test Donation
```
Name:    Test Donor
Email:   test@example.com  (use REAL email for Stripe webhook)
Amount:  $1.00             (minimum test amount)
Purpose: General
Button:  [Donate $1.00]
```

### Step 5: Check Stripe Dashboard
1. Login to https://dashboard.stripe.com (your account)
2. Go to **Payments** → Recent transactions
3. Look for $1.00 USD payment with status "Succeeded"
4. If it appears = ✅ WORKING!

### What to Expect
- ✅ Form submits (no 404 errors)
- ✅ Backend receives donation
- ✅ Stripe creates PaymentIntent
- ✅ Dashboard transaction appears
- ✅ Toast shows "Payment intent created"

### If Errors, Check:
1. **Frontend console** (F12 → Console tab):
   - Should show `[Donation] Submitting donation: ...`
   - Should show `[Donation] Payment intent created: ...`
   - Any red errors = backend connectivity issue

2. **Backend logs**:
   - Terminal running `pnpm start:dev` should show request
   - Check for CORS errors

3. **Network tab** (F12 → Network):
   - POST request to `/api/mosques/:slug/donations/create-intent`
   - Status should be 2xx (not 404 or 500)

---

## 🎨 TEMPLATE DESIGN PATTERNS (From `/templates` folder)

### Dark Mode Theme
```javascript
{
  bg: "#07090F",           // Deep navy background
  panel: "#0D1220",        // Slightly lighter panels
  card: "#111827",         // Individual cards
  border: "#1C2A42",       // Subtle borders
  text: "#EDF2FF",         // Light text
  accent: "#00D4FF",       // Cyan accent
  green: "#00E5A0",        // Success green
  red: "#FF4060",          // Error red
}
```

### Light Mode Theme
```javascript
{
  bg: "#EDF1FA",           // Soft light background
  panel: "#FFFFFF",        // White panels
  card: "#FFFFFF",         // White cards
  border: "#D8E3F2",       // Subtle gray border
  text: "#0B1628",         // Dark text
  accent: "#006EFF",       // Blue accent
  green: "#00A86B",        // Success green
  red: "#E5334A",          // Error red
}
```

### Components to Review
- **OverviewTab.tsx** - Main dashboard grid + charts
- **StatCard.tsx** - KPI cards with live indicators
- **ui.tsx** - Reusable UI components (buttons, inputs, etc.)
- **Tabs system** - 9 different dashboard tabs showing different metrics

### How to Apply to Muslim Noor
1. ✅ Use template's dark/light theme structure
2. ✅ Apply Islamic color accents (gold #C8973A, teal, green)
3. ✅ Adapt StatCard pattern for mosque KPIs
4. ✅ Use chart components from templates
5. ✅ Apply momentum animations

---

## 📝 NEXT STEPS

### IMMEDIATE (Today)
- [ ] Test Stripe donation flow (highest priority)
- [ ] Check console logs for any API errors
- [ ] Fix any fetch/connectivity issues from log output

### SHORT TERM (This Week)
- [ ] Apply universal design pattern to all components
  - Cream base (#FAF7F2) + dark overlays
  - Gold accents (#C8973A) with pulsing borders
  - Islamic icons + crescent dividers
  - Animation: fade + slideY (700ms)
- [ ] Complete the dashboard tabs (donations, members, events)
- [ ] Add Stripe redirect after payment (currently just shows message)

### MEDIUM TERM
- [ ] Fix any remaining API/CORS issues
- [ ] Complete auth flow (register, password reset)
- [ ] Add real data fetching (uncomment API calls in hooks)
- [ ] Deploy to production (Vercel + Railway + Supabase cloud)

---

## 🚨 COMMON ISSUES & FIXES

### "Supabase is paused"
**Problem**: Cloud Supabase server is paused  
**Solution**: Resume project in Supabase dashboard OR use local (which we are!)

### "Cannot connect to port 54321"
**Problem**: Supabase not running locally  
**Solution**: Run `npx supabase start` and wait 10-15 seconds for startup

### "CORS error when fetching donations"
**Problem**: Frontend can't reach backend  
**Solution**: Check `NEXT_PUBLIC_API_URL=http://localhost:4000` in .env.local

### "Login not working"
**Problem**: Seeded users not in database  
**Solution**: Run seed script: `SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed.ts`

### "Stripe transaction not appearing"
**Problem**: Webhook not configured or incorrect key  
**Solution**: Use test key (starts with `sk_test_`), not live key

---

## 📞 GET HELP

All infrastructure is local now. No cloud dependency except Stripe.

**What's working** ✅:
- Local database with seed data
- Frontend redirects to login
- Backend running and accessible
- Supabase auth working

**What needs testing** 🧪:
- Stripe donation flow
- Frontend fetch calls to backend
- API response formatting

**Start with**: Go test the Stripe donation right now! Console logs will tell you exactly where any issues are.

---

**Ready?** → http://localhost:3000/login 🚀
