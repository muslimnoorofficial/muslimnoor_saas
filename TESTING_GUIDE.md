# 🧪 TESTING GUIDE - Complete Procedures

**Version**: 1.0  
**Last Updated**: March 18, 2026  
**Status**: Ready for user execution

---

## 📋 Overview

This guide covers testing procedures for the Muslim Noor Admin Dashboard v1.0.0 including:
- ✅ Visual/CSS verification
- ✅ Charts functionality
- ✅ Data loading & errors
- ✅ Forms & validation
- ✅ Stripe payment ($20 test)
- ✅ Mobile responsiveness
- ✅ Error handling

**Estimated Time**: 20 minutes

---

## 🚀 Pre-Testing Checklist

Before starting, ensure:

```bash
# 1. Backend running on port 4000
curl http://localhost:4000/api/health

# 2. Frontend running on port 3000
curl http://localhost:3000

# 3. Stripe keys in .env
echo $STRIPE_SECRET_KEY

# 4. Supabase database accessible
echo $SUPABASE_URL
```

**If any fail**: Restart servers with `pnpm dev` in project root.

---

## ✅ TESTING PHASE 1: CSS & Design

### Test 1.1: Home Page Styling

**URL**: http://localhost:3000 or http://192.168.0.95:3000

**What to look for**:
- [ ] Header has logo and user menu
- [ ] Background color visible (not white/blank)
- [ ] Sidebar colored (not gray/unstyled)
- [ ] Text is readable (proper colors)
- [ ] Buttons have hover effects
- [ ] No console errors

**Expected**:
```
✅ Header: Navy blue (#1e3a8a) with logo
✅ Sidebar: Light gray (#f8fafc) with navigation
✅ Main area: White background with cards
✅ Text: Dark gray (#1f2937) and legible
✅ Buttons: Blue (#3b82f6) with hover effect
```

**If CSS missing**:
- [ ] Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
- [ ] Restart: `pnpm dev`
- [ ] Check: `/apps/admin/src/app/globals.css` uses `@import "tailwindcss"`

---

### Test 1.2: Responsive Design on Mobile

**URL**: http://192.168.0.95:3000 on iPhone

**What to test**:

| Device | Orientation | Expected |
|--------|-------------|----------|
| iPhone 14 | Portrait | Sidebar hidden, hamburger menu visible |
| iPhone 14 | Landscape | Full layout visible |
| iPad | Portrait | 2-column (nav + content) |
| iPad | Landscape | 2-column expanded |
| Desktop 1920x1080 | - | 3-column (sidebar + content + charts) |

**Expected result**:
- [ ] No horizontal scroll
- [ ] Text readable on 5-inch screen
- [ ] Buttons touch-friendly (>44px tall)
- [ ] Forms stack vertically
- [ ] Charts display properly

---

## 📊 TESTING PHASE 2: Charts & Data

### Test 2.1: Donations Page - Charts

**URL**: http://localhost:3000/dashboard/donations

**Check 1: Donation Trends LineChart**
- [ ] Chart displays
- [ ] X-axis shows dates (last 7 days)
- [ ] Y-axis shows amounts ($0 - $1000+)
- [ ] Green line connects points
- [ ] Hover shows values
- [ ] Legend visible below

**Expected data**: 7 donation records with varying amounts

**Check 2: Donations by Purpose PieChart**
- [ ] Pie chart displays (5 colored slices)
- [ ] Colors: Red (General), Blue (Zakat), Green (Building), Purple (Education), Orange (Healthcare)
- [ ] Legend shows all 5 categories
- [ ] Percentages add to 100%
- [ ] Hover shows values

**Expected result**:
```
Pie Chart Example:
- General: 32% (red)
- Zakat: 28% (blue)
- Building Fund: 25% (green)
- Education: 10% (purple)
- Healthcare: 5% (orange)
```

**If charts missing**:
- [ ] Open DevTools (F12)
- [ ] Check Console for errors
- [ ] Verify Recharts imported: `import { LineChart, PieChart } from 'recharts'`
- [ ] Restart with `pnpm dev`

---

### Test 2.2: Members Page - Growth Chart

**URL**: http://localhost:3000/dashboard/members

**What to test**:
- [ ] BarChart displays (6 bars, one per month)
- [ ] X-axis shows months (Jan-Jun)
- [ ] Y-axis shows member count (1800-2500)
- [ ] Bars increase left to right
- [ ] Legend visible
- [ ] Hover shows exact values
- [ ] "Members" metric card shows correct total

**Expected result**:
```
Bar Chart: Members grow from ~1800 → ~2450
Sample data:
- Jan: 1800
- Feb: 1950
- Mar: 2100
- Apr: 2250
- May: 2350
- Jun: 2450
```

---

### Test 2.3: Events Page - Attendance Chart

**URL**: http://localhost:3000/dashboard/events

**What to test**:
- [ ] LineChart displays (6 points, one per week)
- [ ] X-axis shows week numbers (W1-W6)
- [ ] Y-axis shows attendance (300-600)
- [ ] Line trends upward
- [ ] Hover shows values
- [ ] Legend visible
- [ ] "Events" metric card shows attendance total

**Expected result**:
```
Line Chart: Attendance grows from ~320 → ~520
Sample data:
- W1: 320 attendees
- W2: 370 attendees
- W3: 410 attendees
- W4: 450 attendees
- W5: 485 attendees
- W6: 520 attendees
```

---

## 🔄 TESTING PHASE 3: Data Loading & Errors

### Test 3.1: Initial Page Load

**URL**: http://localhost:3000/dashboard/donations

**What to observe**:
1. See spinner/loading state
2. After 1-2 seconds, data loads
3. Charts appear with real data
4. Tables populate with records
5. Metric cards show values

**Expected**: Data loads within 2 seconds

**If slow (>5 seconds)**:
- Backend may be slow
- Check: `curl http://localhost:4000/api/donations` (should be <1s)
- Restart backend: Kill and `pnpm dev` again

---

### Test 3.2: Error Handling - Offline Test

**Devices**: Desktop or DevTools only

**Steps**:

1. Open DevTools (F12)
2. Go to Network tab
3. Click throttle icon → Select "Offline"
4. Refresh page: `Cmd+R`
5. Try to load donations page

**What to look for**:
- [ ] Red error alert box appears
- [ ] Error message visible: "Failed to load donations"
- [ ] Toast notification in bottom-right
- [ ] Retry button available
- [ ] Page doesn't crash (no white screen)
- [ ] Console shows error (don't worry about it)

**Expected result**:
```
Red Alert Box:
⚠️ Error loading donations
Failed to fetch: Network error

[Retry Button]
```

**To recover**:
- Go back to Network tab
- Uncheck "Offline"
- Click "Retry" or refresh page

---

### Test 3.3: Metric Cards Loading

**URL**: http://localhost:3000/dashboard/donations

**Check each metric card**:
- [ ] "Total Donations" shows amount (e.g., "$12,500")
- [ ] "Average Donation" shows amount (e.g., "$250")
- [ ] "Donation Count" shows number (e.g., "50 donations")
- [ ] Each card shows a percentage change (green ↑ or red ↓)

**Expected result**:
```
Card Examples:
┌─────────────────────┐
│ Total Donations     │
│ $12,500             │
│ ↑ +5.2% from last   │ (green)
└─────────────────────┘
```

---

## 💳 TESTING PHASE 4: Stripe Payment Form

### Test 4.1: Form Validation

**URL**: http://localhost:3000/dashboard/donations

**Scroll down to "Make a Donation" form**

**Test 1: Empty submission**
- Leave all fields blank
- Click "Donate" button
- [ ] Error messages appear on required fields
- [ ] Form doesn't submit

**Expected errors**:
```
Name: "Name is required"
Email: "Valid email required"
Amount: "Minimum $1.00 required"
Purpose: "Select a purpose"
```

**Test 2: Invalid email**
- Name: "John Test"
- Email: "notanemail" (invalid)
- Amount: "$25"
- Click button
- [ ] Email error shows: "Invalid email format"

**Test 3: Amount too low**
- Name: "John Test"
- Email: "john@test.com"
- Amount: "$0.50" (less than $1)
- [ ] Error shows: "Minimum donation is $1.00"

**Test 4: Valid form**
- Name: "John Test"
- Email: "john@test.com"
- Amount: "$10"
- Purpose: "General"
- [ ] Form accepts and enables button
- [ ] No error messages

---

### Test 4.2: Form Submission

**Prerequisites**:
- Form has valid data
- Internet connection active
- Backend running
- Stripe keys configured

**Steps**:

1. Fill donation form:
   ```
   Name: Your Name
   Email: your-email@example.com
   Amount: $10.00
   Purpose: General
   ```

2. Click "Donate $10.00" button

3. Observe:
   - [ ] Button shows "Processing..." spinner
   - [ ] Button disabled (no double-click)
   - [ ] After 2-3 seconds, something happens

**Expected outcomes (see Phase 4.3 for $20 test)**:

**Option A - Success**:
```
✅ Success alert: "Donation received!"
Toast: "Thank you for your donation!"
Form clears/resets
```

**Option B - Error**:
```
❌ Error alert: "Payment failed"
Details shown (check console)
Form remains filled (user can retry)
```

---

### Test 4.3: $20 Real Stripe Payment ⭐

**THIS IS THE BIG TEST!**

**Prerequisites**:
- Your Stripe account configured
- `STRIPE_SECRET_KEY` in backend .env
- `STRIPE_PUBLISHABLE_KEY` in frontend .env
- iPhone with network access OR desktop browser

**Online Test Environment**:
- iOS iPhone: http://192.168.0.95:3000/dashboard/donations
- Mac Desktop: http://localhost:3000/dashboard/donations
- Or both!

**Steps** (take ~10 minutes):

1. **Open Donations Page**
   ```
   URL: http://192.168.0.95:3000/dashboard/donations  (if iPhone)
        http://localhost:3000/dashboard/donations      (if Mac)
   ```

2. **Fill Form**
   ```
   Name: [Your Name]
   Email: [Your Email]
   Amount: $20.00  ← EXACTLY $20
   Purpose: General
   ```

3. **Click Submit**
   - Watch for spinner/loading state
   - Wait 2-3 seconds

4. **Handle Stripe Prompt**
   - Might redirect to Stripe confirmation page
   - May show "Complete your purchase" modal
   - Accept or use test card if asked

5. **Look for Success**
   - [ ] Success message or confirmation
   - [ ] No error alerts
   - [ ] Table updates with new record (optional)

6. **Verify in Stripe Dashboard**
   - Open: https://dashboard.stripe.com
   - Go to: Payments → Payment Intents
   - Look for:
     ```
     Amount: $20.00
     Status: Succeeded (green)
     Timestamp: Just now
     ```

7. **Take Screenshot** (DO THIS!)
   - Capture Stripe Dashboard showing $20 payment
   - Save to: `/apps/admin/screenshots/stripe-payment-$20.png`
   - Include timestamp

**Success Criteria**:
- [ ] Form submitted without errors
- [ ] No red error alerts
- [ ] Stripe Dashboard shows $20 payment succeeded
- [ ] Payment timestamp is recent (not old)

**Troubleshooting**:

| Issue | Solution |
|-------|----------|
| Form won't submit | Check console (F12) for errors |
| Network error | Verify backend running on port 4000 |
| Payment rejected | Verify Stripe keys are correct |
| No confirmation | Check Stripe Dashboard anyway |
| Missing $20 | Check if different amount used |

---

## 📱 TESTING PHASE 5: Mobile Testing

### Test 5.1: iPhone Donations Page

**URL**: http://192.168.0.95:3000/dashboard/donations

**Device**: iPhone 12+ or iPad

**Visual Checks**:
- [ ] Header visible (not cut off)
- [ ] Sidebar hidden (hamburger menu?)
- [ ] Charts stack vertically
- [ ] Form field readable
- [ ] Buttons touch-friendly (not tiny)
- [ ] No horizontal scroll

**Functional Checks**:
- [ ] Data loads
- [ ] Charts render
- [ ] Form fills correctly
- [ ] Can enter $20 donation

---

### Test 5.2: iPad Full Dashboard

**URL**: http://192.168.0.95:3000/dashboard

**Device**: iPad (any orientation)

**Checks**:
- [ ] Sidebar visible + functional
- [ ] Navigation works
- [ ] Charts display
- [ ] Tables readable
- [ ] Buttons clickable
- [ ] No layout breaking

---

## 🔧 Debugging Checklist

If tests fail, check these in order:

```bash
# 1. Check logs
tail -f logs/admin.log
tail -f logs/api.log

# 2. Check network
curl http://localhost:3000  # Frontend
curl http://localhost:4000  # Backend

# 3. Check dependencies
pnpm list recharts    # Charts
pnpm list stripe      # Stripe
pnpm list supabase    # Database

# 4. Check environment variables
echo $STRIPE_SECRET_KEY
echo $SUPABASE_URL

# 5. Restart everything
pkill -f "pnpm dev"
pnpm dev

# 6. Clear cache
rm -rf .next
rm -rf dist
pnpm dev
```

---

## 📊 Test Results Template

**Copy this into screenshot folder or report**:

```markdown
# Test Results - [DATE]

## CSS & Design
- [ ] ✅ Home page styled correctly
- [ ] ✅ Colors apply properly
- [ ] ✅ Mobile responsive
- [ ] ✅ Animations smooth

## Charts
- [ ] ✅ Donation LineChart renders
- [ ] ✅ Purpose PieChart renders
- [ ] ✅ Member BarChart renders
- [ ] ✅ Event LineChart renders

## Data Loading
- [ ] ✅ Pages load within 2 seconds
- [ ] ✅ Metric cards show data
- [ ] ✅ No obvious errors

## Error Handling
- [ ] ✅ Offline error displays
- [ ] ✅ Error message clear
- [ ] ✅ Page doesn't crash

## Stripe Payment
- [ ] ✅ Form validates
- [ ] ✅ $20 payment submitted
- [ ] ✅ Appears in Stripe Dashboard
- [ ] ✅ Status: Succeeded

## Mobile
- [ ] ✅ iPhone layout correct
- [ ] ✅ Touch interaction works
- [ ] ✅ No horizontal scroll

## Issues Found
(List any problems or unexpected behavior)

## Screenshots
(Attach relevant screenshots)

---
**Tester**: [Your Name]  
**Date**: [Date & Time]  
**Duration**: [Time Spent]  
**Pass/Fail**: ✅ PASS / ❌ FAIL
```

---

## ✅ Final Sign-Off

When all tests pass:

- [ ] CSS working (visual design matches)
- [ ] Charts rendering (4/4 display correctly)
- [ ] Data loading (3 pages show real data)
- [ ] Forms validating (error messages appear)
- [ ] Stripe form working (no errors)
- [ ] $20 payment confirmed (visible in Stripe Dashboard)
- [ ] Mobile responsive (iPhone + iPad tested)
- [ ] Error handling working (offline test passed)

**Status**: ✅ **READY FOR PRODUCTION**

---

**Next**: See [STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md) for $20 payment details!

Last verified: March 18, 2026
