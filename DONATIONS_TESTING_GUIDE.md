# 🧪 MosqueOS Donations API Testing Guide

**Status**: ✅ **Ready for Postman Testing** (Phase 2 - 60% Complete)

This guide shows you exactly how to test the donations API endpoints locally.

---

## 📋 Quick Setup Checklist

- [ ] Backend running on http://localhost:4000
- [ ] Postman installed
- [ ] `postman/MosqueOS.postman_collection.json` imported
- [ ] `test/fixtures/donation-test-data.json` opened for reference
- [ ] Stripe keys configured in backend `.env`
- [ ] Supabase credentials configured in `.env`

---

## 🚀 Import Postman Collection

### Step 1: Open Postman

```bash
# If using Postman CLI
postman collection run postman/MosqueOS.postman_collection.json

# Or manually:
# 1. Click "Import" in Postman
# 2. Select "postman/MosqueOS.postman_collection.json"
# 3. Click "Import"
```

### Step 2: Set Environment Variables

In Postman, go to **Environments** (top-right) → Create new environment:

```json
{
  "BASE_URL": "http://localhost:4000",
  "auth_token": "",
  "admin_token": "will-be-set-by-seed-script",
  "client_secret": "",
  "donation_id": "",
  "payment_intent_id": ""
}
```

---

## 🧪 Test Scenarios

### Test 1: Health Check (5 min)

**Goal**: Verify API is running

**Steps**:
1. Open **Setup** folder → **Health Check** request
2. Click **Send**
3. Should see: `Hello World!`

```
✅ Status: 200 OK
✅ Body: "Hello World!"
```

---

### Test 2: Create One-Time Donation ($10)

**Goal**: Test basic donation flow with Stripe PaymentIntent creation

**Reference Data**: `test/fixtures/donation-test-data.json` → `scenarios.one_time_donation_small`

**Steps**:
1. Open **💰 Donations** → **1️⃣ Create Donation Intent**
2. Copy request body from fixture:
   ```json
   {
     "amount": 1000,
     "donation_type": "one_time",
     "purpose": "general",
     "donor_name": "John Smith",
     "donor_email": "john.smith@example.com",
     "donor_phone": "+14155552671",
     "donor_message": "May Allah bless this community",
     "is_anonymous": false
   }
   ```
3. Click **Send**

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "donation_id": "550e8400-e29b-41d4-a716-446655440000",
    "client_secret": "pi_test_xxx_secret_xxx",
    "type": "payment_intent",
    "amount": 1000,
    "amount_display": "$10.00",
    "payment_intent_id": "pi_xxx",
    "stripe_account": "acct_alNoorHouston",
    "created_at": "2026-03-15T12:00:00Z"
  }
}
```

**Validation**:
- ✅ Status: 200 OK
- ✅ `client_secret` present (needed for Stripe iOS/Android SDK)
- ✅ `donation_id` is a valid UUID
- ✅ `amount_display` correctly shows "$10.00"
- ✅ Stripe account matches the mosque

---

### Test 3: Create Large Donation ($500)

**Goal**: Test with bigger amount and specific purpose

**Reference Data**: `scenarios.one_time_donation_large`

**Steps**:
1. Same endpoint, different request body
2. Copy from fixture:
   ```json
   {
     "amount": 50000,
     "donation_type": "one_time",
     "purpose": "building_fund",
     "donor_name": "Sarah Johnson",
     "donor_email": "sarah.j@example.com",
     "donor_phone": "+14155552672",
     "is_anonymous": false
   }
   ```
3. Click **Send**

**Expected Response**:
- ✅ `amount_display`: "$500.00"
- ✅ `purpose` saved as "building_fund"
- All other fields like test 2

---

### Test 4: Create Monthly Subscription ($25/month)

**Goal**: Test recurring donation with SetupIntent

**Reference Data**: `scenarios.monthly_subscription`

**Steps**:
1. Same endpoint, set `donation_type` to `"monthly"`
2. Copy from fixture:
   ```json
   {
     "amount": 2500,
     "donation_type": "monthly",
     "purpose": "general",
     "donor_name": "Ahmed Hassan",
     "donor_email": "ahmed.hassan@example.com",
     "donor_phone": "+14155552673",
     "donor_message": "Supporting this mosque monthly",
     "is_anonymous": false
   }
   ```
3. Click **Send**

**Expected Response**:
- ✅ **DIFFERENT** from one-time: Should have `setup_intent_id` instead
- ✅ `type`: "setup_intent" (not "payment_intent")
- ✅ `amount_display`: "$25.00/month"

---

### Test 5: Anonymous Donation

**Goal**: Test privacy features

**Reference Data**: `scenarios.anonymous_donation`

**Steps**:
1. Copy from fixture:
   ```json
   {
     "amount": 10000,
     "donation_type": "one_time",
     "purpose": "ramadan",
     "donor_name": "Anonymous Donor",
     "donor_email": "anonymous@example.com",
     "is_anonymous": true
   }
   ```
2. Click **Send**

**Expected Response**:
- ✅ Status: 200 OK
- ✅ `is_anonymous`: true flag preserved in donation record

---

### Test 6: Validation Errors

**Goal**: Verify proper error handling

#### 6a: Invalid Amount (Zero)

**Reference Data**: `scenarios.error_invalid_amount_zero`

**Steps**:
```json
{
  "amount": 0,
  "donation_type": "one_time",
  "purpose": "general",
  "donor_name": "John Doe",
  "donor_email": "john@example.com"
}
```

**Expected Response**:
```
❌ Status: 400 Bad Request
❌ Error: "Validation failed"
❌ Message: "amount must be greater than or equal to 100"
```

#### 6b: Amount Too High

**Reference Data**: `scenarios.error_invalid_amount_too_high`

**Steps**:
```json
{
  "amount": 1000001,
  "donation_type": "one_time",
  ...
}
```

**Expected Response**:
```
❌ Status: 400 Bad Request
❌ Message: "amount must be less than or equal to 1000000"
```

#### 6c: Invalid Email Format

**Reference Data**: `scenarios.error_invalid_email`

**Steps**:
```json
{
  "amount": 1000,
  "donation_type": "one_time",
  "purpose": "general",
  "donor_name": "John Doe",
  "donor_email": "not-an-email"
}
```

**Expected Response**:
```
❌ Status: 400 Bad Request
❌ Message: "donor_email must be an email"
```

#### 6d: Invalid Donation Type

**Reference Data**: `scenarios.error_invalid_donation_type`

**Steps**:
```json
{
  "amount": 1000,
  "donation_type": "quarterly",  // ❌ Must be "one_time" or "monthly"
  ...
}
```

**Expected Response**:
```
❌ Status: 400 Bad Request
❌ Message: "donation_type must be one of 'one_time', 'monthly'"
```

#### 6e: Missing Required Fields

**Reference Data**: `scenarios.error_missing_required_fields`

**Steps**:
```json
{
  "amount": 1000,
  "donation_type": "one_time"
  // ❌ Missing: purpose, donor_name, donor_email
}
```

**Expected Response**:
```
❌ Status: 400 Bad Request
❌ Messages: [
     "purpose is required",
     "donor_name is required",
     "donor_email is required"
   ]
```

---

### Test 7: Multi-Tenant Isolation

**Goal**: Verify each mosque has separate Stripe account

**Steps**:
1. Create donation for **al-noor-houston**
2. Check response: `"stripe_account": "acct_alNoorHouston"`
3. Create donation for **masjid-manhattan**
4. Check response: `"stripe_account": "acct_masjidManhattan"`

**Expected**:
- ✅ Different Stripe accounts per mosque
- ✅ `donation_id` different for each
- ✅ No data leakage between mosques

---

### Test 8: Admin - List All Donations

**Goal**: Test pagination and filtering

**Prerequisites**:
- ✅ Complete Test 2, 3, 4 first (to have data)
- ✅ Have `admin_token` from seed script

**Steps**:
1. Open **💰 Donations** → **4️⃣ List All Donations (Admin)**
2. Add header: `Authorization: Bearer <admin_token>`
3. Click **Send**

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "amount": 1000,
      "amount_display": "$10.00",
      "donation_type": "one_time",
      "purpose": "general",
      "status": "completed",
      "donor_name": "John Smith",
      "donor_email": "john.smith@example.com",
      "created_at": "2026-03-15T12:00:00Z"
    }
    // ... more donations
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 3,  // Should show all donations from previous tests
    "pages": 1
  }
}
```

**Validation**:
- ✅ Status: 200 OK
- ✅ All test donations appear in list
- ✅ Pagination info included
- ✅ Donor details visible to admin

---

### Test 9: Admin - Donation Summary (Dashboard)

**Goal**: Test metrics for admin dashboard

**Steps**:
1. Open **💰 Donations** → **5️⃣ Get Donation Summary (Admin)**
2. Add header: `Authorization: Bearer <admin_token>`
3. Click **Send**

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "mtd_total": "$60.00",  // $10 + $50 from previous tests
    "mtd_total_cents": 6000,
    "unique_donors": 2,
    "active_subscriptions": 1,  // From monthly subscription test
    "avg_donation": "$20.00",
    "payment_success_rate": 100.0,
    "by_purpose": {
      "general": "$35.00",
      "building_fund": "$50.00",
      "ramadan": "$10.00"
    },
    "by_type": {
      "one_time": "$60.00",
      "monthly_recurring": "$25.00"
    }
  }
}
```

**Validation**:
- ✅ `mtd_total` = sum of test donations
- ✅ `unique_donors` = count
- ✅ `active_subscriptions` = 1 (monthly donation)
- ✅ Breakdown by purpose matches
- ✅ Breakdown by type correct

---

## 🔑 Key Points for Testing

### ✅ What You're Testing

| Test | What | Why |
|------|------|-----|
| Health Check | API running | Baseline sanity check |
| One-time $10 | Stripe PaymentIntent | Core payment flow |
| One-time $500 | Large amounts | Edge case handling |
| Monthly $25 | Stripe SetupIntent | Recurring subscriptions |
| Anonymous | Privacy settings | Anonymous donation flag |
| Validation Errors | Error messages | Proper validation responses |
| Multi-tenant | Mosque isolation | Data security/isolation |
| Admin List | Pagination | Dashboard data retrieval |
| Admin Summary | Metrics | Analytics/reporting |

### ⚠️ What You're NOT Testing Yet

These require actual Stripe webhook setup:
- ❌ Actual payment processing (needs real card or test mode)
- ❌ Receipt generation (needs BullMQ + Redis)
- ❌ Email sending (needs Resend webhook)
- ❌ Donation history retrieval (needs actual payments)
- ❌ Subscription cancellation (needs active subscription)

---

## 📊 Expected Test Results

| Scenario | Status | Response Code | Notes |
|----------|--------|----------------|-------|
| Create $10 donation | ✅ PASS | 200 | client_secret returned |
| Create $500 donation | ✅ PASS | 200 | Larger amount works |
| Create $25/month | ✅ PASS | 200 | SetupIntent returned |
| Anonymous donation | ✅ PASS | 200 | Anonymous flag set |
| Zero amount | ❌ FAIL | 400 | Validation error |
| Bad email | ❌ FAIL | 400 | Validation error |
| Bad donation type | ❌ FAIL | 400 | Validation error |
| Missing fields | ❌ FAIL | 400 | Validation error |
| Admin list | ✅ PASS | 200 | Pagination included |
| Admin summary | ✅ PASS | 200 | Metrics correct |

---

## 🐛 Troubleshooting

### Error: "Cannot POST /api/mosques/al-noor-houston/donations/create-intent"

**Problem**: API not running or wrong port

**Fix**:
```bash
# Check if backend is running
curl http://localhost:4000/

# Should see: "Hello World!"

# If not, start it:
cd apps/api
npm run dev  # or pnpm dev
```

### Error: "Mosque not found"

**Problem**: Using non-existent mosque slug

**Fix**: Use one of the test mosques from `test/fixtures/donation-test-data.json`:
- `al-noor-houston` ← PRIMARY (use this)
- `masjid-manhattan`
- `masjid-sf`

### Error: "Validation failed - amount must be..."

**Problem**: Amount out of range

**Fix**: Amount must be:
- Minimum: 100 cents ($1.00)
- Maximum: 1,000,000 cents ($10,000.00)

### Error: Status 500 - Internal Server Error

**Problem**: Backend error

**Fix**:
1. Check backend logs: `cd apps/api && npm run dev`
2. Look for error messages in terminal
3. Verify `.env` file has Stripe keys:
   ```
   STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

### Error: "Invalid donation_type"

**Problem**: Typo in donation type

**Fix**: Must be exactly:
- `"one_time"` (not "one-time" or "onetime")
- `"monthly"` (not "monthly_recurring")

---

## 📝 Testing Checklist

Use this to track your progress:

```
Phase 2: Donations API Testing
==============================

□ Import Postman collection
□ Set environment variables
□ Test 1: Health Check
  □ Verify API running
□ Test 2: Create $10 donation
  □ Verify client_secret returned
  □ Note donation_id for later
□ Test 3: Create $500 donation
  □ Verify large amount works
□ Test 4: Create monthly donation
  □ Verify setup_intent returned
□ Test 5: Anonymous donation
  □ Verify anonymous flag set
□ Test 6: Validation errors
  □ [6a] Zero amount → 400 error
  □ [6b] Too high amount → 400 error
  □ [6c] Bad email → 400 error
  □ [6d] Bad type → 400 error
  □ [6e] Missing fields → 400 error
□ Test 7: Multi-tenant isolation
  □ al-noor-houston: acct_alNoorHouston
  □ masjid-manhattan: acct_masjidManhattan
  □ masjid-sf: acct_masjidSF
□ Test 8: Admin list donations
  □ Add auth token
  □ Verify pagination
  □ All test donations appear
□ Test 9: Admin summary metrics
  □ Add auth token
  □ Verify mtd_total correct
  □ Verify unique_donors correct
  □ Verify active_subscriptions = 1

Phase 2 Status: ✅ DONATIONS API TESTED
```

---

## 🎯 Next Steps After Testing

Once all ✅ tests pass:

1. **Deploy Database Schema**
   ```bash
   supabase db push  # Push migrations to live DB
   ```

2. **Run Seed Script** (creates superadmin + test data)
   ```bash
   cd scripts
   npx ts-node seed.ts
   ```

3. **Configure Stripe Webhooks**
   - Local: Use ngrok to expose http://localhost:4000 to internet
   - Production: Use actual domain

4. **Test Receipt Generation**
   - Complete a payment via Stripe UI
   - Check webhook is triggered
   - Verify email sent to donor

5. **Move to Phase 3: Events API**
   - Follow same testing pattern

---

## 📞 Need Help?

**Check these files**:
- `postman/MosqueOS.postman_collection.json` - All endpoints
- `test/fixtures/donation-test-data.json` - Test scenarios
- `apps/api/src/modules/donations/` - Source code
- `docs/MODULES_ARCHITECTURE.md` - System design

**Common issues**:
- API not running? Check `npm run dev` in `apps/api/`
- Wrong port? Postman should use `http://localhost:4000`
- Stripe keys missing? Check `apps/api/.env`
- Test data not returned? Ensure migrations applied to Supabase

---

## 🚀 Final Checklist

Before moving to next phase:

- ✅ All 9 test scenarios passing
- ✅ Error handling verified (400 responses correct)
- ✅ Multi-tenant isolation confirmed
- ✅ Admin endpoints secured (auth required)
- ✅ Documentation clear for mobile team

**Phase 2 Status**: 🟡 **IN PROGRESS** → Will be ✅ **COMPLETE** after testing

---

**Next Priority**: Phase 3 - Events API (after donations fully tested)

**Mosque Goals**: Get donations working → Then events → Then streaming Quran → Then live prayer streaming
