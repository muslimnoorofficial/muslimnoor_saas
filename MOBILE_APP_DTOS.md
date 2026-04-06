# Mobile App DTOs for Muslim Noor

## 📱 Donation API DTOs

### 1. CreateDonationIntentDto
**Endpoint:** `POST /api/mosques/:mosque_slug/donations/create-intent`

```typescript
interface CreateDonationIntentDto {
  // Amount in CENTS (not dollars)
  amount: number; // Min: 100 ($1.00), Max: 1000000 ($10,000.00)

  // Donation type
  donation_type: 'one_time' | 'monthly';

  // Purpose/category
  purpose: 'general' | 'zakat' | 'sadaqah' | 'ramadan' | 'building_fund';

  // Donor information
  donor_name: string;
  donor_email: string;
  donor_phone?: string;

  // Optional fields
  donor_message?: string;
  is_anonymous?: boolean;
}
```

**Example Request:**
```json
{
  "amount": 5000,
  "donation_type": "one_time",
  "purpose": "general",
  "donor_name": "Ahmed Hassan",
  "donor_email": "ahmed@example.com",
  "donor_phone": "+16175551234",
  "donor_message": "May Allah bless this mosque",
  "is_anonymous": false
}
```

### 2. DonationIntentResponseDto
**Response from create-intent endpoint**

```typescript
interface DonationIntentResponseDto {
  success: boolean;
  data: {
    donation_id: string;
    client_secret: string; // Pass to Stripe SDK
    type: 'payment_intent' | 'subscription';
    amount: number; // in cents
    amount_display: string; // formatted USD
    payment_intent_id?: string;
    subscription_id?: string;
    stripe_account: string;
    created_at: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### 3. ConfirmDonationDto
**Endpoint:** `POST /api/mosques/:mosque_slug/donations/confirm`

```typescript
interface ConfirmDonationDto {
  payment_id: string; // PaymentIntent or Subscription ID
  type: 'payment_intent' | 'subscription';
  invoice_id?: string;
}
```

### 4. DonationHistoryDto
**Endpoint:** `GET /api/mosques/:mosque_slug/donations/history`

```typescript
interface DonationHistoryDto {
  id: string;
  amount: number; // in cents
  amount_display: string; // formatted USD
  donation_type: 'one_time' | 'monthly';
  purpose: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  donor_name: string;
  created_at: string;
  receipt_url?: string;
}
```

## 🔔 Notification Strategy: FCM (Firebase Cloud Messaging)

### Why FCM?
- ✅ **Cross-platform**: iOS, Android, Web
- ✅ **Reliable delivery**: Google's infrastructure
- ✅ **Rich notifications**: Images, actions, data payloads
- ✅ **Topic messaging**: Send to mosque members
- ✅ **Device management**: Handle token updates
- ✅ **Analytics**: Delivery and engagement tracking

### Implementation Strategy

#### 1. **Backend Setup (API)**
```typescript
// Add to mosques table
ALTER TABLE mosques ADD COLUMN fcm_server_key TEXT;

// Notification DTOs
interface SendNotificationDto {
  title: string;
  body: string;
  mosque_slug: string;
  target_audience: 'all' | 'members' | 'donors';
  image_url?: string;
  data?: Record<string, any>;
}

interface NotificationResponseDto {
  success: boolean;
  message_id?: string;
  error?: string;
}
```

#### 2. **Mobile App Setup**
```typescript
// Install dependencies
npm install @react-native-firebase/app @react-native-firebase/messaging

// Get FCM token
import messaging from '@react-native-firebase/messaging';

const getFCMToken = async () => {
  const token = await messaging().getToken();
  // Send to your API: POST /api/users/fcm-token
  return token;
};

// Handle notifications
messaging().onMessage(async remoteMessage => {
  // Handle foreground notifications
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Handle background notifications
});
```

#### 3. **API Endpoints for Notifications**

**Register Device Token:**
```
POST /api/users/fcm-token
{
  "token": "fcm_device_token_here",
  "platform": "ios" | "android"
}
```

**Send Announcement:**
```
POST /api/mosques/:slug/announcements
{
  "title": "Eid Prayer Times",
  "body": "Eid prayer at 8:00 AM tomorrow",
  "target_audience": "all",
  "image_url": "https://mosque.com/eid.jpg",
  "data": {
    "type": "prayer_times",
    "prayer_id": "eid_2024"
  }
}
```

#### 4. **Database Schema for Notifications**
```sql
-- Device tokens table
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  mosque_id UUID REFERENCES mosques(id),
  token TEXT NOT NULL,
  platform VARCHAR(20), -- ios, android, web
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mosque_id UUID NOT NULL REFERENCES mosques(id),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  target_audience VARCHAR(20) DEFAULT 'all',
  sent_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Announcement deliveries (for tracking)
CREATE TABLE announcement_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id),
  user_id UUID REFERENCES users(id),
  device_token_id UUID REFERENCES device_tokens(id),
  status VARCHAR(20), -- sent, delivered, opened
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP
);
```

#### 5. **Notification Types**
- **Prayer Times**: Daily/weekly prayer schedule updates
- **Events**: New events, reminders, updates
- **Announcements**: General mosque communications
- **Donation Receipts**: Confirmation and thank you messages
- **Emergency Alerts**: Important urgent notifications
- **Ramadan Reminders**: Special Ramadan notifications

### Alternative Options Considered

#### ❌ Web Push API
- **Pros**: No third-party dependency
- **Cons**: Only works on web, complex setup, less reliable

#### ❌ Device Token Collection
- **Pros**: Direct control
- **Cons**: No delivery guarantees, no analytics, custom infrastructure needed

#### ✅ FCM is the clear winner for your use case

## 📋 Mobile App Structure

Your mobile app should be in `/apps/MuslimNoorMobile/` and include:

```
apps/MuslimNoorMobile/
├── src/
│   ├── api/           # API client with DTOs
│   ├── components/    # Reusable UI components
│   ├── screens/       # App screens
│   │   ├── donations/ # Donation flow
│   │   ├── prayers/   # Prayer times
│   │   └── announcements/ # Notifications
│   ├── services/      # FCM, Stripe integration
│   └── types/         # TypeScript types/DTOs
├── package.json
└── app.json
```

## 🔄 Donation Flow for Mobile

1. **Select Mosque** → Choose mosque by location/search
2. **Choose Amount** → Preset amounts or custom input
3. **Donor Details** → Name, email, phone
4. **Payment** → Stripe Elements for card input
5. **Confirmation** → Success screen with receipt

The DTOs above provide everything you need for a complete donation experience! 🕌💝</content>
<parameter name="filePath">/Users/tareque/Destination_distinction/Muslim_Noor/MuslimNoor_Saas/MOBILE_APP_DTOS.md