# Razorpay Payment Integration Guide

Complete guide for integrating Razorpay payment gateway in your InstaSupply backend.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Setup Instructions](#setup-instructions)
3. [API Endpoints](#api-endpoints)
4. [Frontend Integration](#frontend-integration)
5. [Testing](#testing)
6. [Switching to Live Keys](#switching-to-live-keys)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Razorpay integration allows your application to accept payments in **INR (Indian Rupees)** and **USD (US Dollars)**. The integration includes:

- ✅ Order creation for payment processing
- ✅ Secure payment verification using HMAC SHA256 signatures
- ✅ Payment status tracking
- ✅ Payment cancellation support
- ✅ Support for multiple currencies (INR and USD)

---

## ⚙️ Setup Instructions

### Step 1: Install Razorpay Package

The Razorpay package is already installed. If you need to reinstall:

```bash
npm install razorpay
```

### Step 2: Get Razorpay API Keys

#### For Testing (Test Mode):

1. Sign up at [https://razorpay.com/](https://razorpay.com/)
2. Go to **Dashboard → Settings → API Keys**
3. Click **"Generate Test Key"** if you haven't already
4. Copy the **Key ID** and **Key Secret**

#### For Production (Live Mode):

1. Complete KYC verification on your Razorpay account
2. Go to **Dashboard → Settings → API Keys**
3. Click **"Generate Live Key"**
4. Copy the **Key ID** and **Key Secret**

### Step 3: Add Keys to .env File

Add these lines to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

**Important:**
- For testing, use keys starting with `rzp_test_`
- For production, use keys starting with `rzp_live_`
- Never commit your `.env` file to version control!

### Step 4: Restart Server

After adding the keys, restart your server:

```bash
npm start
```

---

## 🔌 API Endpoints

### 1. Create Razorpay Order

**Endpoint:** `POST /api/payments/create-order`

**Description:** Creates a Razorpay order for payment processing.

**Request:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "currency": "INR"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Razorpay order created successfully",
  "order": {
    "id": "order_M1234567890",
    "amount": 50000,
    "currency": "INR",
    "receipt": "INS0001",
    "status": "created"
  },
  "key": "rzp_test_xxxxxxxxxxxxx",
  "orderId": "507f1f77bcf86cd799439011",
  "orderNumber": "INS0001"
}
```

**Notes:**
- `currency` can be `"INR"` or `"USD"` (default: `"INR"`)
- Amount is automatically converted to smallest currency unit (paise for INR, cents for USD)
- Example: ₹500 = 50000 paise, $5 = 500 cents

---

### 2. Verify Payment

**Endpoint:** `POST /api/payments/verify`

**Description:** Verifies payment signature after successful payment.

**Request:**
```json
{
  "razorpay_order_id": "order_M1234567890",
  "razorpay_payment_id": "pay_M1234567890",
  "razorpay_signature": "abc123def456ghi789...",
  "orderId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "INS0001",
    "paymentStatus": "completed",
    "totalAmount": 500,
    "currency": "INR"
  },
  "payment": {
    "id": "pay_M1234567890",
    "amount": 50000,
    "currency": "INR",
    "status": "captured",
    "method": "card"
  }
}
```

---

### 3. Store Payment ID (Manual)

**Endpoint:** `POST /api/payments/store-payment-id`

**Description:** Manually store Razorpay payment ID for an order. This is useful when:
- Payment was completed but verification endpoint wasn't called
- You only have the payment ID from Razorpay dashboard
- Manual payment reconciliation is needed
- Payment webhook integration

**Request:**
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "razorpayPaymentId": "pay_M1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment ID stored successfully",
  "order": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "INS0001",
    "razorpayPaymentId": "pay_M1234567890",
    "paymentStatus": "completed",
    "paymentMethod": {
      "type": "Credit Card",
      "last4": "1234",
      "brand": "Visa"
    }
  }
}
```

**What It Does:**
- ✅ Verifies payment exists in Razorpay
- ✅ Checks payment status (must be "captured" or "authorized")
- ✅ Stores payment ID in order and payment history
- ✅ Updates payment status to "completed"
- ✅ Sets payment method and card details automatically
- ✅ Confirms order if status is "New Order" or "Pending"

---

### 4. Get Payment Status

**Endpoint:** `GET /api/payments/status/:orderId`

**Description:** Get current payment status of an order.

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "507f1f77bcf86cd799439011",
    "orderNumber": "INS0001",
    "totalAmount": 500,
    "currency": "INR",
    "paymentStatus": "completed",
    "razorpayOrderId": "order_M1234567890"
  },
  "payment": {
    "id": "pay_M1234567890",
    "amount": 50000,
    "currency": "INR",
    "status": "captured",
    "method": "card"
  }
}
```

---

### 5. Cancel Payment

**Endpoint:** `POST /api/payments/cancel`

**Description:** Cancel a pending payment.

**Request:**
```json
{
  "orderId": "507f1f77bcf86cd799439011"
}
```

---

## 💻 Frontend Integration

### Step 1: Include Razorpay Checkout Script

Add this script tag to your HTML:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Step 2: Create Payment Flow

```javascript
// 1. Create order first (call your backend API)
async function createPaymentOrder(orderId, currency = 'INR') {
  const response = await fetch('http://localhost:3000/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${yourAuthToken}`
    },
    body: JSON.stringify({
      orderId: orderId,
      currency: currency
    })
  });
  
  const data = await response.json();
  return data;
}

// 2. Initialize Razorpay Checkout
async function initiatePayment(orderId, currency = 'INR') {
  try {
    const paymentData = await createPaymentOrder(orderId, currency);
    
    const options = {
      key: paymentData.key, // Razorpay Key ID from backend
      amount: paymentData.order.amount, // Amount in paise/cents
      currency: paymentData.order.currency, // INR or USD
      name: "InstaSupply",
      description: `Order ${paymentData.orderNumber}`,
      order_id: paymentData.order.id, // Razorpay Order ID
      
      handler: async function (response) {
        // This function is called after successful payment
        // IMPORTANT: Capture ALL fields from Razorpay response
        console.log('Razorpay Payment Response:', response);
        
        // Verify payment with backend
        await verifyPayment({
          razorpay_order_id: response.razorpay_order_id,  // From Razorpay
          razorpay_payment_id: response.razorpay_payment_id,  // From Razorpay
          razorpay_signature: response.razorpay_signature,  // From Razorpay (if available)
          orderId: paymentData.orderId  // Your database order ID
        });
      },
      
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999"
      },
      
      theme: {
        color: "#3399cc"
      },
      
      modal: {
        ondismiss: function() {
          console.log("Payment cancelled by user");
        }
      }
    };
    
    const razorpay = new Razorpay(options);
    razorpay.open();
    
  } catch (error) {
    console.error('Payment initiation failed:', error);
    alert('Failed to initiate payment. Please try again.');
  }
}

// 3. Verify payment after success
async function verifyPayment(paymentData) {
  try {
    // If signature is missing, you can still verify using just payment_id
    const verifyData = {
      razorpay_payment_id: paymentData.razorpay_payment_id,
      orderId: paymentData.orderId
    };
    
    // Add signature if available (recommended for security)
    if (paymentData.razorpay_signature) {
      verifyData.razorpay_signature = paymentData.razorpay_signature;
    }
    if (paymentData.razorpay_order_id) {
      verifyData.razorpay_order_id = paymentData.razorpay_order_id;
    }
    
    console.log('Verifying payment with data:', verifyData);
    
    const response = await fetch('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourAuthToken}`
      },
      body: JSON.stringify(verifyData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Payment successful!');
      // Redirect to success page or update UI
      window.location.href = '/order-success';
    } else {
      alert('Payment verification failed: ' + result.message);
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    alert('Payment verification failed. Please contact support.');
  }
}

// Alternative: If you don't have signature, use this simpler version
async function verifyPaymentWithoutSignature(paymentId, orderId) {
  try {
    const response = await fetch('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourAuthToken}`
      },
      body: JSON.stringify({
        razorpay_payment_id: paymentId,
        orderId: orderId
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
}

// Usage
initiatePayment('507f1f77bcf86cd799439011', 'INR');
```

### Alternative: Store Payment ID Manually

If you only have the payment ID (e.g., from Razorpay dashboard or webhook), you can store it directly:

```javascript
// Store payment ID after payment is completed
async function storePaymentId(orderId, paymentId) {
  try {
    const response = await fetch('http://localhost:3000/api/payments/store-payment-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourAuthToken}`
      },
      body: JSON.stringify({
        orderId: orderId,
        razorpayPaymentId: paymentId
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Payment ID stored successfully!');
      console.log('Payment Method:', result.order.paymentMethod);
    } else {
      console.error('Failed to store payment ID:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error storing payment ID:', error);
    throw error;
  }
}

// Usage
storePaymentId('507f1f77bcf86cd799439011', 'pay_M1234567890');
```

---

## 🧪 Testing

### Test Cards (Test Mode Only)

Razorpay provides test cards for testing:

**Success Cards:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure Cards:**
- Card Number: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

**3D Secure Cards:**
- Card Number: `4012 0010 3714 1112`
- CVV: Any 3 digits
- Expiry: Any future date

### Test Flow

1. Create an order using `POST /api/orders`
2. Create Razorpay order using `POST /api/payments/create-order`
3. Use test card in Razorpay checkout
4. Verify payment using `POST /api/payments/verify`
5. Check payment status using `GET /api/payments/status/:orderId`

---

## 🚀 Switching to Live Keys

### Step 1: Complete KYC

1. Log in to Razorpay Dashboard
2. Complete KYC verification (if not done)
3. Activate your account

### Step 2: Generate Live Keys

1. Go to **Dashboard → Settings → API Keys**
2. Click **"Generate Live Key"**
3. Copy the **Key ID** and **Key Secret**

### Step 3: Update .env File

Replace test keys with live keys:

```env
# Before (Test)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxxxxxxxxxxx

# After (Live)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=live_secret_xxxxxxxxxxxxx
```

### Step 4: Restart Server

```bash
npm start
```

**Important Notes:**
- Test keys only work in test mode
- Live keys only work in production
- Never mix test and live keys
- Always test thoroughly before going live

---

## ✅ Best Practices

### 1. Security

- ✅ **Never expose** `RAZORPAY_KEY_SECRET` in frontend code
- ✅ Always verify payment signatures on backend
- ✅ Use HTTPS in production
- ✅ Store keys securely in `.env` file
- ✅ Never commit `.env` to version control

### 2. Error Handling

- ✅ Always handle payment failures gracefully
- ✅ Show user-friendly error messages
- ✅ Log errors for debugging
- ✅ Implement retry logic for network failures

### 3. Payment Flow

- ✅ Create Razorpay order only after order is confirmed
- ✅ Verify payment immediately after success
- ✅ Update order status after verification
- ✅ Handle payment cancellation properly

### 4. Currency Handling

- ✅ Always convert amount to smallest currency unit
- ✅ INR: Amount × 100 (₹500 = 50000 paise)
- ✅ USD: Amount × 100 ($5 = 500 cents)
- ✅ Display amount correctly in UI

### 5. Testing

- ✅ Test with test cards before going live
- ✅ Test all payment methods (card, UPI, wallet, etc.)
- ✅ Test payment failures and cancellations
- ✅ Test signature verification

---

## 🔧 Troubleshooting

### Problem: "Razorpay credentials are missing"

**Solution:**
- Check if `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in `.env`
- Restart server after adding keys
- Verify keys are correct (no extra spaces)

### Problem: "Payment verification failed. Invalid signature."

**Solution:**
1. **Check Environment Variables:**
   - Verify `RAZORPAY_KEY_SECRET` in `.env` file is correct
   - Ensure no extra spaces or quotes around the secret
   - Restart server after changing `.env`

2. **Match Test/Live Keys:**
   - Test payments require test keys (`rzp_test_...`)
   - Live payments require live keys (`rzp_live_...`)
   - Never mix test and live keys

3. **Verify Frontend Data:**
   ```javascript
   // Ensure you're sending exact values from Razorpay response
   const verifyData = {
     razorpay_order_id: response.razorpay_order_id.trim(),  // Remove spaces
     razorpay_payment_id: response.razorpay_payment_id.trim(),
     razorpay_signature: response.razorpay_signature.trim(),
     orderId: yourOrderId
   };
   ```

4. **Enable Debug Mode:**
   - Set `NODE_ENV=development` in `.env`
   - Check server console for detailed signature comparison
   - Compare generated vs received signatures

5. **Common Mistakes:**
   - ❌ Using wrong key secret (test vs live)
   - ❌ Extra spaces in signature
   - ❌ Not trimming values from frontend
   - ❌ Using expired or invalid payment ID
   - ❌ Server not restarted after changing `.env`

### Problem: "Order not found"

**Solution:**
- Verify the `orderId` exists in database
- Check if order belongs to the authenticated supplier
- Ensure order was created before creating Razorpay order

### Problem: "Payment already completed"

**Solution:**
- Check payment status before creating new Razorpay order
- Use `GET /api/payments/status/:orderId` to check status

### Problem: Amount mismatch

**Solution:**
- Ensure amount is converted to smallest currency unit
- INR: Multiply by 100 (₹500 = 50000)
- USD: Multiply by 100 ($5 = 500)
- Verify order total amount matches Razorpay order amount

---

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Checkout Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Test Cards](https://razorpay.com/docs/payments/payment-gateway/test-cards/)

---

## 🎉 You're All Set!

Your Razorpay integration is complete. You can now:

- ✅ Accept payments in INR and USD
- ✅ Create Razorpay orders
- ✅ Verify payments securely
- ✅ Track payment status
- ✅ Handle payment cancellations

For any issues or questions, refer to the troubleshooting section or Razorpay documentation.

