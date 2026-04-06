# Complete System Testing & Debugging Guide

## 🚀 Quick Start (5 minutes)

### 1. Open Three Terminal Windows

**Terminal 1: Backend API Server**
```bash
cd apps/api
pnpm install
pnpm dev
# Expected: "Server running on http://localhost:3001"
```

**Terminal 2: Admin Dashboard**
```bash
cd apps/admin
pnpm install
pnpm dev
# Expected: "Ready in 1234ms"
# Access: http://localhost:3000
```

**Terminal 3: Testing/Monitoring**
```bash
cd /workspace/root
# Keep this open for running test commands
```

---

## ✅ Verify System is Running

### 1. Check Backend Health
```bash
curl http://localhost:3001/health
# Expected: 200 OK
```

### 2. Check API Proxy is Working
Open dev tools in admin dashboard (F12 → Network tab) and check that requests go to:
- Request URL: `/api/events` (showing in Network tab)
- But actually proxied to: `http://localhost:3001/api/events`

### 3. Verify Icon & Colors
Open admin dashboard at `http://localhost:3000/dashboard`
- Sidebar should show mosque icon ✓ (not warehouse)
- Background should be warm cream color (not stark white) ✓
- Gold/brown color palette visible in header & buttons ✓

---

## 🧪 Test CRUD Operations

### Test 1: Create Event (via UI)

**Steps:**
1. Go to `http://localhost:3000/dashboard/events`
2. Click "Create Event" button
3. Fill form:
   - Title: "Test Event - Spring Cleaning"
   - Start Date: 2024-04-20
   - Start Time: 14:00
   - End Date: 2024-04-20
   - End Time: 15:00
   - Location: "Main Hall"
   - Contact Email: "admin@example.com"
   - Contact Phone: "555-1234"
4. Click "Create" button

**Expected Outcome:**
- ✅ Toast notification: "Event created successfully!"
- ✅ Modal closes
- ✅ Event appears in list
- ✅ Network tab shows: `POST /api/events 200 OK`

**If you see 404 Error:**
```
POST http://localhost:3000/api/events 404 (Not Found)
SyntaxError: Unexpected token '<'
```
→ **Fix**: The proxy isn't working. See [Troubleshooting](#troubleshooting) section

---

### Test 2: Create Announcement (via UI)

**Steps:**
1. Go to `http://localhost:3000/dashboard/announcements`
2. Click "Create Announcement" button
3. Fill form:
   - Title: "New Parking Lot Opening"
   - Message: "We're pleased to announce..."
   - Schedule At: Leave blank for immediate
4. Click "Create" button

**Expected Outcome:**
- ✅ Toast notification: "Announcement created successfully!"
- ✅ Network shows: `POST /api/announcements 200 OK`

---

### Test 3: Create Reminder (via UI)

**Steps:**
1. Go to `http://localhost:3000/dashboard/` (main dashboard)
2. Find reminder creation option (or navigate directly)
3. Fill form and submit

**Expected Outcome:**
- ✅ Toast notification: "Reminder created successfully!"
- ✅ Network shows: `POST /api/reminders 200 OK`

---

### Test 4: Fetch Events List (Data Loading)

**Steps:**
1. Go to `http://localhost:3000/dashboard/events`
2. Page should load without errors

**Expected Outcome:**
- ✅ No error toast at top of page
- ✅ Metric cards show data (# of events, attendance, etc.)
- ✅ Events table populates with data
- ✅ Network tab shows: `GET /api/events 200 OK`

**If you see "AxiosError: Network Error":**
```
Error: Events error: AxiosError: Network Error at XMLHttpRequest.handleError
```
→ Check [Troubleshooting](#troubleshooting)

---

### Test 5: API Direct Testing (via curl)

```bash
# Test Create Event (replace USER_ID with actual)
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-user-id" \
  -d '{
    "title": "Curl Test Event",
    "startLocal": "2024-04-25T15:00",
    "endLocal": "2024-04-25T16:00",
    "timeZone": "America/New_York",
    "location": "Test Location",
    "contactEmail": "test@example.com",
    "contactPhone": "555-5555"
  }'

# Expected Response:
# {
#   "id": "event-123",
#   "title": "Curl Test Event",
#   "status": "created"
# }
```

---

## 🐛 Troubleshooting

### Issue 1: 404 Error on API Calls

**Symptom:**
```
POST http://localhost:3000/api/events 404 (Not Found)
SyntaxError: Unexpected token '<', "<!DOCTYPE"...
```

**Root Cause:**
The Next.js proxy isn't configured. Frontend is calling localhost:3000 instead of being proxied to 3001.

**Check:**
```bash
# Verify proxy in admin next.config.ts
cat apps/admin/next.config.ts | grep "rewrites"
# Should see: rewrites: async () => { beforeFiles: [...] }
```

**Fix:**
1. Verify `apps/admin/next.config.ts` has the proxy configuration:
```typescript
rewrites: async () => {
  return {
    beforeFiles: [
      { source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' },
    ],
  }
}
```

2. Restart Next.js server:
```bash
cd apps/admin
pnpm dev
# Wait for: "Ready in 1234ms"
```

3. Test again in browser (hard refresh with Cmd+Shift+R on Mac)

---

### Issue 2: AxiosError: Network Error

**Symptom:**
```
Events error: AxiosError: Network Error at XMLHttpRequest.handleError
```

**Root Cause:**
Either:
- Backend server not running on port 3001
- Supabase connectivity issue
- CORS issue

**Fix:**

**Step A: Verify Backend is Running**
```bash
curl http://localhost:3001/health
# Should return 200 OK

ps aux | grep "node"
# Should show Node process for port 3001
```

**Step B: If backend isn't running**
```bash
cd apps/api
pnpm install
pnpm dev  # Run in a separate terminal
# Wait for: "Server running on http://localhost:3001"
```

**Step C: Check Supabase Connection**
```bash
# Check .env files exist
ls -la apps/admin/.env.local
ls -la apps/api/.env.local

# Verify SUPABASE_URL is set
cat apps/api/.env.local | grep SUPABASE_URL
```

**Step D: Test Supabase directly**
```bash
# From apps/api directory
npx -y @supabase/supabase-js@latest --test-connection
# Should succeed if credentials are correct
```

---

### Issue 3: Wrong Icon (Warehouse instead of Mosque)

**Symptom:**
Sidebar logo shows warehouse icon instead of mosque

**Fix:**
This is already fixed in the latest code. The new `MosqueIcon` component is in `sidebar.tsx`.

**Verify:**
```bash
grep -n "MosqueIcon" apps/admin/src/components/layout/sidebar.tsx
# Should show the component definition
```

---

### Issue 4: Modal Won't Close After Submit

**Symptom:**
Modal stays open even after successful submit

**Fix:**
The form data isn't resetting. This is already fixed in `create-event-modal.tsx` with proper state reset.

**Verify:**
```bash
grep -A5 "toast.success" apps/admin/src/components/modals/create-event-modal.tsx
# Should show onClose() being called
```

---

### Issue 5: Async/Await Errors in Console

**Symptom:**
```
UnhandledPromiseRejection: Cannot read property 'json' of undefined
```

**Fix:**
Error handling has been improved to properly catch non-JSON responses. The fixes are in all three modal files.

**Verify:**
```bash
grep -B2 "try {" apps/admin/src/components/modals/create-event-modal.tsx
# Should show try-catch blocks with proper error handling
```

---

## 🔧 Advanced Debugging

### Enable Debug Logging

**In `apps/admin/src/components/modals/create-event-modal.tsx`:**

Add before the handleSubmit:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  console.log('[DEBUG] Form submitted with data:', formData)  // ← Add this
  setLoading(true)
  // ... rest of function
}
```

Then check browser console (F12 → Console tab) for logs.

### Monitor Network Requests

Open DevTools (F12 → Network tab):
1. Filter by `Fetch/XHR`
2. Attempt to create event
3. Look for POST request to `/api/events`
4. Click on request → Response tab
5. Should see JSON response with event data

If you see HTML instead of JSON, it's a 404 from wrong proxy.

### Check Backend Logs

Watch terminal where backend is running:
```
[Nest] 12345  - 04/20/2024, 2:30:45 PM   [NestFactory] +63ms
[Nest] 12345  - 04/20/2024, 2:30:45 PM   [InstanceLoader] EventsModule dependencies initialized +45ms
```

Should see incoming request logs when modal submits.

---

## 📊 Success Checklist

After running all tests, verify:

- [ ] Backend running on `localhost:3001` with no errors
- [ ] Admin dashboard running on `localhost:3000` with no errors
- [ ] Sidebar shows mosque icon (not warehouse)
- [ ] Background color is warm cream (not bright white)
- [ ] Create Event modal opens and closes cleanly
- [ ] Event submitted successfully (toast notification appears)
- [ ] Event appears in database (visible in events list)
- [ ] Same for Announcements and Reminders
- [ ] Fetching events loads data without errors
- [ ] Metric cards display proper data
- [ ] All padding properly applied

---

## 🚀 Next Steps

Once all tests pass:

1. **Setup Local Supabase** (see [LOCAL_SUPABASE_SETUP.md](LOCAL_SUPABASE_SETUP.md))
   ```bash
   supabase start
   supabase migration list
   ```

2. **Test with Local Database**
   - Update .env.local files to point to local Supabase
   - Restart backend & dashboard
   - Re-run CRUD tests

3. **Device Token Registration**
   - Register test device tokens
   - Verify tokens stored in database
   - Test push notification flow

4. **Multi-Device Testing**
   - Open mobile app on WiFi
   - Register device token from mobile
   - Test push notification delivery to mobile

---

## 📞 Quick Help Commands

```bash
# Kill process on port 3001 (if stuck)
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Kill process on port 3000 (if stuck)
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Check if ports are available
lsof -i :3000,3001

# View recent logs from backend
tail -50 /tmp/backend.log

# Clear Next.js cache
rm -rf apps/admin/.next

# Full reinstall
cd apps/admin && pnpm install && pnpm dev
```

---

## 📚 File Reference

| File | Purpose | Status |
|------|---------|--------|
| `apps/admin/next.config.ts` | API proxy config | ✅ Fixed |
| `apps/admin/src/components/modals/create-event-modal.tsx` | Event creation | ✅ Fixed error handling |
| `apps/admin/src/components/modals/create-announcement-modal.tsx` | Announcement creation | ✅ Fixed error handling |
| `apps/admin/src/components/modals/create-reminder-modal.tsx` | Reminder creation | ✅ Fixed error handling |
| `apps/admin/src/components/layout/sidebar.tsx` | Navigation with mosque icon | ✅ Fixed icon |
| `apps/admin/src/app/globals.css` | Color palette & background | ✅ Improved colors |
| `apps/admin/src/app/dashboard/page.tsx` | Main dashboard | ✅ Added padding |
| `apps/admin/src/app/dashboard/events/page.tsx` | Events page | ✅ Verified padding & cards |
| `apps/admin/src/app/dashboard/announcements/page.tsx` | Announcements page | ✅ Verified padding & cards |

Good luck! 🎉
