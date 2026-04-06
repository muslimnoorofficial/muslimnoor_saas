# MosqueOS Backend Implementation Checklist

> Last Updated: March 15, 2026
> Focus: Mobile app donations → Postman testing

---

## 📋 PHASE 1: CORE INFRASTRUCTURE

### ✅ Database & Security
- [x] Database schema (13 tables + RLS policies)
- [x] Supabase integration
- [x] Auth/JWT guard
- [x] Roles guard (stub)
- [x] Tenant guard
- [x] Feature flag guard
- [x] Decorators (CurrentTenant, CurrentUser, Roles, Public)
- [x] Middleware setup

### ✅ Stripe Integration
- [x] Stripe SDK initialization
- [x] Stripe service (connect, account status)
- [x] Payment Intent creation
- [x] Subscription creation
- [x] Webhook handlers (5 events)
- [ ] Stripe Connect OAuth flow (for mosque onboarding)
- [ ] Stripe account status polling
- [ ] Application fees configuration

---

## ✅ PHASE 2: DONATIONS (85% COMPLETE)

The core donation system with Stripe integration.

### ✅ Core Implementation
- [x] Donations module structure
- [x] Backend donation creation endpoint
- [x] Payment Intent creation
- [x] Subscription creation
- [x] Webhook integration (5 events)
- [x] Receipt generation (PDF via pdfkit)
- [x] Receipt delivery (Resend email)
- [x] **Mobile app DTO specification** (POST `/donations/create-intent`)
- [x] **Postman test collection** (all 9 endpoints + error cases)
- [x] **Test fixtures & example data** (11 test scenarios)
- [x] **Testing guide documentation** (complete how-to)

### 📝 Files Created:
1. **DTO Spec**: `/apps/api/src/modules/donations/dto/create-donation-from-mobile.dto.ts`
   - `CreateDonationIntentDto` - Request structure
   - `DonationIntentResponseDto` - Response with client_secret
   - `ConfirmDonationDto` - Payment confirmation
   - `DonationHistoryDto` - History display

2. **Postman Collection**: `/postman/MosqueOS.postman_collection.json`
   - 6 donation endpoints with examples
   - All error cases covered
   - Pre-configured test assertions
   - Environment variables setup

3. **Test Fixtures**: `/test/fixtures/donation-test-data.json`
   - 11 test scenarios (small/large/monthly/anonymous/errors)
   - 3 test mosques with Stripe accounts
   - Stripe test cards (visa, mastercard, decline scenarios)
   - Expected responses for each scenario

4. **Testing Guide**: `/DONATIONS_TESTING_GUIDE.md`
   - Step-by-step instructions (9 tests total)
   - Expected responses & validation rules
   - Troubleshooting guide
   - Testing checklist

### ⏭️ Next Steps:
- [ ] Deploy database schema to Supabase
- [ ] Run seed script (creates superadmin + test mosques)
- [ ] Test all 9 scenarios in Postman on localhost:4000
- [ ] Configure Stripe webhooks (ngrok for local dev)
- [ ] Test receipt generation end-to-end

### 📋 Immediate Testing:
1. Import Postman collection
2. Run health check (verify API running)
3. Test create donation endpoints (all scenarios)
4. Test validation errors (all error cases)
5. Test admin endpoints (list + summary)

---

## 📅 PHASE 3: CALENDAR & PRAYER TIMES

### [ ] Events Module
- [ ] Events CRUD endpoints (POST, GET, PATCH, DELETE)
- [ ] Event RSVP endpoint
- [ ] Event attendee list endpoint
- [ ] Event list with filters (category, date range)
- [ ] Event detail endpoint
- [ ] iCal export endpoint
- [ ] Event notifications
- [ ] Frontend Event pages (list, detail, create)

### [ ] Announcements Module
- [ ] Announcements CRUD endpoints
- [ ] Announcement publish/unpublish
- [ ] Announcement pin toggle
- [ ] Announcement expiration logic
- [ ] Announcement list with pagination
- [ ] Frontend Announcement pages

### [ ] Prayer Times Module
- [ ] Prayer times endpoints (GET)
- [ ] Prayer times calculation
- [ ] Prayer times caching
- [ ] Jamaat times management
- [ ] Frontend Prayer Times display

---

## 🔔 PHASE 4: NOTIFICATIONS & REMINDERS

### [ ] Reminders Scheduler
- [ ] BullMQ processor setup
- [ ] Reminder job creation
- [ ] Prayer time reminders
- [ ] Event reminders
- [ ] Donation receipt reminders
- [ ] Announcement broadcast reminders
- [ ] User notification preferences
- [ ] Email delivery via Resend
- [ ] In-app notification creation
- [ ] Push notifications (future)

### [ ] Notification Endpoints
- [ ] GET /api/notifications (user's notifications)
- [ ] GET /api/notifications/settings (preferences)
- [ ] PATCH /api/notifications/settings (update preferences)
- [ ] POST /api/notifications/:id/read (mark as read)
- [ ] DELETE /api/notifications/:id

---

## 👥 PHASE 5: AUTHENTICATION & USERS

### [ ] Auth Endpoints
- [ ] POST /api/auth/login (traditional email/password)
- [ ] POST /api/auth/register (self-service signup)
- [ ] POST /api/auth/refresh (token refresh)
- [ ] POST /api/auth/logout
- [ ] POST /api/auth/forgot-password
- [ ] POST /api/auth/reset-password
- [ ] POST /api/auth/verify-email

### [ ] User Management (Admin)
- [ ] GET /api/admin/users (list all users)
- [ ] GET /api/admin/users/:id (user details)
- [ ] PATCH /api/admin/users/:id (update user)
- [ ] DELETE /api/admin/users/:id (delete user)
- [ ] PATCH /api/admin/users/:id/role (change role)

### [ ] User Profile
- [ ] GET /api/users/profile (authenticated user)
- [ ] PATCH /api/users/profile (update profile)
- [ ] GET /api/users/stats (user statistics)
- [ ] DELETE /api/users/data (clear user data)

---

## 🛍️ PHASE 6: QURAN & CONTENT

### [ ] Quran Endpoints
- [ ] GET /api/quran/surahs (list all surahs)
- [ ] GET /api/quran/surahs/:id (surah details with ayahs)
- [ ] GET /api/quran/ayah-of-day
- [ ] GET /api/quran/search (search surahs)
- [ ] GET /api/quran/quick-surahs (common reads)

### [ ] Favorites Endpoints
- [ ] POST /api/favorites/ayahs (bookmark ayah)
- [ ] DELETE /api/favorites/ayahs/:id (unbookmark)
- [ ] GET /api/favorites/ayahs (list bookmarks)
- [ ] POST /api/favorites/stories
- [ ] DELETE /api/favorites/stories/:id
- [ ] GET /api/favorites/stories
- [ ] POST /api/favorites/duas
- [ ] DELETE /api/favorites/duas/:id
- [ ] GET /api/favorites/duas

### [ ] Stories Endpoints
- [ ] GET /api/stories (list all)
- [ ] GET /api/stories/:id (story details)
- [ ] GET /api/stories/daily (story of the day)

### [ ] Duas Endpoints
- [ ] GET /api/duas (list all)
- [ ] GET /api/duas/:id (dua details)
- [ ] GET /api/duas/categories (dua categories)
- [ ] GET /api/duas/daily (dua of the day)

---

## 📿 PHASE 7: SALAT & PRAYER

### [ ] Salat Tracker
- [ ] POST /api/salat/toggle (mark prayer done)
- [ ] GET /api/salat/today (today's prayers)
- [ ] GET /api/salat/history (weekly/monthly)
- [ ] GET /api/prayer-times (prayer times for location)

### [ ] Qibla Direction
- [ ] GET /api/qibla/direction (calculate direction)
- [ ] GET /api/qibla/calibration (compass calibration data)

### [ ] Jamaat Times
- [ ] GET /api/jamaat/today (today's jamaat times)
- [ ] GET /api/jamaat/next-10-days (upcoming schedule)

---

## 🌙 PHASE 8: RAMADAN

### [ ] Ramadan Module
- [ ] GET /api/ramadan/schedule (full 30-day schedule)
- [ ] GET /api/ramadan/today (today's times)
- [ ] GET /api/ramadan/next-event (countdown to next prayer/iftar/suhoor)

---

## 🎯 PHASE 9: QUIZZES & GAMIFICATION

### [ ] Quiz Module
- [ ] GET /api/quiz/daily (daily quiz availability)
- [ ] GET /api/quiz/questions/:id (quiz questions with randomized options)
- [ ] POST /api/quiz/submit (submit answers)
- [ ] GET /api/quiz/results/:id (quiz results)
- [ ] GET /api/quiz/stats (user quiz statistics)
- [ ] GET /api/quiz/leaderboard (top quiz scorers)

---

## 🏢 PHASE 10: SERVICES & ADMIN

### [ ] Services Module
- [ ] GET /api/services (list all services)
- [ ] GET /api/services/:id (service details)
- [ ] POST /api/services/:id/apply (apply for service)
- [ ] GET /api/services/:id/applications (admin view)

### [ ] Admin Dashboard
- [ ] GET /api/admin/analytics (app usage stats)
- [ ] GET /api/admin/donations/stats (donation metrics)
- [ ] GET /api/admin/events (events management)
- [ ] POST /api/admin/events (create event)
- [ ] PATCH /api/admin/events/:id (update event)
- [ ] DELETE /api/admin/events/:id (delete event)
- [ ] GET /api/admin/announcements
- [ ] POST /api/admin/announcements
- [ ] PATCH /api/admin/announcements/:id
- [ ] DELETE /api/admin/announcements/:id
- [ ] GET /api/admin/mosques
- [ ] PATCH /api/admin/mosques/:id

---

## 👑 PHASE 11: STRIPE CONNECT (Mosque Onboarding)

### [ ] Stripe Connect OAuth
- [ ] GET /api/mosques/:slug/stripe/connect-url (initiate onboarding)
- [ ] POST /api/mosques/:slug/stripe/connect/callback (handle redirect)
- [ ] GET /api/mosques/:slug/stripe/status (get account status)
- [ ] PATCH /api/mosques/:slug/stripe/disconnect (revoke access)

### [ ] Frontend Stripe Connect Page
- [ ] Connect button component
- [ ] Connection status display
- [ ] OAuth redirect handling

---

## 🏗️ PHASE 12: INFRASTRUCTURE & TESTING

### [ ] Testing & Documentation
- [ ] Postman collection (all endpoints)
- [ ] Test data fixtures
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Integration tests
- [ ] Unit tests for critical services

### [ ] Deployment
- [ ] GitHub Actions CI/CD
- [ ] Docker setup
- [ ] Environment configurations (dev/staging/prod)
- [ ] Database backups
- [ ] Monitoring & logging

---

## 📊 Current Status Summary

| Phase | Status | % Complete |
|-------|--------|-----------|
| **Phase 1: Core Infrastructure** | ✅ Done | 100% |
| **Phase 2: Donations** | 🟡 In Progress | 60% |
| **Phase 3: Calendar & Prayer** | ⚪ Not Started | 0% |
| **Phase 4: Notifications** | ⚪ Not Started | 0% |
| **Phase 5: Authentication** | ⚪ Not Started | 0% |
| **Phase 6: Quran** | ⚪ Not Started | 0% |
| **Phase 7: Salat & Prayer** | ⚪ Not Started | 0% |
| **Phase 8: Ramadan** | ⚪ Not Started | 0% |
| **Phase 9: Quizzes** | ⚪ Not Started | 0% |
| **Phase 10: Services** | ⚪ Not Started | 0% |
| **Phase 11: Stripe Connect** | ⚪ Not Started | 0% |
| **Phase 12: Testing** | ⚪ Not Started | 0% |

---

## 🎯 NEXT IMMEDIATE ACTIONS

### 1️⃣ Donations - Define Mobile App DTO
```bash
# What should mobile app send?
POST /api/donations/create-intent

{
  amount: 1000,                    // $10 in cents
  donation_type: 'one_time',
  purpose: 'general',
  donor_name: 'John Doe',
  donor_email: 'john@example.com',
  mosque_slug: 'al-noor-houston',  // or mosque_id
}
```

### 2️⃣ Create Postman Collection
- Import into Postman
- Set test variables
- Test all endpoints locally

### 3️⃣ Test Donations End-to-End
- Create donation via mobile/Postman
- Verify Stripe PaymentIntent created
- Confirm webhook received
- Check receipt email sent
- Verify database record

### 4️⃣ Deploy to Production
- Update Stripe webhook endpoint
- Configure production Stripe account
- Test with real test cards

---

## 🚀 Success Criteria for Phase 2 (Donations)

- [ ] Mobile app sends donation request with correct DTO
- [ ] Backend creates PaymentIntent successfully
- [ ] Webhook received from Stripe
- [ ] Receipt PDF generated
- [ ] Receipt email delivered
- [ ] Donation record saved in database
- [ ] Error handling for failed payments
- [ ] Refund handling
- [ ] Unit tests pass
- [ ] Postman tests pass

---

## 📝 Notes

- **TenantMiddleware**: Needed for all endpoints to inject mosque_id from slug
- **Auth Endpoints**: Blocked on TenantMiddleware implementation
- **Donations**: Almost complete - just need mobile app DTO confirmation
- **Postman**: Will create comprehensive collection after donations are finalized
- **Redis/BullMQ**: Ready for reminder scheduler (Phase 4)

---
