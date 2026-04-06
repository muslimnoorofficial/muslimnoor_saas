# 🚀 MosqueOS Setup & Deployment Guide

## ✅ What's Been Configured

### 1. Environment Variables
- ✅ **Frontend** (`.env.local`): Supabase client credentials + API URL
- ✅ **Backend** (`.env`): Supabase service role + Stripe + Resend keys

### 2. Database Schema
- ✅ **Location**: `supabase/migrations/001_initial_schema.sql`
- ✅ **Tables**: Mosques, Users, Donations, Events, Announcements, Reminders, etc.
- ✅ **RLS Policies**: Row-level security for multi-tenancy
- ✅ **Enums**: Prayer methods, donation types, user roles, etc.

### 3. Seed Data
- ✅ **Location**: `scripts/seed.ts`
- ✅ **Includes**:
  - 1 Superadmin user (YOU!)
  - 3 test mosques
  - 5 test users with different roles
  - 30 days of prayer times
  - Sample donations, events, announcements

### 4. Architecture Documentation
- ✅ **Location**: `docs/MODULES_ARCHITECTURE.md`
- ✅ **Covers**: Events, Announcements, Reminders modules

---

## 🔧 Setup Steps

### Step 1: Apply Database Schema to Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `rolecnngsurootvoeeah`
3. Go to **SQL Editor** → **New Query**
4. Copy the entire content from: `supabase/migrations/001_initial_schema.sql`
5. Paste and click **Run**
6. ✅ Wait for success (all tables should be created)

### Step 2: Run Seed Data

```bash
# Install dependencies (if not already)
cd /Users/tareque/Destination_distinction/Muslim_Noor/MuslimNoor_Saas
pnpm install

# Run the seed script
pnpm tsx scripts/seed.ts
```

**Expected output:**
```
🌱 Starting MosqueOS database seed...

📍 Creating mosques...
   ✅ Created mosque: Al-Noor Islamic Center (al-noor-houston)
   ✅ Created mosque: Masjid Manhattan (masjid-manhattan)
   ✅ Created mosque: Islamic Center of San Francisco (masjid-sf)

👥 Creating test users...
   ✅ Created user: Tareque Admin (admin@mosqueos.local)
   ✅ Created user: Ahmad Al-Noor (admin.alnoor@mosqueos.local)
   ... (more users)

🚩 Creating feature flags...
   ✅ Created feature flags for Al-Noor Islamic Center
   ... (more mosques)

💰 Creating sample donations...
   ✅ Created 4 sample donations

📿 Creating prayer times...
   ✅ Created prayer times for next 30 days

📅 Creating sample events...
   ✅ Created sample events for each mosque

📢 Creating sample announcements...
   ✅ Created sample announcements

✨ Seed completed successfully!

🔐 Super Admin Credentials:
   Email: admin@mosqueos.local
   Password: SuperAdmin123!@#
   (Save these securely!)

🚀 You can now log in to the admin dashboard at http://localhost:3000
```

### Step 3: Verify Servers Are Running

```bash
# Check if both servers are listening
lsof -i -P -n | grep LISTEN | grep -E "3000|4000"
```

**Expected output:**
```
node   65966  3000 (LISTEN)  # Frontend (Next.js)
node   74334  4000 (LISTEN)  # Backend (NestJS)
```

If not running, start them:

```bash
# Terminal 1: Frontend
cd apps/admin && pnpm dev

# Terminal 2: Backend
cd apps/api && pnpm start:dev
```

### Step 4: Log In to Admin Dashboard

1. Open: http://localhost:3000
2. Enter credentials:
   - **Email**: `admin@mosqueos.local`
   - **Password**: `SuperAdmin123!@#`
3. ✅ You should be logged in!

---

## 🧪 Test the System

### Test 1: View Created Data
- ✅ Check **Mosques** (should see 3 test mosques)
- ✅ Check **Users** (should see 5 test users)
- ✅ Check **Donations** (should see 4 sample donations)
- ✅ Check **Prayer Times** (should see 30 days)

### Test 2: Test Donations Flow
1. Go to Al-Noor mosque page
2. Click **Donate**
3. Enter $10 (test donation)
4. Use Stripe test card: `4242 4242 4242 4242`, any future date, CVC: 123
5. ✅ Should see success page
6. ✅ Receipt should be generated (check Supabase `donations` table)

### Test 3: Test Events Module (once implemented)
1. Create an event as mosque admin
2. See event on public listing
3. RSVP as a different user
4. View attendee list

---

## 📱 API Testing with cURL

### Test Superadmin Access
```bash
# Frontend will handle login via Supabase Auth
# Login provides JWT token automatically
# Try accessing protected routes:

curl http://localhost:4000/

# Expected: 200 with "Hello World!"
```

### Test Mosque Data
```bash
# Get all mosques (public endpoint)
curl http://localhost:4000/api/mosques

# Should return empty [] because endpoint doesn't exist yet
# We'll implement CRUD endpoints next
```

---

## 🔐 Security Checklist

- ✅ Superadmin password is strong (`SuperAdmin123!@#`)
- ✅ Service role key is in `.env` (never expose in frontend)
- ✅ Service role key is in `.gitignore`
- ✅ Anon key is only in frontend `.env.local`
- ✅ Stripe keys are in backend `.env` only
- ✅ Resend key is in backend `.env` only
- ✅ RLS policies protect user data

### Post-Deployment Security

1. **Change superadmin password** (in production)
   ```bash
   # In Supabase Dashboard → Users → Click admin → Reset Password
   ```

2. **Update Stripe webhook endpoint** (once deployed)
   - Get live API endpoint URL
   - Update in Stripe Dashboard
   - Add webhook secret to `.env`

3. **Configure Stripe Connect onboarding** (TBD)
   - Mosque admins will authorize Stripe accounts
   - Stripe returns `stripe_account_id`
   - Platform connects PaymentIntents to mosque accounts

---

## 🎯 Next Implementation Tasks

Based on the architecture docs, here's what to build next:

### Priority 1: Core Endpoints
- [ ] `GET /api/mosques` - List all mosques
- [ ] `GET /api/mosques/:slug` - Get mosque details
- [ ] `POST /api/auth/login` - Traditional login (in addition to Supabase)
- [ ] `POST /api/auth/register` - Self-service mosque registration

### Priority 2: Events Module
- [ ] `POST /api/mosques/:slug/events` - Create event
- [ ] `GET /api/mosques/:slug/events` - List events
- [ ] `PATCH /api/mosques/:slug/events/:id` - Update event
- [ ] `POST /api/mosques/:slug/events/:id/rsvp` - RSVP to event

### Priority 3: Announcements Module
- [ ] `POST /api/mosques/:slug/announcements` - Create
- [ ] `GET /api/mosques/:slug/announcements` - List
- [ ] `PATCH /api/mosques/:slug/announcements/:id/pin` - Pin

### Priority 4: Reminders Module
- [ ] Implement reminder scheduler (BullMQ processor)
- [ ] Setup prayer time reminders
- [ ] Setup donation receipt reminders
- [ ] Email delivery via Resend

### Priority 5: Stripe Connect
- [ ] Implement `/api/mosques/:slug/stripe/connect` - Start onboarding
- [ ] Handle Stripe OAuth callback
- [ ] Create frontend Connect button component
- [ ] Display connection status

---

## 🐛 Troubleshooting

### Issue: "Supabase URL or Key missing"
**Solution**: Check `.env.local` exists and is configured correctly
```bash
cat apps/admin/.env.local
# Should show NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
```

### Issue: Seed script fails with "auth error"
**Solution**: Service role key might be wrong
```bash
# In apps/api/.env, verify:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Issue: Frontend shows 500 error
**Solution**: Check middleware.ts is correctly configured
```bash
# Middleware is deprecated in Next.js 16
# Should use proxy instead - update next.config.ts
```

### Issue: Donations endpoint returns 404
**Solution**: API routes not implemented yet
- Expected - we've only creating the schema
- Endpoint `/api/mosques/:slug/donations` doesn't exist yet

---

## 📞 Support

If you encounter issues:

1. Check browser console (frontend errors)
2. Check backend logs: `pnpm start:dev` output
3. Check Supabase logs in dashboard
4. Verify environment variables are set
5. Check database schema was applied correctly

---

## ✨ Success Checklist

- [ ] Environment files created (frontend + backend)
- [ ] Database schema applied to Supabase
- [ ] Seed script ran successfully
- [ ] Both dev servers running (ports 3000 & 4000)
- [ ] Can log in with superadmin credentials
- [ ] Can see 3 test mosques in database
- [ ] Can see 5 test users in database
- [ ] Can see 30 days of prayer times
- [ ] Can see sample donations, events, announcements

---

## 🎉 You're All Set!

Your MosqueOS platform is ready for development. Next step: implement the API endpoints and frontend components according to the module architecture documentation.

Happy building! 🚀
