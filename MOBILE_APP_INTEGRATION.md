# 📱 Mobile App - Donations Integration Guide

**Status**: Backend ✅ Ready | Mobile Integration: 🟡 In Progress

This guide shows your mobile app exactly how to integrate with the MosqueOS donations API.

---

## 🎯 Quick Overview

Your mobile app needs to:

1. **Send donation request** to backend with user details
2. **Receive `client_secret`** from backend
3. **Pass to Stripe SDK** to handle payment UI
4. **Confirm payment** (payment will be confirmed by webhook)
5. **Show receipt** to user

---

## 📋 Step 1: Create Donation Intent

### Endpoint

```
POST http://localhost:4000/api/mosques/{mosque_slug}/donations/create-intent
```

### Request Body

**TypeScript**:
```typescript
interface CreateDonationIntentDto {
  // REQUIRED: Amount in cents (e.g., 1000 = $10.00)
  // Validation: 100 (min $1) to 1,000,000 (max $10,000)
  amount: number;

  // REQUIRED: Type of donation
  // Values: "one_time" or "monthly" (or "quarterly" in future)
  donation_type: "one_time" | "monthly";

  // REQUIRED: Category/purpose for reporting
  // Values: "general", "building_fund", "education", "ramadan", 
  //         "medical", "orphans", "widows", "students", "other"
  purpose: string;

  // REQUIRED: Donor name (can be "Anonymous" if is_anonymous=true)
  donor_name: string;

  // REQUIRED: Email for receipt
  // Validation: Must be valid email format
  donor_email: string;

  // OPTIONAL: Phone number (with country code)
  // Example: "+16175551234"
  donor_phone?: string;

  // OPTIONAL: Message from donor (max 500 chars)
  donor_message?: string;

  // OPTIONAL: Hide donor name from public list
  // Default: false
  is_anonymous?: boolean;
}
```

### Example Request (Swift)

```swift
import Foundation

let donation = [
    "amount": 1000,                           // $10.00
    "donation_type": "one_time",
    "purpose": "general",
    "donor_name": "John Smith",
    "donor_email": "john@example.com",
    "donor_phone": "+14155552671",
    "donor_message": "May Allah bless this mosque",
    "is_anonymous": false
] as [String: Any]

let request = URLRequest(
    url: URL(string: "http://localhost:4000/api/mosques/al-noor-houston/donations/create-intent")!
)

var request = request
request.httpMethod = "POST"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = try JSONSerialization.data(withJSONObject: donation)

let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
    guard let data = data else { return }
    
    if let response = try? JSONDecoder().decode(DonationIntentResponse.self, from: data) {
        let clientSecret = response.data.client_secret
        // Pass to Stripe SDK (see step 2)
        print("Client Secret: \(clientSecret)")
    }
}
task.resume()
```

### Example Request (Kotlin)

```kotlin
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

val jsonBody = """
{
  "amount": 1000,
  "donation_type": "one_time",
  "purpose": "general",
  "donor_name": "John Smith",
  "donor_email": "john@example.com",
  "donor_phone": "+14155552671",
  "is_anonymous": false
}
""".trimIndent()

val request = Request.Builder()
    .url("http://localhost:4000/api/mosques/al-noor-houston/donations/create-intent")
    .post(jsonBody.toRequestBody("application/json".toMediaType()))
    .build()

val client = OkHttpClient()
client.newCall(request).execute().use { response ->
    if (response.isSuccessful) {
        val body = response.body?.string()
        val jsonResponse = JSONObject(body)
        val clientSecret = jsonResponse
            .getJSONObject("data")
            .getString("client_secret")
        
        // Pass to Stripe SDK (see step 2)
        println("Client Secret: $clientSecret")
    }
}
```

### Response

```json
{
  "success": true,
  "data": {
    "donation_id": "550e8400-e29b-41d4-a716-446655440000",
    "client_secret": "pi_1234567890_secret_aBcDeFgHiJkL",
    "type": "payment_intent",
    "amount": 1000,
    "amount_display": "$10.00",
    "payment_intent_id": "pi_1234567890",
    "stripe_account": "acct_1234567890",
    "created_at": "2026-03-15T12:00:00Z"
  }
}
```

### Error Response (Example)

```json
{
  "success": false,
  "error": "Validation failed",
  "messages": ["amount must be greater than or equal to 100"]
}
```

**Status Code**: 400 for validation errors, 404 if mosque not found

---

## 💳 Step 2: Complete Payment with Stripe SDK

### Setup Stripe SDK

**iOS (Swift)**:

```swift
import StripePaymentSheet

// Save client_secret from step 1
let clientSecret = "pi_1234_secret_xxx"

// Create Stripe Payment Sheet
var configuration = PaymentSheet.Configuration()
configuration.merchantDisplayName = "Al-Noor Islamic Center"

let paymentSheet = PaymentSheet(
    paymentIntentClientSecret: clientSecret,
    configuration: configuration
)

// Show payment UI
paymentSheet.present(from: self) { paymentResult in
    switch paymentResult {
    case .completed:
        print("✅ Payment completed!")
        // Go to step 3
        
    case .canceled:
        print("❌ Payment canceled by user")
        
    case .failed(let error):
        print("❌ Payment failed: \(error.localizedDescription)")
    }
}
```

**Android (Kotlin)**:

```kotlin
import com.stripe.android.paymentsheet.PaymentSheet
import com.stripe.android.paymentsheet.PaymentSheetResult

val paymentSheet = PaymentSheet()

val callback: (PaymentSheetResult) -> Unit = { result ->
    when (result) {
        is PaymentSheetResult.Completed -> {
            // ✅ Payment completed!
            // Go to step 3
            showDonationConfirmation()
        }
        is PaymentSheetResult.Cancelled -> {
            // ❌ User canceled
            showMessage("Payment cancelled")
        }
        is PaymentSheetResult.Failed -> {
            // ❌ Payment failed
            showMessage("Payment failed: ${result.error}")
        }
    }
}

paymentSheet.presentPaymentOptions(
    this,
    "pi_1234_secret_xxx",  // client_secret from step 1
    "Al-Noor Islamic Center",
    callback
)
```

---

## ✅ Step 3: Confirm Payment (Backend Webhook Handles This)

⚠️ **You don't need to do anything here** - the backend webhook will:

1. Receive confirmation from Stripe
2. Create donation record in database
3. Generate PDF receipt
4. Send email to donor

### Optional: Poll for Confirmation (Advanced)

If you want to confirm before showing success screen:

```
GET /api/mosques/{mosque_slug}/donations/{donation_id}
```

This endpoint is not yet implemented, but we can add it if needed.

---

## 📱 Example: Complete Flow

### iOS

```swift
class DonationViewController: UIViewController {
    
    func donateNow(amount: Int, purpose: String) {
        // Step 1: Create donation intent
        let donation = [
            "amount": amount,
            "donation_type": "one_time",
            "purpose": purpose,
            "donor_name": "User Name",
            "donor_email": "user@example.com",
            "is_anonymous": false
        ]
        
        var request = URLRequest(
            url: URL(string: "http://localhost:4000/api/mosques/al-noor-houston/donations/create-intent")!
        )
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: donation)
        
        URLSession.shared.dataTask(with: request) { (data, response, error) in
            guard let data = data,
                  let response = try? JSONDecoder().decode(DonationResponse.self, from: data)
            else {
                self.showError("Failed to create donation")
                return
            }
            
            // Step 2: Show Stripe payment sheet
            DispatchQueue.main.async {
                self.showPaymentSheet(clientSecret: response.data.client_secret)
            }
        }.resume()
    }
    
    func showPaymentSheet(clientSecret: String) {
        var configuration = PaymentSheet.Configuration()
        configuration.merchantDisplayName = "Al-Noor Islamic Center"
        
        let paymentSheet = PaymentSheet(
            paymentIntentClientSecret: clientSecret,
            configuration: configuration
        )
        
        paymentSheet.present(from: self) { [weak self] paymentResult in
            switch paymentResult {
            case .completed:
                // Step 3: Show success screen
                self?.showSuccess("✅ Donation received! Receipt sent to your email.")
                
            case .canceled:
                self?.showError("Payment cancelled")
                
            case .failed(let error):
                self?.showError("Payment failed: \(error.localizedDescription)")
            }
        }
    }
}

struct DonationResponse: Codable {
    let success: Bool
    let data: DonationData
}

struct DonationData: Codable {
    let donation_id: String
    let client_secret: String
    let type: String
    let amount: Int
    let amount_display: String
}
```

---

## 🧪 Testing

### With Postman (Before Mobile Integration)

Use the Postman collection to verify backend:

```bash
# Import postman/MosqueOS.postman_collection.json
# Then test:
POST http://localhost:4000/api/mosques/al-noor-houston/donations/create-intent
```

### Test Credit Cards

Use these test cards in Stripe's test mode:

| Card | Number | Result |
|------|--------|--------|
| Visa (Success) | `4242424242424242` | ✅ Succeeds |
| Visa (Requires Auth) | `4000002500003155` | Needs 3D Secure |
| Mastercard | `5555555555554444` | ✅ Succeeds |
| Generic Decline | `4000000000000002` | ❌ Declined |

---

## 📍 Endpoints Reference

### Create Donation Intent
```
POST /api/mosques/{mosque_slug}/donations/create-intent
Body: CreateDonationIntentDto
Response: { success: true, data: DonationIntentResponse }
```

### Get Donation History (Logged In)
```
GET /api/mosques/{mosque_slug}/donations/history
Headers: Authorization: Bearer <jwt_token>
Response: DonationHistoryDto[]
```

### Cancel Subscription (Logged In)
```
DELETE /api/mosques/{mosque_slug}/donations/subscriptions/{subscription_id}
Headers: Authorization: Bearer <jwt_token>
Response: { success: true, data: { subscription_id, status: "canceled" } }
```

### Admin: List Donations
```
GET /api/mosques/{mosque_slug}/donations?page=1&limit=25
Headers: Authorization: Bearer <admin_token>
Response: { data: Donation[], pagination: { page, limit, total, pages } }
```

### Admin: Get Summary
```
GET /api/mosques/{mosque_slug}/donations/summary
Headers: Authorization: Bearer <admin_token>
Response: { mtd_total, unique_donors, active_subscriptions, ... }
```

---

## 🔑 Key Points

### ✅ Mosque Slug

The mosque slug is part of the URL:
- `al-noor-houston` - Al-Noor Islamic Center (Houston)
- `masjid-manhattan` - Masjid Manhattan (New York)
- `masjid-sf` - Islamic Center of San Francisco

Your app can:
1. Hard-code for single mosque
2. Make mosque selection part of app flow
3. Store in user preferences
4. Get from API endpoint (not yet built)

### ✅ Guest vs Authenticated Donations

**Guest Donation** (No login required):
```json
{
  "amount": 1000,
  "donation_type": "one_time",
  "purpose": "general",
  "donor_name": "John Doe",
  "donor_email": "john@example.com"
}
```

**Authenticated Donation** (User logged in):
```json
{
  "amount": 1000,
  "donation_type": "one_time",
  "purpose": "general",
  "donor_name": "John Doe",
  "donor_email": "john@example.com",
  "Authorization": "Bearer <jwt_token>"  // In header
}
```

### ✅ Donation Types

- `"one_time"` → One-time payment (PaymentIntent)
- `"monthly"` → Recurring monthly (SetupIntent + Subscription)

### ✅ Donation Purposes

Categorize donations for reporting:
- `"general"` - General mosque fund
- `"building_fund"` - Building/renovation
- `"education"` - Islamic education/school
- `"ramadan"` - Ramadan activities
- `"medical"` - Medical assistance
- `"orphans"` - Orphan support
- `"widows"` - Widow support
- `"students"` - Student scholarships
- `"other"` - Other purposes

### ✅ Error Handling

Always handle these errors:

```json
{
  "success": false,
  "error": "Validation failed",
  "messages": ["amount must be greater than or equal to 100"]
}
```

Status codes:
- `200` - Success
- `400` - Validation error (bad input)
- `404` - Mosque not found
- `500` - Server error

---

## 🚀 Integration Checklist

- [ ] Setup Stripe SDK (iOS/Android)
- [ ] Create donation request function
- [ ] Handle API response (client_secret)
- [ ] Show Stripe payment UI
- [ ] Handle payment success/failure
- [ ] Test with Postman first
- [ ] Test with test cards
- [ ] Test with real card (sandbox)
- [ ] Error handling for all cases
- [ ] Show success screen to user

---

## 📞 Backend API Status

| Feature | Status | Notes |
|---------|--------|-------|
| Create Intent | ✅ Ready | All scenarios working |
| Stripe Payment | ✅ Ready | PaymentIntent created |
| Monthly Subscriptions | ✅ Ready | SetupIntent for recurring |
| Webhook Confirmation | ✅ Ready | Webhook creates receipt |
| Receipt Generation | ✅ Ready | PDF + Email sent |
| Query History | ✅ Ready | User can see donations |
| Cancel Subscription | ✅ Ready | One-click cancellation |
| Admin Dashboard | ✅ Ready | Metrics available |

---

## 🔄 What Happens After Payment

1. User completes payment in Stripe UI
2. Stripe confirms payment
3. Backend webhook receives confirmation
4. Backend creates donation record
5. PDF receipt generated
6. Receipt emailed to donor
7. Admin dashboard updated

**Timeline**: ~10 seconds from payment completion to receipt sent

---

## 📧 Email Receipt

After successful payment, donor receives email with:
- Donation amount
- Donation date
- Mosque name
- Tax ID (if registered nonprofit)
- Donation purpose
- Message from donor (if provided)
- PDF receipt attachment

---

## 🎯 Next Steps

1. **Get test credentials** (we have them in `.env`)
2. **Import Postman collection** to verify API works
3. **Implement mobile integration** using this guide
4. **Test with test cards**
5. **Test with Stripe sandbox**
6. **Deploy to production**

---

## 📚 Related Files

- API Code: `/apps/api/src/modules/donations/`
- DTO Definition: `/apps/api/src/modules/donations/dto/create-donation-from-mobile.dto.ts`
- Postman Collection: `/postman/MosqueOS.postman_collection.json`
- Test Data: `/test/fixtures/donation-test-data.json`
- Testing Guide: `/DONATIONS_TESTING_GUIDE.md`

---

## ❓ FAQ

**Q: Do I need to handle card validation?**
A: No, Stripe SDK handles all validation

**Q: Can users see their donation history?**
A: Yes, GET `/donations/history` endpoint (requires login)

**Q: Do we charge fees?**
A: Stripe standard fees (2.9% + 30¢ per transaction in US)

**Q: Can donations be anonymous?**
A: Yes, set `is_anonymous: true`

**Q: What if payment fails?**
A: Show error message, user can try again

**Q: Do we support refunds?**
A: Not through mobile app, admin must refund in dashboard

**Q: How long to receive receipt?**
A: ~10 seconds max from payment completion

---

## 🤝 Support

Contact backend team if you need:
- Different donation purposes
- Custom error messages
- Additional API endpoints
- Test data variations
