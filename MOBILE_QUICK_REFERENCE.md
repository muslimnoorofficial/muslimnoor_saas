# 🚀 Mobile Developer Quick Reference

> Copy this into your mobile app - it has everything you need

---

## 1️⃣ Create Donation Intent

**One-time $10 donation**:
```json
POST http://localhost:4000/api/mosques/al-noor-houston/donations/create-intent

{
  "amount": 1000,
  "donation_type": "one_time",
  "purpose": "general",
  "donor_name": "John Smith",
  "donor_email": "john@example.com"
}

← Response includes client_secret ✅
```

**Monthly $25 donation**:
```json
{
  "amount": 2500,
  "donation_type": "monthly",
  "purpose": "general",
  "donor_name": "John Smith",
  "donor_email": "john@example.com"
}

← Response has setup_intent instead of payment_intent
```

---

## 2️⃣ Pass to Stripe SDK

**iOS**:
```swift
let paymentSheet = PaymentSheet(
    paymentIntentClientSecret: "pi_xxx_secret_xxx",
    configuration: configuration
)
paymentSheet.present(from: self)
```

**Android**:
```kotlin
paymentSheet.presentPaymentOptions(
    this,
    "pi_xxx_secret_xxx",
    "Al-Noor Islamic Center",
    callback
)
```

---

## 3️⃣ Success/Error Handling

✅ Success → Show "Donation received! Receipt sent to email"
❌ Error → Show error message, let user retry

---

## 📋 Valid Values

**Donation Type**:
- `"one_time"`
- `"monthly"`

**Purpose**:
- `"general"` (default)
- `"building_fund"`
- `"education"`
- `"ramadan"`
- `"medical"`
- `"orphans"`
- `"widows"`
- `"students"`
- `"other"`

**Amount Range**:
- Min: 100 cents ($1.00)
- Max: 1,000,000 cents ($10,000.00)

**Mosque Slugs** (for different mosques):
- `al-noor-houston`
- `masjid-manhattan`
- `masjid-sf`

---

## 🧪 Test Cards

| Card | Number | Expires | CVC |
|------|--------|---------|-----|
| Visa (✅) | 4242424242424242 | 12/27 | 123 |
| Mastercard (✅) | 5555555555554444 | 12/27 | 123 |
| Decline (❌) | 4000000000000002 | 12/27 | 123 |

---

## ⚠️ Common Errors

| Error | Fix |
|-------|-----|
| "amount must be >= 100" | Amount too small |
| "invalid email" | Bad email format |
| "donation_type must be..." | Use "one_time" or "monthly" |
| "Mosque not found" | Wrong mosque slug |
| "Validation failed" | Check required fields |

---

## 🔑 Required Fields

- `amount` (integer)
- `donation_type` ("one_time" or "monthly")
- `purpose` (string)
- `donor_name` (string)
- `donor_email` (string)

---

## 📱 Optional Fields

- `donor_phone` (string)
- `donor_message` (string)
- `is_anonymous` (boolean, default false)

---

## 🎯 Complete Example (Swift)

```swift
import StripePaymentSheet

func donate() {
    let donation = [
        "amount": 1000,
        "donation_type": "one_time",
        "purpose": "general",
        "donor_name": "John Smith",
        "donor_email": "john@example.com",
        "is_anonymous": false
    ]
    
    var request = URLRequest(url: URL(string: 
        "http://localhost:4000/api/mosques/al-noor-houston/donations/create-intent"
    )!)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try! JSONSerialization.data(withJSONObject: donation)
    
    URLSession.shared.dataTask(with: request) { data, _, _ in
        let response = try! JSONDecoder().decode(Response.self, from: data!)
        let clientSecret = response.data.client_secret
        
        DispatchQueue.main.async {
            var config = PaymentSheet.Configuration()
            config.merchantDisplayName = "Al-Noor Islamic Center"
            
            let paymentSheet = PaymentSheet(
                paymentIntentClientSecret: clientSecret,
                configuration: config
            )
            
            paymentSheet.present(from: self) { result in
                switch result {
                case .completed:
                    print("✅ Success!")
                case .failed(let error):
                    print("❌ Error: \(error)")
                case .canceled:
                    print("Canceled")
                }
            }
        }
    }.resume()
}

struct Response: Codable {
    struct Data: Codable {
        let client_secret: String
    }
    let data: Data
}
```

---

## 🎯 Complete Example (Kotlin)

```kotlin
import okhttp3.*
import org.json.JSONObject

fun donate() {
    val json = JSONObject()
    json.put("amount", 1000)
    json.put("donation_type", "one_time")
    json.put("purpose", "general")
    json.put("donor_name", "John Smith")
    json.put("donor_email", "john@example.com")
    
    val request = Request.Builder()
        .url("http://localhost:4000/api/mosques/al-noor-houston/donations/create-intent")
        .post(RequestBody.create(
            MediaType.get("application/json"),
            json.toString()
        ))
        .build()
    
    OkHttpClient().newCall(request).enqueue(object : Callback {
        override fun onFailure(call: Call, e: IOException) {
            Log.e("Donation", "Error", e)
        }
        
        override fun onResponse(call: Call, response: Response) {
            val body = response.body!!.string()
            val json = JSONObject(body)
            val clientSecret = json
                .getJSONObject("data")
                .getString("client_secret")
            
            Stripe.showPaymentSheet(
                context = this@MainActivity,
                clientSecret = clientSecret,
                merchantName = "Al-Noor Islamic Center"
            )
        }
    })
}
```

---

## 🔗 Links

- Full Mobile Guide: `/MOBILE_APP_INTEGRATION.md`
- Postman Collection: `/postman/MosqueOS.postman_collection.json`
- API Code: `/apps/api/src/modules/donations/`

---

## ✅ Checklist

- [ ] Setup Stripe SDK
- [ ] Create donation request
- [ ] Parse client_secret
- [ ] Show PaymentSheet
- [ ] Handle success
- [ ] Handle errors
- [ ] Test with test cards
- [ ] Show receipt message

---

## 📞 Questions?

See `/MOBILE_APP_INTEGRATION.md` for full details
