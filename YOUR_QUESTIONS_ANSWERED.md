# 🍎 YOUR QUESTIONS ANSWERED

## Question 1: How to Test Donation from iPhone

### Setup Steps

#### Step 1: Expose Your Local Backend to Internet
You have 3 options:

**Option A: ngrok (EASIEST)**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 4000

# Output:
# Forwarding  https://1234-56-78-90-123.ngrok.io → http://localhost:4000
# Copy that URL
```

**Option B: Localtunnel**
```bash
npm install -g localtunnel
lt --port 4000

# Output:
# your url is: https://brave-panda-54.loca.lt
```

**Option C: Cloudflare Tunnel**
```bash
# See cloudflare docs - enterprise option
```

#### Step 2: Update Frontend Config
Edit: `/apps/admin/src/lib/api/client.ts`

```typescript
// Current:
const baseURL = 'http://localhost:4000'

// Change to (using ngrok example):
const baseURL = 'https://1234-56-78-90-123.ngrok.io'
```

Rebuild frontend:
```bash
pnpm dev
```

#### Step 3: Access on iPhone
1. Get your Mac's IP: `ifconfig | grep "inet "`
2. Or use ngrok URL (easier)
3. Visit in Safari: `https://1234-56-78-90-123.ngrok.io:3000/dashboard`
4. Login with your test account
5. Click **Donations** page
6. Fill the checkout form
7. Click **Donate** button

#### Step 4: Test On Device
```
✅ Form submits
✅ Network request succeeds (check DevTools Remote Inspector)
✅ Success message shows
✅ No CORS errors
```

---

## Question 2: Donation Flow (What You Understood = CORRECT ✅)

Your understanding is **100% accurate**. Here's the exact flow:

### Complete Donation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ON iPhone (Frontend)                                 │
├─────────────────────────────────────────────────────────────┤
│ ✓ Opens Donations page                                       │
│ ✓ Sees: Amount input, Name, Email, Purpose dropdown         │
│ ✓ Fills form:                                                │
│   - Amount: $50.00                                           │
│   - Name: "Ahmed Hassan"                                     │
│   - Email: "ahmed@example.com"                               │
│   - Purpose: "General"                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. USER CLICKS "DONATE $50.00" (Frontend)                   │
├─────────────────────────────────────────────────────────────┤
│ ✓ Form validation (name, email, amount check)               │
│ ✓ Shows loading spinner                                      │
│ ✓ Prepares DTO (Data Transfer Object)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SEND HTTP POST REQUEST (Frontend → Backend)              │
├─────────────────────────────────────────────────────────────┤
│ POST /api/mosques/:slug/donations/create-intent             │
│                                                              │
│ Request Body (DTO I gave you):                              │
│ {                                                            │
│   "amount": 5000,           # 5000 cents = $50.00           │
│   "donor_name": "Ahmed Hassan",                             │
│   "donor_email": "ahmed@example.com",                       │
│   "purpose": "General"                                       │
│ }                                                            │
│                                                              │
│ Headers:                                                     │
│ Authorization: Bearer <JWT_TOKEN>  (auto-added)             │
│ Content-Type: application/json                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND RECEIVES REQUEST (NestJS)                        │
├─────────────────────────────────────────────────────────────┤
│ @Post('create-intent')  ← This is what you implement        │
│ async createIntent(@Body() dto: CreateDonationDTO) {        │
│   // validation                                              │
│   // database save                                           │
│   // call Stripe                                             │
│ }                                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. BACKEND CALLS STRIPE API                                 │
├─────────────────────────────────────────────────────────────┤
│ const paymentIntent = await stripe.paymentIntents.create({  │
│   amount: 5000,         # In cents                           │
│   currency: 'usd',                                           │
│   description: 'Donation from Ahmed Hassan',                │
│   metadata: {                                                │
│     donor_name: 'Ahmed Hassan',                             │
│     purpose: 'General',                                      │
│     mosque_id: '...'                                         │
│   }                                                          │
│ })                                                           │
│                                                              │
│ Response from Stripe:                                        │
│ {                                                            │
│   id: 'pi_29...',                    ← Your payment ID       │
│   client_secret: 'pi_29..._secret...' ← For frontend        │
│   status: 'requires_payment_method'                          │
│ }                                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. BACKEND SAVES TO DATABASE                                │
├─────────────────────────────────────────────────────────────┤
│ INSERT INTO donations {                                      │
│   mosque_id: '...',                                          │
│   amount: 5000,                                              │
│   donor_name: 'Ahmed Hassan',                               │
│   donor_email: 'ahmed@example.com',                         │
│   purpose: 'General',                                        │
│   stripe_payment_intent_id: 'pi_29...',                      │
│   status: 'pending'  (not yet paid)                          │
│ }                                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. BACKEND RETURNS RESPONSE (Backend → Frontend)            │
├─────────────────────────────────────────────────────────────┤
│ HTTP 200 OK                                                  │
│ {                                                            │
│   "clientSecret": "pi_29..._secret...",                     │
│   "paymentIntentId": "pi_29..."                             │
│ }                                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. FRONTEND RECEIVES clientSecret                           │
├─────────────────────────────────────────────────────────────┤
│ ✓ Hides spinner                                              │
│ ✓ Shows success message                                      │
│ ✓ Ready for next step: Stripe.js Payment                    │
│                                                              │
│ NOTE: This is where Stripe.js comes in:                     │
│ const stripe = loadStripe('pk_test_...')                    │
│ const clientSecret = response.clientSecret                  │
│ stripe.confirmCardPayment(clientSecret, {                   │
│   payment_method: { ... payment form data ... }             │
│ })                                                           │
│                                                              │
│ But you can test the DTO part first!                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. USER COMPLETES PAYMENT (Stripe.js - Next Phase)          │
├─────────────────────────────────────────────────────────────┤
│ ✓ Stripe popup/modal appears                                │
│ ✓ User enters card details                                  │
│ ✓ User clicks "Pay"                                         │
│ ✓ Stripe processes payment                                  │
│ ✓ Success or failure                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. STRIPE WEBHOOK (Backend handles payment result)         │
├─────────────────────────────────────────────────────────────┤
│ Stripe sends webhook: payment_intent.succeeded              │
│ Backend receives: POST /webhook/stripe                      │
│                                                              │
│ UPDATE donations                                             │
│ SET status = 'completed'                                    │
│ WHERE stripe_payment_intent_id = 'pi_29...'                 │
│                                                              │
│ Database now shows: ✅ COMPLETED donation                   │
│ User sees: "Thank you! $50 received"                        │
└─────────────────────────────────────────────────────────────┘
```

### Current Testing Status

✅ **STEP 1-8 Can Be Tested NOW**
- Frontend form works ✓
- DonationCheckoutForm sends DTO ✓
- Backend receives it ✓
- Backend creates Stripe PaymentIntent ✓
- Backend returns clientSecret ✓

❌ **STEP 9-10 Needs Later**
- Stripe.js frontend payment form
- Payment processing
- Webhook handling

### Test It Right Now

```bash
# 1. Start backend
pnpm dev

# 2. Visit localhost:3000/dashboard/donations

# 3. Fill form:
Amount: 50.00
Name: Test Donor
Email: test@example.com
Purpose: General

# 4. Click Donate button

# 5. Check:
✓ DevTools → Network tab → POST request
✓ See request payload (the DTO)
✓ See response with clientSecret
✓ Success message shows
```

---

## Question 3: How to Send Reminders from Backend to iOS App

This is **push notifications**. Here's how it works:

### Architecture

```
┌───────────────────┐
│   Your Backend    │
│    (NestJS)       │
│                   │
│  /api/send-       │
│  reminder         │
└────────┬──────────┘
         │
         │ Sends to Firebase Cloud Messaging (FCM)
         │
         ▼
┌───────────────────────────────────────┐
│  Firebase Cloud Messaging (FCM)       │
│  - Handles message queueing           │
│  - Tracks device tokens               │
│  - Has servers worldwide              │
└────────┬──────────────────────────────┘
         │
         │ Sends to Apple servers
         │ (APNS - Apple Push Notification Service)
         │
         ▼
┌───────────────────────────────────────┐
│  Apple APNS                           │
│  - Apple's push notification service  │
│  - Handles iOS device delivery        │
└────────┬───────────────────────────────┘
         │
         ▼ (WiFi/Cellular)
┌───────────────────────────────────────┐
│  iPhone / iPad                        │
│                                       │
│  ┌─────────────────────────────────┐  │
│  │ Notification Center             │  │
│  │ ┌─────────────────────────────┐ │  │
│  │ │ 🔔 Reminder: Don't forget   │ │  │
│  │ │    to donate this Ramadan!  │ │  │
│  │ └─────────────────────────────┘ │  │
│  └─────────────────────────────────┘  │
│                                       │
│  Your App Receives:                   │
│  didReceiveRemoteNotification()       │
└───────────────────────────────────────┘
```

### Step-by-Step Implementation

#### Step 1: Backend Setup (NestJS)

**Install Firebase Admin SDK:**
```bash
npm install firebase-admin
```

**Create notification service** (`src/modules/notifications/notification.service.ts`):

```typescript
import * as admin from 'firebase-admin'
import { Injectable } from '@nestjs/common'

@Injectable()
export class NotificationService {
  constructor() {
    // Initialize Firebase (do this in main.ts or module setup)
    const serviceAccount = require('./firebase-service-account.json')
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  }

  async sendReminder(deviceToken: string, reminder: {
    title: string
    body: string
    data?: Record<string, string>
  }) {
    try {
      const message = {
        notification: {
          title: reminder.title,
          body: reminder.body,
        },
        data: reminder.data || {},
        token: deviceToken, // ← This is the device token from iOS app
      }

      const response = await admin.messaging().send(message)
      
      console.log('Notification sent:', response)
      return { success: true, messageId: response }
    } catch (error) {
      console.error('Failed to send notification:', error)
      throw error
    }
  }

  // Send to multiple devices
  async sendReminderToMultiple(deviceTokens: string[], reminder: any) {
    const message = {
      notification: reminder,
      tokens: deviceTokens,
    }

    const response = await admin.messaging().sendMulticast(message)
    return { success: true, successCount: response.successCount }
  }
}
```

**Create API endpoint:**

```typescript
@Controller('reminders')
export class RemindersController {
  constructor(private notificationService: NotificationService) {}

  @Post('send-to-donor')
  async sendDonorReminder(@Body() body: {
    userId: string
    message: string
  }) {
    // 1. Get user's device token from database
    const user = await this.userService.findById(body.userId)
    
    if (!user?.deviceToken) {
      return { error: 'Device token not found' }
    }

    // 2. Send notification
    await this.notificationService.sendReminder(
      user.deviceToken,
      {
        title: '💰 Donation Reminder',
        body: body.message,
        data: {
          type: 'donation_reminder',
          userId: body.userId,
        }
      }
    )

    return { success: true }
  }

  @Post('send-bulk')
  async sendBulkReminder(@Body() body: {
    reminderType: 'ramadan' | 'zakat' | 'event'
    title: string
    message: string
  }) {
    // Get all device tokens from database
    const users = await this.userService.findAll()
    const deviceTokens = users
      .map(u => u.deviceToken)
      .filter(token => !!token)

    if (deviceTokens.length === 0) {
      return { error: 'No devices to notify' }
    }

    // Send to all
    const result = await this.notificationService.sendReminderToMultiple(
      deviceTokens,
      {
        title: body.title,
        body: body.message,
      }
    )

    return result
  }
}
```

#### Step 2: Get Firebase Service Account
1. Go to Firebase Console: https://firebase.google.com
2. Create project (or use existing: "MuslimNoor")
3. Settings → Service Account → Generate Key
4. Save as `firebase-service-account.json` (keep SECRET!)
5. Put in `.gitignore`

#### Step 3: iOS App Setup

**In your Swift/iOS app:**

```swift
// 1. Request user permission
UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
    if granted {
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
}

// 2. Handle when app receives token
func application(_ application: UIApplication, 
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    // ... other setup ...
    
    // Set delegate to get device token
    UIApplication.shared.delegate = self
    
    return true
}

// 3. iOS gives you device token
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
    
    // Send this token to your backend!
    sendDeviceTokenToBackend(token: token)
}

// 4. Handle incoming notification
func userNotificationCenter(_ center: UNUserNotificationCenter,
                          willPresent notification: UNNotification,
                          withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    
    let userInfo = notification.request.content.userInfo
    
    // Show notification even when app is open
    if #available(iOS 14, *) {
        completionHandler([.banner, .sound, .badge])
    } else {
        completionHandler([.alert, .sound])
    }
}

// 5. Handle when user taps notification
func userNotificationCenter(_ center: UNUserNotificationCenter,
                          didReceive response: UNNotificationResponse,
                          withCompletionHandler completionHandler: @escaping () -> Void) {
    
    let userInfo = response.notification.request.content.userInfo
    
    // Handle navigation
    if let type = userInfo["type"] as? String {
        if type == "donation_reminder" {
            // Navigate to donations page
            navigateToDonations()
        }
    }
    
    completionHandler()
}
```

#### Step 4: Send Device Token to Backend

When user logs in on iOS app, send device token:

```swift
func sendDeviceTokenToBackend(token: String) {
    let url = URL(string: "http://localhost:4000/api/users/register-device-token")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.setValue("Bearer \(jwtToken)", forHTTPHeaderField: "Authorization")
    
    let body: [String: Any] = ["deviceToken": token]
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("Failed to send device token: \(error)")
        }
    }.resume()
}
```

#### Step 5: Backend stores device token

```typescript
@Post('register-device-token')
async registerDeviceToken(@Body() body: { deviceToken: string }, @Req() req) {
  const userId = req.user.id // From JWT
  
  // Save token to database
  await this.userService.update(userId, {
    deviceToken: body.deviceToken,
  })
  
  return { success: true }
}
```

### Complete Test Flow

```
1️⃣ USER LOGS INTO iOS APP
   └─→ App generates device token
   └─→ App sends token to backend
   └─→ Backend stores in database

2️⃣ YOU SEND REMINDER FROM BACKEND
   POST /api/reminders/send-to-donor
   {
     "userId": "user123",
     "message": "Don't forget to donate this Ramadan!"
   }

3️⃣ BACKEND:
   └─→ Gets user's device token from DB
   └─→ Sends to Firebase
   └─→ Firebase sends to APNS
   └─→ APNS sends to iPhone

4️⃣ USER'S iPhone:
   └─→ Receives notification
   └─→ Shows in Notification Center
   └─→ User taps it
   └─→ App opens to donations page
```

### Test Without Real App

**Option 1: Use Firebase Console**
1. Firebase Console → Cloud Messaging
2. Send notification to test device
3. Verify on your test iOS device

**Option 2: Use curl to test backend**
```bash
curl -X POST http://localhost:4000/api/reminders/send-to-donor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "test-user-123",
    "message": "Test reminder message"
  }'
```

---

## Summary

### Answer 1: iPhone Testing
✅ Use **ngrok** to expose localhost to internet  
✅ Update API endpoint URL  
✅ Test on device via Safari  

### Answer 2: Donation Flow  
✅ Frontend sends **DTO** with donation data  
✅ Backend **creates Stripe PaymentIntent**  
✅ Backend **saves to database**  
✅ Backend returns **clientSecret**  
✅ Frontend can then use Stripe.js to complete payment  

### Answer 3: Push Notifications  
✅ Setup **Firebase Admin SDK** on backend  
✅ iOS app **sends device token** when logging in  
✅ Backend **stores token in database**  
✅ You can send reminders via **Firebase Cloud Messaging**  
✅ Notifications appear on **iPhone Notification Center**  

---

## Next Steps

1. ✅ Test donation DTO submission (TEST NOW)
2. ⏳ Integrate Stripe.js on frontend for payment
3. ⏳ Setup Firebase for push notifications
4. ⏳ Integrate push notifications in iOS app
5. ⏳ Send bulk reminders for Ramadan, Zakat, etc.

All ready to implement! 🚀
