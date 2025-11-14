# API Request Examples

Complete examples of all API requests with request bodies and expected responses.

---

## 🔐 Authentication APIs

### 1. Register New User

**Request:**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email."
}
```

---

### 2. Verify OTP and Login

**Request:**
```http
POST http://localhost:3000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "profileImage": null
  }
}
```

**Note:** Save the `token` - you'll need it for protected routes!

---

### 3. Request New OTP

**Request:**
```http
POST http://localhost:3000/api/auth/request-otp
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email."
}
```

---

### 4. Logout

**Request:**
```http
POST http://localhost:3000/api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 5. Change Email During Verification

**Request:**
```http
POST http://localhost:3000/api/auth/change-email
Content-Type: application/json

{
  "oldEmail": "john@example.com",
  "newEmail": "john.new@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email changed successfully. OTP sent to new email.",
  "newEmail": "john.new@example.com"
}
```

**Note:** This endpoint allows users to change their email address before completing OTP verification. A new OTP will be sent to the new email address.

---

### 6. Create Test Users (For Testing Only)

**Request:**
```http
POST http://localhost:3000/api/auth/create-test-users
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Created 5 test user(s)",
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Urban Supply Co.",
      "email": "urban.supply@test.com",
      "phone": "+1-555-0101",
      "otp": "1234",
      "message": "OTP sent to email"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Builders Depot",
      "email": "builders.depot@test.com",
      "phone": "+1-555-0102",
      "otp": "5678",
      "message": "OTP sent to email"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "name": "Hardware Plus",
      "email": "hardware.plus@test.com",
      "phone": "+1-555-0103",
      "otp": "9012",
      "message": "OTP sent to email"
    },
    {
      "id": "507f1f77bcf86cd799439014",
      "name": "Contractor Supply",
      "email": "contractor.supply@test.com",
      "phone": "+1-555-0104",
      "otp": "3456",
      "message": "OTP sent to email"
    },
    {
      "id": "507f1f77bcf86cd799439015",
      "name": "Pro Tools & Materials",
      "email": "pro.tools@test.com",
      "phone": "+1-555-0105",
      "otp": "7890",
      "message": "OTP sent to email"
    }
  ],
  "note": "All test users have password: Test123!"
}
```

**Note:** This endpoint creates 5 pre-configured test supplier accounts for testing purposes. All test users have the password `Test123!`. The OTP is included in the response for easy testing. If a user already exists, it will be skipped and listed in the `errors` array.

---

## 👤 User Profile APIs

### 5. Get Current User

**Request:**
```http
GET http://localhost:3000/api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "profileImage": "https://res.cloudinary.com/.../profile.jpg"
  }
}
```

---

### 6. Update Profile

**Request:**
```http
PUT http://localhost:3000/api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "9876543210",
  "businessInfo": {
    "registrationNumber": "REG123456",
    "taxId": "TAX789",
    "businessType": "LLC",
    "establishedDate": "2020-01-15"
  },
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "9876543210",
    "businessInfo": { ... },
    "address": { ... }
  }
}
```

---

### 7. Upload Profile Image

**Request:**
```http
POST http://localhost:3000/api/users/upload-profile-image
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT - Postman Setup Instructions:**

1. **Method:** Select `POST`
2. **URL:** Enter the endpoint URL
3. **Headers:** 
   - Add `Authorization: Bearer YOUR_TOKEN`
   - **DO NOT manually add `Content-Type` header** - Postman will add it automatically with the boundary parameter
4. **Body Tab:**
   - Select `form-data` (NOT `raw` or `x-www-form-urlencoded`)
   - Add a new field:
     - **Key:** `image` (must be exactly "image")
     - **Type:** Change from "Text" to "File" (click the dropdown next to the key)
     - **Value:** Click "Select Files" and choose your image file
5. **Send** the request

**Response:**
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/.../profile.jpg",
  "user": { ... }
}
```

---

### 8. Get Detailed Profile Info

**Request:**
```http
GET http://localhost:3000/api/users/profile-info
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "name": "John Doe",
    "profileImage": "https://res.cloudinary.com/.../profile.jpg",
    "businessInfo": { ... },
    "businessType": "LLC",
    "contactInfo": {
      "email": "john@example.com",
      "phone": "1234567890",
      "website": ""
    },
    "address": { ... },
    "businessHours": { ... },
    "metrics": {
      "rating": 4.5,
      "onTimePercentage": 95,
      "totalSupplied": 1500,
      "joinDate": "2024-01-15T00:00:00.000Z"
    }
  }
}
```

---

## 📦 Product APIs

### 9. Get All Products

**Request:**
```http
GET http://localhost:3000/api/products?page=1&limit=20&category=Tools&search=hammer&minPrice=10&maxPrice=100&stockStatus=inStock&sortBy=best-selling
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `category` - Filter by category
- `search` - Search in name/description
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `stockStatus` - Filter by stock (inStock, lowStock, outOfStock)
- `sortBy` - Sort order (newest, price-low-to-high, price-high-to-low, best-selling)

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Hammer",
      "category": "Tools",
      "description": "Heavy duty hammer",
      "price": 25.99,
      "stock": 50,
      "lowStockThreshold": 10,
      "soldQuantity": 150,
      "image": "https://res.cloudinary.com/.../hammer.jpg",
      "images": ["https://res.cloudinary.com/.../hammer1.jpg"],
      "discount": 10,
      "unit": "Piece",
      "specifications": [
        { "name": "Weight", "value": "2.5 lbs" },
        { "name": "Material", "value": "Steel" }
      ],
      "deliveryOptions": {
        "availableForDelivery": true,
        "availableForPickup": true
      },
      "ranking": {
        "position": 1,
        "category": "Tools",
        "tags": ["Best Seller", "Top Rated"]
      },
      "stockStatus": "inStock",
      "isLowStock": false,
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 10. Get Single Product

**Request:**
```http
GET http://localhost:3000/api/products/507f1f77bcf86cd799439011
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Hammer",
    "category": "Tools",
    "description": "Heavy duty hammer",
    "price": 25.99,
    "stock": 50,
    "lowStockThreshold": 10,
    "soldQuantity": 150,
    "image": "https://res.cloudinary.com/.../hammer.jpg",
    "images": ["https://res.cloudinary.com/.../hammer1.jpg"],
    "discount": 10,
    "unit": "Piece",
    "specifications": [
      { "name": "Weight", "value": "2.5 lbs" }
    ],
    "deliveryOptions": {
      "availableForDelivery": true,
      "availableForPickup": true
    },
    "ranking": {
      "position": 1,
      "category": "Tools",
      "tags": ["Best Seller"]
    },
    "stockStatus": "inStock",
    "isLowStock": false,
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 11. Create Product

**Request:**
```http
POST http://localhost:3000/api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Screwdriver Set",
  "category": "Tools",
  "description": "Professional screwdriver set with 10 pieces",
  "price": 39.99,
  "stock": 100,
  "lowStockThreshold": 20,
  "discount": 15,
  "unit": "Set",
  "specifications": [
    { "name": "Pieces", "value": "10" },
    { "name": "Material", "value": "Chrome Vanadium" }
  ],
  "deliveryOptions": {
    "availableForDelivery": true,
    "availableForPickup": true
  },
  "ranking": {
    "tags": ["Popular"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Screwdriver Set",
    "category": "Tools",
    "price": 39.99,
    "stock": 100,
    "soldQuantity": 0,
    "discount": 15,
    "unit": "Set",
    "specifications": [ ... ],
    "deliveryOptions": { ... },
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 12. Update Product

**Request:**
```http
PUT http://localhost:3000/api/products/507f1f77bcf86cd799439012
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Screwdriver Set Pro",
  "price": 44.99,
  "stock": 80,
  "discount": 20
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Screwdriver Set Pro",
    "price": 44.99,
    "stock": 80,
    "discount": 20,
    ...
  }
}
```

---

### 13. Delete Product

**Request:**
```http
DELETE http://localhost:3000/api/products/507f1f77bcf86cd799439012
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 14. Upload Product Image (Single)

**Request:**
```http
POST http://localhost:3000/api/products/507f1f77bcf86cd799439012/upload-image
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT - Postman Setup Instructions:**

1. **Method:** Select `POST`
2. **URL:** Enter the endpoint URL
3. **Headers:** 
   - Add `Authorization: Bearer YOUR_TOKEN`
   - **DO NOT manually add `Content-Type` header** - Postman will add it automatically with the boundary parameter
4. **Body Tab:**
   - Select `form-data` (NOT `raw` or `x-www-form-urlencoded`)
   - Add a new field:
     - **Key:** `image` (must be exactly "image")
     - **Type:** Change from "Text" to "File" (click the dropdown next to the key)
     - **Value:** Click "Select Files" and choose your image file
5. **Send** the request

**Response:**
```json
{
  "success": true,
  "message": "Product image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/.../product.jpg",
  "product": { ... }
}
```

### 15. Upload Multiple Product Images

**Request:**
```http
POST http://localhost:3000/api/products/507f1f77bcf86cd799439012/upload-images
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT - Postman Setup Instructions:**

1. **Method:** Select `POST`
2. **URL:** Enter the endpoint URL
3. **Headers:** 
   - Add `Authorization: Bearer YOUR_TOKEN`
   - **DO NOT manually add `Content-Type` header** - Postman will add it automatically
4. **Body Tab:**
   - Select `form-data` (NOT `raw` or `x-www-form-urlencoded`)
   - Add multiple fields, each with:
     - **Key:** `images` (must be exactly "images" - same key for all files)
     - **Type:** Change from "Text" to "File" (click the dropdown next to each key)
     - **Value:** Click "Select Files" and choose your image file
   - You can add up to 6 images total
   - **Tip:** You can add multiple files with the same key name `images` - Postman will send them as an array

**Example Postman Body Setup:**
```
Key: images | Type: File | Value: [Select File] image1.jpg
Key: images | Type: File | Value: [Select File] image2.jpg
Key: images | Type: File | Value: [Select File] image3.jpg
```

**Response:**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "images": [
    "https://res.cloudinary.com/.../image1.jpg",
    "https://res.cloudinary.com/.../image2.jpg",
    "https://res.cloudinary.com/.../image3.jpg"
  ],
  "product": { ... }
}
```

---

### 16. Delete Product Image

**Request:**
```http
DELETE http://localhost:3000/api/products/507f1f77bcf86cd799439012/images/0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "product": { ... }
}
```

---

### 17. Get All Categories

**Request:**
```http
GET http://localhost:3000/api/products/categories
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "categories": [
    "Tools",
    "Hardware",
    "Electrical",
    "Plumbing",
    "Paint"
  ]
}
```

---

## 🛒 Order APIs

### 18. Get All Orders

**Request:**
```http
GET http://localhost:3000/api/orders?status=New Order&search=ORD123&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `status` - Filter by status (All, New Order, Processing, etc.)
- `search` - Search by order number, customer name, or email
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "507f1f77bcf86cd799439013",
      "orderNumber": "ORD-2024-001",
      "customerName": "Jane Smith",
      "customerEmail": "jane@example.com",
      "customerPhone": "555-1234",
      "status": "New Order",
      "customerType": "Contractor",
      "items": [
        {
          "productId": "507f1f77bcf86cd799439011",
          "productName": "Hammer",
          "quantity": 2,
          "price": 25.99
        }
      ],
      "subtotal": 51.98,
      "tax": 4.16,
      "shipping": 5.00,
      "totalAmount": 61.14,
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalOrders": 50,
    "hasNext": true,
    "hasPrev": false
  },
  "statusCounts": {
    "All": 50,
    "New Order": 10,
    "Processing": 15,
    "Ready": 5,
    "Completed": 20
  }
}
```

---

### 19. Get Recent Orders

**Request:**
```http
GET http://localhost:3000/api/orders/recent?limit=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "507f1f77bcf86cd799439013",
      "orderNumber": "ORD-2024-001",
      "customerName": "Jane Smith",
      "status": "New Order",
      "totalAmount": 61.14,
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

---

### 20. Get Single Order

**Request:**
```http
GET http://localhost:3000/api/orders/507f1f77bcf86cd799439013
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "507f1f77bcf86cd799439013",
    "orderNumber": "ORD-2024-001",
    "customerName": "Jane Smith",
    "customerEmail": "jane@example.com",
    "customerPhone": "555-1234",
    "status": "New Order",
    "customerType": "Contractor",
    "items": [ ... ],
    "subtotal": 51.98,
    "tax": 4.16,
    "shipping": 5.00,
    "totalAmount": 61.14,
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 21. Create Order

**Request:**
```http
POST http://localhost:3000/api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "customerPhone": "555-1234",
  "customerType": "Contractor",
  "items": [
    {
      "productId": "69160f0a2f6b77274a2eceaf",
      "quantity": 2
    }
  ]
}
```

**Important Notes:**
1. **Use a real product ID** that belongs to your logged-in supplier account
2. **Only send `productId` and `quantity`** - the API will automatically:
   - Fetch product details (name, price) from the database
   - Calculate subtotals and total amount
   - Validate stock availability
3. **Do NOT send `productName` or `price`** - these are ignored and fetched from the database
4. **Do NOT send `subtotal`, `tax`, `shipping`, or `totalAmount`** - these are calculated automatically
5. The API validates:
   - Product exists and belongs to your account
   - Product is active
   - Sufficient stock available
   - Valid product ID format

**Optional Fields:**
- `deliveryAddress` - Delivery address
- `deliveryMethod` - "Standard Delivery", "Express Delivery", or "Pickup" (default: "Standard Delivery")
- `deliveryTime` - Delivery time slot
- `paymentMethod` - Payment method object
- `notes` - Order notes

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "507f1f77bcf86cd799439013",
    "orderNumber": "ORD-2024-001",
    "customerName": "Jane Smith",
    "status": "New Order",
    "totalAmount": 61.14,
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 22. Update Order Status

**Request:**
```http
PUT http://localhost:3000/api/orders/507f1f77bcf86cd799439013/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "Processing"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "id": "507f1f77bcf86cd799439013",
    "status": "Processing",
    ...
  }
}
```

---

### 23. Update Order

**Request:**
```http
PUT http://localhost:3000/api/orders/507f1f77bcf86cd799439013
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "customerName": "Jane Doe",
  "customerPhone": "555-5678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "order": { ... }
}
```

---

### 24. Delete Order

**Request:**
```http
DELETE http://localhost:3000/api/orders/507f1f77bcf86cd799439013
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

---

## 📊 Dashboard APIs

### 25. Get Dashboard Summary

**Request:**
```http
GET http://localhost:3000/api/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "totalSales": 15000.50,
    "totalOrders": 150,
    "averageRating": 4.5,
    "storeStatus": "Open",
    "recentOrders": [ ... ],
    "lowStockProducts": [ ... ]
  }
}
```

---

**Note:** Additional dashboard endpoints (KPIs, Sales Overview, Top Products, Customer Demographics) are available in the analytics endpoint response.

---

## 🏪 Store Settings APIs

### 26. Get Store Settings

**Request:**
```http
GET http://localhost:3000/api/store/settings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "settings": {
    "operatingHours": {
      "monday": { "open": "09:00", "close": "18:00", "isOpen": true },
      "tuesday": { "open": "09:00", "close": "18:00", "isOpen": true }
    },
    "storeStatus": "Open",
    "rating": 4.5
  }
}
```

---

### 27. Update Store Settings

**Request:**
```http
PUT http://localhost:3000/api/store/settings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "operatingHours": {
    "monday": { "open": "09:00", "close": "18:00", "isOpen": true },
    "tuesday": { "open": "09:00", "close": "18:00", "isOpen": true }
  },
  "storeStatus": "Open"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Store settings updated successfully",
  "settings": { ... }
}
```

---

## ⭐ Review APIs

### 28. Get All Reviews

**Request:**
```http
GET http://localhost:3000/api/reviews?rating=5&sortBy=recent&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `rating` - Filter by rating (1-5)
- `sortBy` - Sort order (recent, highest, lowest)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "id": "507f1f77bcf86cd799439014",
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Hammer",
      "customerName": "John Customer",
      "rating": 5,
      "comment": "Great product!",
      "images": ["https://res.cloudinary.com/.../review1.jpg"],
      "companyReply": {
        "message": "Thank you for your feedback!",
        "repliedAt": "2024-01-15T00:00:00.000Z"
      },
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 29. Get Review Summary

**Request:**
```http
GET http://localhost:3000/api/reviews/summary
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalReviews": 100,
    "averageRating": 4.5,
    "ratingDistribution": {
      "5": 60,
      "4": 25,
      "3": 10,
      "2": 3,
      "1": 2
    }
  }
}
```

---

### 30. Create Review (Supplier-Based)

**⚠️ IMPORTANT:** Reviews are for **suppliers/stores**, NOT individual products. A customer reviews the entire supplier experience.

**Request (Without Images):**
```http
POST http://localhost:3000/api/reviews
Content-Type: application/json

{
  "supplierId": "507f1f77bcf86cd799439011",
  "customerName": "John Customer",
  "customerEmail": "john@example.com",
  "rating": 5,
  "comment": "Excellent service and quality products! Highly recommend this supplier."
}
```

**Note:** You can use any of these field names for the review comment text:
- `comment` (recommended)
- `reviewText`
- `replyText`

All of these will be saved as `reviewText` in the database.

**Request (With Images - Use form-data in Postman):**
```http
POST http://localhost:3000/api/reviews
Content-Type: multipart/form-data
```

**⚠️ Postman Setup for Review with Images:**

1. **Method:** Select `POST`
2. **URL:** Enter the endpoint URL
3. **Body Tab:**
   - Select `form-data` (NOT `raw` JSON)
   - Add these fields:
     - **Key:** `supplierId` | **Type:** Text | **Value:** `507f1f77bcf86cd799439011`
     - **Key:** `customerName` | **Type:** Text | **Value:** `John Customer`
     - **Key:** `customerEmail` | **Type:** Text | **Value:** `john@example.com` (optional)
     - **Key:** `rating` | **Type:** Text | **Value:** `5`
     - **Key:** `comment` | **Type:** Text | **Value:** `Excellent service!`
     - **Key:** `images` | **Type:** File | **Value:** [Select File] image1.jpg
     - **Key:** `images` | **Type:** File | **Value:** [Select File] image2.jpg
     - (You can add up to 5 images with the same key name `images`)

**Response:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "review": {
    "_id": "507f1f77bcf86cd799439014",
    "supplier": "507f1f77bcf86cd799439011",
    "customerName": "John Customer",
    "customerEmail": "john@example.com",
    "rating": 5,
    "reviewText": "Excellent service and quality products! Highly recommend this supplier.",
    "images": [
      "https://res.cloudinary.com/.../image1.jpg",
      "https://res.cloudinary.com/.../image2.jpg"
    ],
    "isVisible": true,
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

**Note:** 
- Reviews are **supplier-based**, not product-based
- `supplierId` is the ID of the supplier/store being reviewed
- Images are optional (up to 5 images)
- Rating must be between 1 and 5
- No authentication required - customers can review suppliers publicly

---

### 31. Add Reply to Review

**Request:**
```http
POST http://localhost:3000/api/reviews/507f1f77bcf86cd799439014/reply
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "replyText": "Thank you for your feedback! We're glad you're happy with our service.",
  "companyName": "Urban Supply Co."
}
```

**Note:** You can use either `replyText` or `message` field. `companyName` is optional - if not provided, it will use the supplier's name.

**Alternative Request (using "message"):**
```json
{
  "message": "Thank you for your feedback! We're glad you're happy with our service."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply added successfully",
  "review": {
    "_id": "507f1f77bcf86cd799439014",
    "supplier": "...",
    "customerName": "John Customer",
    "rating": 5,
    "reviewText": "Excellent service!",
    "reply": {
      "companyName": "Urban Supply Co.",
      "replyText": "Thank you for your feedback! We're glad you're happy with our service.",
      "createdAt": "2024-01-15T00:00:00.000Z"
    },
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

## 🎯 Campaign APIs

### 32. Get All Campaigns

**Request:**
```http
GET http://localhost:3000/api/campaigns?status=active&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": "507f1f77bcf86cd799439015",
      "name": "Summer Sale",
      "description": "20% off all tools",
      "status": "active",
      "startDate": "2024-06-01",
      "endDate": "2024-08-31",
      "products": ["507f1f77bcf86cd799439011"],
      "metrics": {
        "views": 1000,
        "clicks": 200,
        "conversions": 50
      }
    }
  ],
  "pagination": { ... }
}
```

---

### 33. Create Campaign

**Request:**
```http
POST http://localhost:3000/api/campaigns
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Summer Sale",
  "products": ["507f1f77bcf86cd799439011"],
  "dailyBudget": 50.00,
  "startDate": "2024-06-01",
  "endDate": "2024-08-31"
}
```

**Required Fields:**
- `name` - Campaign name
- `products` - Array of product IDs (at least one product required)
- `dailyBudget` - Daily budget amount (must be greater than 0)

**Optional Fields:**
- `startDate` - Campaign start date (defaults to current date if not provided)
- `endDate` - Campaign end date (optional)

**Note:** 
- `status` is automatically set to "Active" when creating a campaign
- All products must belong to the authenticated supplier
- `dailyBudget` must be a positive number

**Response:**
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "campaign": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "Summer Sale",
    "supplier": "507f1f77bcf86cd799439011",
    "products": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Hammer",
        "image": "https://...",
        "price": 25.99
      }
    ],
    "dailyBudget": 50,
    "totalBudgetSpent": 0,
    "status": "Active",
    "impressions": 0,
    "clicks": 0,
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-08-31T00:00:00.000Z",
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

## 🔔 Notification APIs

### 34. Get All Notifications

**Request:**
```http
GET http://localhost:3000/api/notifications?type=order&read=false&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `type` - Filter by type (order, alert, system)
- `read` - Filter by read status (true/false)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "507f1f77bcf86cd799439016",
      "type": "order",
      "title": "New Order #ORD-2024-001",
      "message": "Jane Smith placed an order for 2 items",
      "read": false,
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 35. Mark Notification as Read

**Request:**
```http
PUT http://localhost:3000/api/notifications/507f1f77bcf86cd799439016/read
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": { ... }
}
```

---

### 36. Mark All Notifications as Read

**Request:**
```http
PUT http://localhost:3000/api/notifications/read-all
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Alternative Route:**
```http
PUT http://localhost:3000/api/notifications/mark-all-read
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "count": 10
}
```

**Note:** Both `/read-all` and `/mark-all-read` routes work. The `count` field shows how many notifications were marked as read.

---

## 📝 Notes

- **All protected routes** require `Authorization: Bearer <token>` header
- **Image uploads** use `multipart/form-data` content type
- **All dates** are in ISO 8601 format
- **Error responses** follow the format: `{ "success": false, "message": "Error message" }`

---

**For more details, see `API_DOCUMENTATION.md`**

