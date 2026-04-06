# Backend Local Development & Mobile Testing Guide

## 🚀 Quick Start - Local Development

### Step 1: Install Dependencies
```bash
cd /Users/tareque/Destination_distinction/Muslim_Noor/MuslimNoor_Saas
pnpm install
```

### Step 2: Setup Environment Variables
```bash
# Copy template to .env
cp .env.template .env

# Edit .env and fill in values (see instructions below)
# Required keys:
# - SUPABASE_URL
# - SUPABASE_KEY & SUPABASE_SERVICE_ROLE_KEY
# - FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
# - REDIS_URL (or REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB)
```

### Step 3: Start Backend Server
```bash
# Option A: Start just the API (from /apps/api)
cd apps/api
pnpm dev

# Option B: Start API + Queue Worker (from monorepo root)
pnpm start:dev
```

**API runs on:** `http://localhost:3001`

---

## 📱 Local WiFi Testing (iOS + Android + Emulators)

### Prerequisites
- All devices on same WiFi network
- Find your machine's local IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`

### Method 1: Direct WiFi IP Access (Simplest)

#### Step 1: Update .env
```env
API_PUBLIC_URL=http://192.168.x.x:3001  # Replace x.x with your local IP last 2 octets
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://192.168.x.x:3001
```

#### Step 2: Update Mobile App Configuration
In your React Native app, add environment-specific API base URL:

```typescript
// src/config/api.ts
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.x.x:3001'  // Replace with your machine's local IP
  : 'https://api.muslimn door.com'  // Production URL

// Usage in API calls:
const response = await fetch(`${API_BASE_URL}/api/events`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userId}`,
  },
  body: JSON.stringify(eventData),
})
```

#### Step 3: Test Connection from Mobile
```typescript
// Add simple test endpoint
fetch(`${API_BASE_URL}/health`)
  .then(r => r.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(err => console.error('❌ Backend error:', err))
```

---

### Method 2: Using ngrok (Recommended for Production-like Testing)

ngrok creates a public tunnel to your local machine, allowing remote access.

#### Step 1: Install ngrok
```bash
brew install ngrok  # macOS
# or download from https://ngrok.com/download
```

#### Step 2: Authenticate ngrok
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
# Get auth token from https://dashboard.ngrok.com/auth/your-authtoken
```

#### Step 3: Start ngrok Tunnel
```bash
ngrok http 3001
```

**Output will show:**
```
Forwarding  https://abc123def456.ngrok.io -> http://localhost:3001
```

#### Step 4: Update Mobile App
```typescript
// src/config/api.ts
export const API_BASE_URL = __DEV__ && !USE_PRODUCTION_TUNNEL
  ? 'http://192.168.x.x:3001'  // Direct WiFi
  : 'https://abc123def456.ngrok.io'  // ngrok tunnel
```

**Advantages:**
- Works across different network connections (4G, WiFi, etc.)
- Public URL can be shared with team
- Better for testing edge cases

**Disadvantages:**
- ngrok domain changes on restart (use ngrok [reserved domains](https://ngrok.com/docs/cloud-edge/reserved-domains) for fixed URL)
- Slightly higher latency

---

## 🔧 Testing Device Token Registration

### Step 1: Manual Test via curl
```bash
# Register device token from mobile
curl -X POST http://192.168.x.x:3001/api/auth/register-device-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_ID_HERE" \
  -d '{
    "deviceId": "unique-device-identifier",
    "deviceToken": "firebase-fcm-token-here",
    "platform": "ios"  # or "android" or "web"
  }'

# Expected response:
{
  "success": true,
  "data": {
    "id": "...",
    "user_id": "...",
    "device_id": "unique-device-identifier",
    "device_token": "firebase-fcm-token-here",
    "platform": "ios",
    "is_active": true
  },
  "message": "Device token registered successfully"
}
```

### Step 2: React Native Implementation
```typescript
// src/services/device-registration.ts
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { API_BASE_URL } from '../config/api'

export async function registerDeviceToken(userId: string, accessToken: string) {
  try {
    // Get FCM token
    const token = await Notifications.getExpoPushTokenAsync()
    
    // Get device ID
    const deviceId = Device.getDeviceId()
    
    // Get platform
    const platform = Device.osName === 'iOS' ? 'ios' : 'android'
    
    // Register with backend
    const response = await fetch(`${API_BASE_URL}/api/auth/register-device-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userId}`,
      },
      body: JSON.stringify({
        deviceId,
        deviceToken: token.data,
        platform,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to register device token')
    }
    
    const data = await response.json()
    console.log('✅ Device registered:', data)
    return data
  } catch (error) {
    console.error('❌ Device registration failed:', error)
    throw error
  }
}

// Call on app launch after user login
useEffect(() => {
  if (userId) {
    registerDeviceToken(userId, accessToken)
  }
}, [userId])
```

---

## 🧪 Multi-Device Testing Setup

### macOS Development Machine → Multiple Devices/Emulators

#### Setup 1: iOS Real Device
1. Connect iPhone to same WiFi
2. Get your machine's local IP: `ifconfig`
3. Update iOS app API URL to use that IP
4. Build and run: `npx react-native run-ios`

#### Setup 2: Android Real Device
1. Connect Android device to same WiFi
2. Reverse port forwarding (if needed):
```bash
adb reverse tcp:3001 tcp:3001
# Now device can access localhost as http://10.0.2.2:3001 (Android emulator trick)
```
3. Update app `API_BASE_URL` based on device type
4. Build and run: `npx react-native run-android`

#### Setup 3: iOS Simulator
```bash
# iOS simulator on same machine can access localhost directly
API_BASE_URL = 'http://localhost:3001'
```

#### Setup 4: Android Emulator
```bash
# Android emulator uses special IP to access host machine
# From emulator's perspective, host is at 10.0.2.2
API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3001'  # Android emulator
  : 'http://localhost:3001'  # iOS simulator
```

### Environment Detection Code
```typescript
import { Platform } from 'react-native'
import * as Device from 'expo-device'

export const API_BASE_URL = (() => {
  const isDevelopment = __DEV__
  
  if (!isDevelopment) {
    return 'https://api.muslimnoor.com'
  }
  
  if (Device.isDesignedForTabletSize) {
    // Tablet or simulator
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001'  // Android emulator
    }
    return 'http://localhost:3001'  // iOS simulator
  }
  
  // Real device on WiFi
  return 'http://192.168.x.x:3001'  // Your machine's local IP
})();
```

---

## 🔍 Debugging & Troubleshooting

### Check Backend is Running
```bash
curl -v http://localhost:3001/api/health

# Should return status 200 and health info
```

### Check Redis Connection
```bash
# From API logs, should see:
# ✅ Redis connected successfully

# Or test manually:
redis-cli -h redis-13954.c16.us-east-1-2.ec2.cloud.redislabs.com -p 13954 -n 14171904
# Enter password when prompted
```

### Check Firebase Admin SDK
```typescript
// In notification.worker.ts, should show:
// ✅ Firebase Admin initialized

// Test FCM token validity:
curl -X POST https://fcm.googleapis.com/v1/projects/muslim-noor-8b613/messages:send \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "FCM_TOKEN_HERE",
      "notification": {
        "title": "Test",
        "body": "Connection test"
      }
    }
  }'
```

### Mobile App Can't Reach Backend
1. **Check IP address**: Run `ifconfig` on your Mac
2. **Check firewall**: Allow port 3001
   ```bash
   sudo lsof -i :3001  # See what's using port 3001
   ```
3. **Check WiFi network**: Both devices on same network
4. **Test connectivity**:
   ```bash
   # From mobile device, try ping
   ping 192.168.x.x
   curl -v http://192.168.x.x:3001
   ```

### CORS Issues
If getting CORS errors, update `.env`:
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://192.168.x.x:3001,https://abc123.ngrok.io
```

And in `main.ts`:
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(','),
  credentials: true,
})
```

---

## 📋 Testing Workflow

### 1. Start Local Backend
```bash
cd apps/api
pnpm dev
# Wait for: "[NestedNestApplication] Nest application successfully started"
```

### 2. Build Mobile App for Device
```bash
cd MuslimNoorMobile
npm run build:ios  # or build:android
npm start
```

### 3. Test Event Creation Flow
```bash
# 1. Login on mobile app
# 2. Navigate to Events
# 3. Tap "Create Event" button
# 4. Fill form (all required fields)
# 5. Submit
# 6. Check backend logs for: POST /api/events
# 7. Verify event in Supabase dashboard (events table)
```

### 4. Test Push Notifications
```bash
# 1. Create event via admin dashboard (http://localhost:3000)
# 2. Observe notification system queue jobs
# 3. Check Redis for queued jobs:
redis-cli -h redis-13954.c16.us-east-1-2.ec2.cloud.redislabs.com -p 13954
> GET new-event:EVENT_ID

# 5. Mobile device should receive push notification
# 6. Check FCM service logs in backend
```

---

## ✅ Checklist for Test-Ready Deployment

- [ ] `.env` file created with all credentials filled
- [ ] Backend starts without errors: `pnpm dev` ✅
- [ ] Redis connection successful ✅
- [ ] Firebase Admin SDK initialized ✅
- [ ] Mobile app API_BASE_URL points to your machine's IP
- [ ] Device is on same WiFi as backend
- [ ] Test `/api/auth/register-device-token` endpoint ✅
- [ ] Test `/api/events` POST endpoint ✅
- [ ] Test `/api/announcements` POST endpoint ✅
- [ ] Test `/api/reminders` POST endpoint ✅
- [ ] Firebase FCM tokens registering ✅
- [ ] Push notifications working end-to-end ✅

---

## 🎯 Next Steps

1. **Verify Supabase user_devices table exists** with schema:
```sql
CREATE TABLE user_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  device_id TEXT NOT NULL UNIQUE,
  device_token TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('ios', 'android', 'web')),
  is_active BOOLEAN DEFAULT true,
  last_failure_at TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

2. **Test entire flow on all devices**:
   - 2x iOS devices
   - 1x Android device
   - iOS simulator
   - Android emulator

3. **Monitor queue processing** during tests:
```bash
# In separate terminal, watch queue jobs
redis-cli -h redis-13954.c16.us-east-1-2.ec2.cloud.redislabs.com -p 13954
> MONITOR  # Shows all commands in real-time
```

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Start backend | `cd apps/api && pnpm dev` |
| Start queue worker | `cd apps/api && pnpm start:worker` |
| View logs | `tail -f logs/app.log` |
| Check endpoints | `curl http://localhost:3001/api/health` |
| Connect to Redis | `redis-cli -h redis-13954...` |
| Kill port 3001 | `lsof -i :3001 \| grep LISTEN \| awk '{print $2}' \| xargs kill -9` |

Good luck with testing! 🚀
