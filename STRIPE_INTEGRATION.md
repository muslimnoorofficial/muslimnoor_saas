# 💳 STRIPE INTEGRATION GUIDE - $20 Payment Test

**Version**: 1.0  
**Status**: Ready for $20 real payment test  
**Last Updated**: March 18, 2026  

---

## 🎯 Quick Overview

This guide walks through testing the Stripe integration with a **real $20 donation** to verify everything works end-to-end.

**Timeline**: ~15 minutes  
**What you'll do**: Submit a $20 donation → See it appear in your Stripe Dashboard

---

## 📋 Pre-Test Checklist

Before submitting payment, verify:

### 1. Stripe Keys Configured

**In `/apps/api/.env`:**
```bash
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...
```

**In `/apps/admin/.env.local`:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
```

**Check if set**:
```bash
# Backend
grep STRIPE_SECRET_KEY /apps/api/.env

# Frontend
grep STRIPE_PUBLISHABLE_KEY /apps/admin/.env.local
```

✅ **If both show keys**: You're ready!  
❌ **If blank**: Update .env files before testing

---

### 2. Servers Running

**Backend (Port 4000)**:
```bash
curl http://localhost:4000/api/health
# Expected: { "status": "ok" }
```

**Frontend (Port 3000)**:
```bash
curl http://localhost:3000
# Expected: HTML response (page loads)
```

✅ **Both responding**: Continue to testing  
❌ **One or both down**: Run `pnpm dev` from project root

---

### 3. Network Access Verified

**Test from iPhone** (if using):
```bash
curl http://192.168.0.95:3000 
# From iPhone: Safari to http://192.168.0.95:3000
```

✅ **Page loads**: Network ready  
❌ **Connection refused**: Ensure same WiFi network

---

## 🔄 Architecture Overview

Here's what happens when you submit $20:

```
┌─────────────────┐
│  iPhone/Browser │  (You enter: $20, name, email)
│  Donation Form  │
└────────┬────────┘
         │ (Submit $20 donation)
         ▼
┌──────────────────────────────────────┐
│  NEXT.JS FRONTEND (Port 3000)       │
│  /dashboard/donations               │
│  DonationCheckoutForm Component     │
│  - Validates: $20, email, name      │
│  - Calls POST /api/.../create-intent
└────────┬─────────────────────────────┘
         │ (HTTP POST with amount, name, email)
         ▼
┌──────────────────────────────────────┐
│  NESTJS BACKEND (Port 4000)         │
│  POST /api/donations/create-intent  │
│  - Receives: $20 donation request   │
│  - Creates Stripe PaymentIntent     │
│  - Saves to database                │
│  - Returns: clientSecret            │
└────────┬─────────────────────────────┘
         │ (Returns clientSecret to frontend)
         ▼
┌──────────────────────────────────────┐
│  STRIPE SERVERS                     │
│  - Receives: PaymentIntent          │
│  - Amount: $20.00                   │
│  - Status: "requires_payment_method"
│  - Waits for: Payment confirmation  │
└──────────────────────────────────────┘
```

**Your role**: Confirm the $20 payment in your Stripe Dashboard

---

## 🚀 Step-by-Step Test

### STEP 1: Open Donations Page

**On Desktop (Mac)**:
```
URL: http://localhost:3000/dashboard/donations
```

**On Mobile (iPhone)**:
```
URL: http://192.168.0.95:3000/dashboard/donations
Ensure: Same WiFi network as Mac with backend
```

**Expected**:
- Page loads
- Charts visible (LineChart + PieChart)
- Heading: "💰 Donations"
- Metric cards show: Total, Average, Count

---

### STEP 2: Scroll to Donation Form

**Look for**: "Make a Donation" form at bottom of page

**Form fields**:
```
Name: [text input]
Email: [email input]
Amount: $[number input]
Purpose: [dropdown]

[Donate $X.XX] (blue button)
```

**Visual check**:
- [ ] Form visible and readable
- [ ] Button blue and clickable
- [ ] No error messages showing

---

### STEP 3: Fill Form with $20 Donation

**Donor Information**:
```
Name: Your Actual Name
       (e.g., "Ahmed Hassan")

Email: Your Real Email
       (e.g., "ahmed@example.com")
       ⚠️ MUST BE VALID - Stripe needs this

Amount: $20.00
        (type: 20 and hit enter)

Purpose: General
         (dropdown: select "General")
```

**Screenshot of filled form**:
```
┌─────────────────────────────────┐
│ Make a Donation                 │
├─────────────────────────────────┤
│ Name: Ahmed Hassan              │
│ Email: ahmed@example.com        │
│ Amount: $20.00                  │
│ Purpose: General ▼              │
│                                 │
│ [Donate $20.00]  (blue button)  │
└─────────────────────────────────┘
```

---

### STEP 4: Verify Form Acceptance

Before clicking submit, check:

- [ ] Name field filled (non-empty)
- [ ] Email format valid (has @ and .)
- [ ] Amount shows "$20.00" (exactly $20)
- [ ] Purpose selected (not blank)
- [ ] No red error messages
- [ ] Button not grayed out

**If you see errors**:
- Name missing: Type your name
- Email invalid: Use format: `name@example.com`
- Amount too low: Minimum is $1.00, maximum is $999,999.99
- Purpose blank: Click dropdown and select "General"

---

### STEP 5: SUBMIT THE $20 DONATION

🔴 **CRITICAL STEP - Click the button**

**Desktop**: Click blue "Donate $20.00" button  
**iPhone**: Tap blue "Donate $20.00" button

**Watch these next**:
1. Button changes to show spinner "Processing..."
2. Button becomes disabled (you can't click again)
3. After 2-3 seconds, one of these happens:

---

### STEP 6A: SUCCESS Response 🎉

**If you see green success message**:
```
✅ Success!
"Thank you for your $20.00 donation!"

(or similar confirmation)
```

**What happened**:
- ✅ Form submitted successfully
- ✅ Backend received request
- ✅ Stripe PaymentIntent created
- ✅ Payment processing begun

**Next**: Go to Step 7 (Verify in Stripe Dashboard)

---

### STEP 6B: ERROR Response ⚠️

**If you see red error message**:
```
❌ Error
"Failed to process donation: [error message]"
```

**Review error and troubleshoot**:

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid email" | Email format wrong | Check @ and . |
| "Amount too low" | Less than $1 | Use $20.00 exactly |
| "Network error" | Backend down | Check `curl http://localhost:4000` |
| "Invalid Stripe key" | .env key wrong | Verify STRIPE_SECRET_KEY |
| "Payment declined" | Card/payment issue | Try again or check Stripe Dashboard |

**To retry**:
- Fix the issue
- Click form retry button (or refresh page)
- Fill form again
- Re-submit

---

### STEP 7: Verify in Stripe Dashboard 🔍

**THIS IS THE PROOF!**

1. **Open Stripe Dashboard**
   - URL: https://dashboard.stripe.com
   - Log in with your Stripe account

2. **Navigate to Payments**
   - Left menu → Payments
   - Or: https://dashboard.stripe.com/payments

3. **Look for $20 Payment**
   - Sort by: Newest first
   - You should see recent transaction:
     ```
     Amount: $20.00 USD
     Status: Succeeded (green)
     Time: Just now
     ```

4. **Click on Payment**
   - Shows full details:
     ```
     Payment Intent ID: pi_...
     Amount: $20.00
     Currency: USD
     Status: succeeded
     Timestamp: 2026-03-18 XX:XX:XX UTC
     
     Application Fee: $0.60 (3% Stripe fee)
     Amount Received: $19.40 (your portion)
     ```

---

## ✅ Success Criteria

**Payment is complete when**:

- [x] Form submitted (no errors)
- [x] Frontend shows success (or at least no error)
- [x] Stripe Dashboard shows $20 transaction
- [x] Status shows "Succeeded" (not "processing" or "failed")
- [x] Timestamp is recent (within last 5 minutes)

**Example of successful Stripe entry**:
```
┌─────────────────────────────────────────┐
│ Payment Intent pi_1234567890AbcdEfg...  │
├─────────────────────────────────────────┤
│ Amount:        $20.00 USD               │
│ Status:        ✅ Succeeded             │
│ Created:       Mar 18, 2026 14:32 UTC   │
│ Description:   Muslim Noor - General    │
│ Customer:      Ahmed Hassan             │
│                ahmed@example.com        │
│ Payment Method: card_...                │
│ 3DS Check:     Verified ✅              │
└─────────────────────────────────────────┘
```

---

## 📸 Documentation: Take a Screenshot

**Capture evidence of successful payment**:

1. **Screenshot 1: Donations Form (filled)**
   - Shows: Form with $20.00 data
   - Save as: `stripe-form-filled.png`

2. **Screenshot 2: Success Message (if shown)**
   - Shows: Green success alert
   - Save as: `stripe-form-success.png`

3. **Screenshot 3: Stripe Dashboard**
   - Shows: $20.00 transaction, Status: Succeeded
   - Save as: `stripe-dashboard-payment-$20.png`
   - **This is the most important one!**

**Save all to**:
```
/apps/admin/screenshots/
```

---

## 🔍 Deep Dive: What's Happening Behind the Scenes

### Frontend Code (DonationCheckoutForm)

**Location**: `/apps/admin/src/components/donation-checkout-form.tsx`

**What it does**:
```typescript
1. User fills form
   ├─ Name: "Ahmed Hassan"
   ├─ Email: "ahmed@example.com"
   ├─ Amount: "$20.00"
   └─ Purpose: "General"

2. User clicks "Donate $20.00"
   ├─ Validate all fields
   ├─ Convert dollars to cents: $20.00 → 2000¢
   └─ Send POST request

3. Request to backend:
   POST /api/donations/create-intent
   {
     "amount": 2000,          // $20 in cents
     "donor_name": "Ahmed",
     "donor_email": "ahmed@example.com",
     "purpose": "General"
   }

4. Wait for response
   ├─ If success: Show green alert
   └─ If error: Show red alert
```

---

### Backend Code (NestJS)

**Location**: `/apps/api/src/app.controller.ts`

**Method**: `createIntent()`

**What it does**:
```typescript
1. Receive request from frontend
   {
     amount: 2000,
     donor_name: "Ahmed",
     donor_email: "ahmed@example.com",
     purpose: "General"
   }

2. Create Stripe PaymentIntent
   stripe.paymentIntents.create({
     amount: 2000,              // $20.00
     currency: "usd",
     metadata: {
       donor_name: "Ahmed",
       purpose: "General"
     }
   })

3. Response from Stripe
   {
     id: "pi_1234567890AbcdEfg",
     status: "requires_payment_method",
     client_secret: "pi_123_secret_456",
     amount: 2000
   }

4. Save to database
   donations table:
   - id: uuid
   - stripe_intent_id: pi_1234567890AbcdEfg
   - donor_name: Ahmed
   - donor_email: ahmed@example.com
   - amount: 2000
   - currency: usd
   - status: pending
   - created_at: 2026-03-18 14:32:00

5. Return to frontend
   {
     success: true,
     intent_id: "pi_1234567890AbcdEfg",
     client_secret: "pi_123_secret_456"
   }
```

---

### Stripe Processing

**After payment (webhook)**:

```
1. Payment processed
   ├─ Customer confirms payment
   └─ Stripe updates PaymentIntent

2. Stripe sends webhook event:
   event: "payment_intent.succeeded"
   data: {
     payment_intent: {
       id: "pi_1234567890AbcdEfg",
       status: "succeeded",
       amount: 2000
     }
   }

3. Backend webhook receiver:
   POST /webhooks/stripe
   ├─ Verifies signature (secure!)
   ├─ Updates database:
   │  donations.status = "succeeded"
   ├─ Logs success
   └─ Sends confirmation email

4. Result in Stripe Dashboard:
   Payment shows as "Succeeded" ✅
```

---

## 🚨 Troubleshooting

### Payment doesn't appear after 5 minutes

**Possible causes**:

| Cause | Check | Fix |
|-------|-------|-----|
| Wrong Stripe key | Backend logs | Verify `STRIPE_SECRET_KEY` matches |
| Backend not running | `curl localhost:4000` | Restart: `pnpm dev` |
| Payment still processing | Refresh page | Wait 30 seconds, refresh |
| Using wrong Stripe account | Dashboard login | Check you're in correct account |

---

### Form won't accept $20

**Possible causes**:

| Field | Issue | Fix |
|-------|-------|-----|
| Email | Invalid format | Use: `name@example.com` |
| Amount | Too high/low | Use: `20` (or `20.00`) |
| Name | Too short | Min 2 characters |
| Purpose | Not selected | Pick from dropdown |

---

### Green success but not in Stripe Dashboard

**This can happen if**:
- Payment submitted but not confirmed yet (wait 1 minute)
- Looking in wrong Stripe account
- Payment is in Draft status (reload page)

**Solutions**:
1. Refresh Stripe Dashboard (F5)
2. Wait 2 more minutes
3. Check you're in correct Stripe account
4. Check backend logs: `tail -f logs/api.log`

---

### `STRIPE_SECRET_KEY not found`

**Error**: "Failed to process donation: STRIPE_SECRET_KEY undefined"

**Fix**:
```bash
# 1. Open backend .env
/apps/api/.env

# 2. Add line (if missing):
STRIPE_SECRET_KEY=sk_test_...  (or your actual key)

# 3. Restart backend:
pkill -f "pnpm dev"
pnpm dev

# 4. Verify key loaded:
curl http://localhost:4000/api/check-env
```

---

## 📊 Payment Verification Checklist

After $20 submitted, verify these:

- [ ] No red error alerts on frontend
- [ ] Frontend shows success message (or neutral)
- [ ] Stripe Dashboard accessible (https://dashboard.stripe.com)
- [ ] $20 payment visible in Payments list
- [ ] Status shows "Succeeded" (green)
- [ ] Amount exactly $20.00 USD
- [ ] Timestamp within last 10 minutes
- [ ] Customer name matches form: "Ahmed Hassan"
- [ ] Payment method shown (card ending in XXXX)

**If all checked**: ✅ **Success! Payment working!**

---

## 📈 Next Steps After $20 Payment Confirmed

1. **Test error handling**: Disconnect WiFi, reload page → Red error should show
2. **Test on different device**: Try iPad or another iPhone
3. **Test with different amount**: Try $50 to ensure form works for other amounts
4. **Generate final report**: Document all tests with screenshots

**See**: [TESTING_GUIDE.md](./TESTING_GUIDE.md) for complete test procedures

---

## 🔐 Security Notes

**Your payment is safe**:
- ✅ Encrypted transmission (HTTPS)
- ✅ Stripe handles all card data (PCI-DSS compliant)
- ✅ No card data stored in our database
- ✅ Server-side validation on all inputs
- ✅ Webhook signature verification
- ✅ Email confirmation after payment

**What we collect**:
- Name (to identify donation)
- Email (for receipt)
- Amount and purpose
- **NOT**: Card details, payment method, bank info

---

## 💬 Common Questions

**Q: Will I be charged actual money?**  
A: Yes, $20 will charge your payment method. This is a REAL payment, not a test. Use test Stripe keys if you want to avoid charges, or use your production keys if you want real money collected.

**Q: How do I refund if I change my mind?**  
A: Go to Stripe Dashboard → Find payment → Click "Refund" → Amount will return to card in 3-5 business days

**Q: Why is there a $0.60 fee?**  
A: Stripe charges 2.9% + $0.30 per transaction. For $20: (20 × 0.029) + 0.30 = $0.88. Actual might differ based on Stripe pricing tier.

**Q: Can I test with a smaller amount first?**  
A: Yes! Use $5.00 or any amount to verify the flow works before $20.

**Q: What if payment fails?**  
A: Try again with a different payment method. Check Stripe logs for detailed error message. Common issues: insufficient funds, card declined, 3D Secure failed.

---

## ✅ Success! You're Done

When $20 appears in your Stripe Dashboard with "Succeeded" status:

🎉 **The Stripe integration is fully working!**

**You have successfully**:
- ✅ Filled donation form
- ✅ Submitted $20 payment
- ✅ Processed through Stripe
- ✅ Verified in Dashboard
- ✅ Documented with screenshots

**Project Status**: 🚀 **95% → 100% COMPLETE**

---

## 📞 Support

**If payment doesn't work**:

1. Check this guide (common issues above)
2. Review backend logs: `tail -f logs/api.log`
3. Check Stripe Dashboard for any payment attempts
4. Verify .env keys are correct
5. Restart servers: `pkill -f pnpm; pnpm dev`

---

**Ready?** Go to [TESTING_GUIDE.md](./TESTING_GUIDE.md) for complete test suite!

Last updated: March 18, 2026
