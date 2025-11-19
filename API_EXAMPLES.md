# API Request Examples

Complete examples of all API requests with request bodies and expected responses.

---

## 🔐 Authentication APIs

### 1. Register New Supplier Account

**Request (Without Image - JSON):**
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "businessName": "Urban Supply Co.",
  "email": "supplier@example.com",
  "password": "Password123"
}
```

**Request (With Image - Use form-data):**
```http
POST http://localhost:3000/api/auth/register
Content-Type: multipart/form-data
```

**Required Fields:**
- `businessName` - Your business name (e.g., "Urban Supply Co.", "Builders Depot")
- `email` - Valid email address (must be unique)
- `password` - Password with:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

**Optional Fields:**
- `image` - Profile image file (JPG, JPEG, PNG, GIF, WEBP, SVG, max 10 MB)


**Response:**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to email for verification."
}
```


---

### 2. Verify OTP

**Request:**
```http
POST http://localhost:3000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "supplier@example.com",
  "otp": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now login."
}
```


---

### 3. Login

**Request:**
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "supplier@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Urban Supply Co.",
    "email": "supplier@example.com",
    "phone": "",
    "profileImage": "https://res.cloudinary.com/.../profile.jpg",
    "isVerified": true
  }
}
```


---

### 4. Request New OTP

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

### 5. Logout

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

### 6. Change Email During Verification

**Request:**
```http
POST http://localhost:3000/api/auth/change-email
Content-Type: application/json

{
  "oldEmail": "supplier@example.com",
  "newEmail": "newemail@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email changed successfully. OTP sent to new email.",
  "newEmail": "newemail@example.com"
}
```


---

## 👤 User Profile APIs

### 6. Get Current User

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
    "name": "Urban Supply Co.",
    "email": "contact@urbansupply.com",
    "phone": "1234567890",
    "profileImage": "https://res.cloudinary.com/.../profile.jpg",
    "supplyPartnerSince": "Jan 2025",
    "performanceMetrics": {
      "rating": 4.8,
      "onTimePercentage": 98,
      "totalSupplied": 532
    },
    "paymentMethodsCount": 2,
    "bankAccountsCount": 1,
    "businessInfo": {
      "fullBusinessName": "Urban Supply Co. Ltd.",
      "businessType": "Building Materials Supplier",
      "registrationNumber": "BRN78598651",
      "taxId": "TIN4587123645",
      "establishedDate": "2024-01-15T00:00:00.000Z",
      "establishedYear": "2024"
    },
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "businessHours": {
      "monday": { "open": "09:00", "close": "21:00", "isOpen": true },
      "tuesday": { "open": "09:00", "close": "21:00", "isOpen": true },
      "wednesday": { "open": "09:00", "close": "21:00", "isOpen": true },
      "thursday": { "open": "09:00", "close": "21:00", "isOpen": true },
      "friday": { "open": "09:00", "close": "21:00", "isOpen": true },
      "saturday": { "open": "10:00", "close": "18:00", "isOpen": true },
      "sunday": { "open": "10:00", "close": "18:00", "isOpen": false }
    },
    "deliverySettings": {
      "deliveryRadius": 50,
      "deliveryFee": 5.99,
      "freeDeliveryThreshold": 100,
      "deliveryTime": "2-3 days"
    },
    "paymentMethods": [
      {
        "type": "card",
        "last4": "4242",
        "brand": "Visa",
        "isDefault": true
      },
      {
        "type": "card",
        "last4": "8888",
        "brand": "Mastercard",
        "isDefault": false
      }
    ],
    "bankAccounts": [
      {
        "bankName": "Chase Bank",
        "accountNumber": "****1234",
        "routingNumber": "****5678",
        "accountHolderName": "Urban Supply Co.",
        "isDefault": true
      }
    ],
    "website": "https://urbansupply.com",
    "aboutUs": "Leading supplier of building materials and tools...",
    "specialties": ["Building Materials", "Power Tools", "Plumbing"],
    "verification": {
      "isVerified": true,
      "verifiedDate": "2025-01-15T00:00:00.000Z"
    },
    "badges": ["Top Rated", "Verified"],
    "metrics": {
      "rating": 4.8,
      "onTimePercentage": 98,
      "totalSupplied": 532,
      "joinDate": "2025-01-15T00:00:00.000Z"
    },
    "createdAt": "2025-01-15T00:00:00.000Z",
    "updatedAt": "2025-01-16T00:00:00.000Z"
  }
}
```


---

### 7. Update Profile

**Request (Full Update):**
```http
PUT http://localhost:3000/api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Urban Supply Co.",
  "phone": "+1 (555) 234-5678",
  "businessInfo": {
    "fullBusinessName": "Urban Supply Co. Ltd.",
    "businessType": "Building Materials Supplier",
    "registrationNumber": "BRN78598651",
    "taxId": "TIN4587123645",
    "establishedDate": "2024-01-15"
  },
  "address": {
    "street": "1234 Construction Avenue, Suite 500",
    "city": "Metropolis",
    "state": "NY",
    "zipCode": "10001",
    "country": "United States"
  },
  "website": "www.urbansupplyco.com",
  "aboutUs": "Urban Supply Co. is a leading supplier of building materials, tools, and hardware for contractors, builders, and DIY enthusiasts. Established in 2015, we pride ourselves on providing high-quality products at competitive prices with exceptional customer service.",
  "specialties": ["Building Materials", "Power Tools", "Plumbing", "Electrical Supplies", "Hardware"]
}
```

**Request (Partial Update - Only Business Info):**
```http
PUT http://localhost:3000/api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "businessInfo": {
    "taxId": "TIN4587123645"
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
    "name": "Urban Supply Co.",
    "email": "contact@urbansupply.com",
    "phone": "+1 (555) 234-5678",
    "profileImage": "https://res.cloudinary.com/.../profile.jpg",
    "supplyPartnerSince": "Jan 2025",
    "performanceMetrics": {
      "rating": 4.8,
      "onTimePercentage": 98,
      "totalSupplied": 532
    },
    "businessInfo": {
      "fullBusinessName": "Urban Supply Co. Ltd.",
      "businessType": "Building Materials Supplier",
      "registrationNumber": "BRN78598651",
      "taxId": "TIN4587123645",
      "establishedDate": "2024-01-15T00:00:00.000Z",
      "establishedYear": "2024"
    },
    "address": {
      "street": "1234 Construction Avenue, Suite 500",
      "city": "Metropolis",
      "state": "NY",
      "zipCode": "10001",
      "country": "United States"
    },
    "website": "www.urbansupplyco.com",
    "aboutUs": "Urban Supply Co. is a leading supplier...",
    "specialties": ["Building Materials", "Power Tools", "Plumbing", "Electrical Supplies", "Hardware"],
    "paymentMethodsCount": 2,
    "bankAccountsCount": 1,
    "createdAt": "2025-01-15T00:00:00.000Z",
    "updatedAt": "2025-01-16T00:00:00.000Z"
  }
}
```

---

### 8. Upload Profile Image

**Request:**
```http
POST http://localhost:3000/api/users/upload-profile-image
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Image:** JPG, JPEG, PNG, GIF, WEBP, SVG (max 10 MB). Use form-data with field name `image`.

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

### 9. Get Detailed Profile Info

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
    "name": "Urban Supply Co.",
    "profileImage": "https://res.cloudinary.com/.../profile.jpg",
    "supplyPartnerSince": "Jan 2025",
    "businessInfo": {
      "fullBusinessName": "Urban Supply Co. Ltd.",
      "businessType": "Building Materials Supplier",
      "registrationNumber": "BRN78598651",
      "taxId": "TIN4587123645",
      "establishedDate": "2024-01-15T00:00:00.000Z",
      "establishedYear": "2024"
    },
    "businessType": "Building Materials Supplier",
    "contactInfo": {
      "email": "info@urbansupplyco.com",
      "phone": "+1 (555) 234-5678",
      "website": "www.urbansupplyco.com"
    },
    "address": {
      "street": "1234 Construction Avenue, Suite 500",
      "city": "Metropolis",
      "state": "NY",
      "zipCode": "10001",
      "country": "United States"
    },
    "businessHours": {
      "monday": { "open": "8:00 AM", "close": "6:00 PM", "isOpen": true },
      "tuesday": { "open": "8:00 AM", "close": "6:00 PM", "isOpen": true },
      "wednesday": { "open": "8:00 AM", "close": "6:00 PM", "isOpen": true },
      "thursday": { "open": "8:00 AM", "close": "6:00 PM", "isOpen": true },
      "friday": { "open": "8:00 AM", "close": "6:00 PM", "isOpen": true },
      "saturday": { "open": "8:00 AM", "close": "6:00 PM", "isOpen": true },
      "sunday": { "open": "", "close": "", "isOpen": false }
    },
    "deliverySettings": {
      "deliveryRadius": 50,
      "deliveryFee": 5.99,
      "freeDeliveryThreshold": 100,
      "deliveryTime": "2-3 days"
    },
    "aboutUs": "Urban Supply Co. is a leading supplier of building materials, tools, and hardware for contractors, builders, and DIY enthusiasts. Established in 2015, we pride ourselves on providing high-quality products at competitive prices with exceptional customer service.",
    "specialties": ["Building Materials", "Power Tools", "Plumbing", "Electrical Supplies", "Hardware"],
    "verification": {
      "isVerified": true,
      "verifiedDate": "2025-01-15T00:00:00.000Z"
    },
    "badges": ["Top Rated", "Verified"],
    "metrics": {
      "rating": 4.8,
      "onTimePercentage": 98,
      "totalSupplied": 532,
      "joinDate": "2025-01-15T00:00:00.000Z"
    },
    "performanceMetrics": {
      "rating": 4.8,
      "onTimePercentage": 98,
      "totalSupplied": 532
    },
    "paymentMethods": [
      {
        "type": "card",
        "last4": "4242",
        "brand": "Visa",
        "isDefault": true
      },
      {
        "type": "card",
        "last4": "8888",
        "brand": "Mastercard",
        "isDefault": false
      }
    ],
    "paymentMethodsCount": 2,
    "bankAccounts": [
      {
        "bankName": "Chase Bank",
        "accountNumber": "****1234",
        "routingNumber": "****5678",
        "accountHolderName": "Urban Supply Co.",
        "isDefault": true
      }
    ],
    "bankAccountsCount": 1
  }
}
```


---

## 📦 Product APIs

### 10. Get All Products

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

### 11. Get Single Product

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

### 12. Create Product

**Request:**
```http
POST http://localhost:3000/api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Premium Cement (50kg)",
  "category": "Building Materials",
  "description": "High-quality premium cement for construction projects",
  "price": 12.99,
  "stock": 120,
  "discount": 0,
  "unit": "Bag",
  "specifications": [
    { "name": "Weight", "value": "50kg" },
    { "name": "Type", "value": "Portland Cement" },
    { "name": "Grade", "value": "53" }
  ],
  "deliveryOptions": {
    "availableForDelivery": true,
    "availableForPickup": false
  }
}
```

**Required:** `name`, `category`, `price`, `stock`  
**Optional:** `description`, `discount`, `unit`, `specifications`, `deliveryOptions`, `lowStockThreshold`

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Premium Cement (50kg)",
    "category": "Building Materials",
    "description": "High-quality premium cement for construction projects",
    "price": 12.99,
    "stock": 120,
    "lowStockThreshold": 10,
    "soldQuantity": 0,
    "discount": 0,
    "unit": "Bag",
    "image": null,
    "images": [],
    "specifications": [
      { "name": "Weight", "value": "50kg" },
      { "name": "Type", "value": "Portland Cement" },
      { "name": "Grade", "value": "53" }
    ],
    "deliveryOptions": {
      "availableForDelivery": true,
      "availableForPickup": true
    },
    "isActive": true,
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 13. Update Product

**Request:**
```http
PUT http://localhost:3000/api/products/507f1f77bcf86cd799439012
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Premium Cement (50kg)",
  "category": "Building Materials",
  "description": "Premium quality cement suitable for all general construction purposes. High strength, consistent quality and excellent workability. Each bag contains 50kg of cement.",
  "price": 12.99,
  "stock": 120,
  "discount": 0,
  "unit": "Bag",
  "isActive": true,
  "specifications": [
    { "name": "Weight", "value": "50kg" },
    { "name": "Type", "value": "Portland Cement" },
    { "name": "Grade", "value": "53" }
  ],
  "deliveryOptions": {
    "availableForDelivery": true,
    "availableForPickup": true
  }
}
```

All fields are optional. Only send fields you want to update.

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Premium Cement (50kg)",
    "category": "Building Materials",
    "description": "Premium quality cement suitable for all general construction purposes...",
    "price": 12.99,
    "stock": 120,
    "discount": 0,
    "unit": "Bag",
    "isActive": true,
    "specifications": [
      { "name": "Weight", "value": "50kg" },
      { "name": "Type", "value": "Portland Cement" },
      { "name": "Grade", "value": "53" }
    ],
    "deliveryOptions": {
      "availableForDelivery": true,
      "availableForPickup": true
    },
    "image": "https://res.cloudinary.com/.../cement.jpg",
    "images": [
      "https://res.cloudinary.com/.../cement1.jpg",
      "https://res.cloudinary.com/.../cement2.jpg"
    ],
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-16T00:00:00.000Z"
  }
}
```

---

### 14. Delete Product

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

### 15. Upload Product Image (Single)

**Request:**
```http
POST http://localhost:3000/api/products/507f1f77bcf86cd799439012/upload-image
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Image:** JPG, JPEG, PNG, GIF, WEBP, SVG (max 10 MB). Use form-data with field name `image`.

**Response:**
```json
{
  "success": true,
  "message": "Product image uploaded successfully",
  "imageUrl": "https://res.cloudinary.com/.../product.jpg",
  "product": { ... }
}
```

### 16. Upload Multiple Product Images

**Request:**
```http
POST http://localhost:3000/api/products/507f1f77bcf86cd799439012/upload-images
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Images:** JPG, JPEG, PNG, GIF, WEBP, SVG (max 10 MB each, max 6 images). Use form-data with field name `images`.

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

### 17. Delete Product Image

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

### 18. Get All Categories

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

### 19. Get All Orders

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
  "count": 20,
  "total": 50,
  "page": 1,
  "pages": 3,
  "statusCounts": {
    "New Order": 5,
    "Processing": 8,
    "Ready": 3,
    "Out for delivery": 2,
    "Delivered": 2
  },
  "orders": [
    {
      "id": "507f1f77bcf86cd799439013",
      "orderNumber": "INS5785",
      "customerName": "John Doe",
      "customerNameShort": "John D.",
      "customerEmail": "john@example.com",
      "customerPhone": "555-1234",
      "status": "New Order",
      "totalAmount": 45.97,
      "itemsCount": 2,
      "timeAgo": "30 min ago",
      "createdAt": "2024-01-15T10:11:00.000Z",
      "items": [
        {
          "id": "507f1f77bcf86cd799439014",
          "productId": "507f1f77bcf86cd799439011",
          "productName": "Premium Cement (50kg)",
          "quantity": 2,
          "price": 12.99,
          "subtotal": 25.98,
          "productImage": "https://res.cloudinary.com/.../cement.jpg"
        },
        {
          "id": "507f1f77bcf86cd799439015",
          "productId": "507f1f77bcf86cd799439012",
          "productName": "LED Light Bulbs (5pk)",
          "quantity": 1,
          "price": 19.99,
          "subtotal": 19.99,
          "productImage": "https://res.cloudinary.com/.../bulbs.jpg"
        }
      ],
      "deliveryMethod": "Standard Delivery",
      "deliveryAddress": "123 Main St, City, State",
      "customerType": "Contractor"
    }
  ]
}
```


---

### 20. Get Recent Orders

**Request:**
```http
GET http://localhost:3000/api/orders/recent?limit=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "orders": [
    {
      "id": "507f1f77bcf86cd799439013",
      "orderNumber": "INS5785",
      "customerName": "John Doe",
      "customerNameShort": "John D.",
      "status": "New Order",
      "totalAmount": 45.97,
      "itemsCount": 2,
      "timeAgo": "30 min ago",
      "createdAt": "2024-01-15T10:11:00.000Z",
      "items": [
        {
          "productName": "Premium Cement (50kg)",
          "quantity": 2,
          "price": 12.99,
          "subtotal": 25.98,
          "productImage": "https://res.cloudinary.com/.../cement.jpg"
        }
      ]
    }
  ]
}
```

---

### 21. Get Single Order

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
    "orderNumber": "INS5785",
    "customerName": "John Doe",
    "customerNameShort": "John D.",
    "customerInitials": "JD",
    "customerEmail": "john@example.com",
    "customerPhone": "+1 (555) 123-4567",
    "status": "Processing",
    "totalAmount": 45.97,
    "itemsCount": 3,
    "timeAgo": "2 hours ago",
    "lastUpdated": "March 15, 2025 • 10:30 AM",
    "lastUpdatedStatus": "Processing",
    "deliveryMethod": "Standard Delivery",
    "deliveryAddress": {
      "name": "John's Construction Site",
      "street": "123 Builder St",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62701",
      "country": "United States",
      "fullAddress": "123 Builder St, Springfield, IL 62701"
    },
    "deliveryAddressName": "John's Construction Site",
    "deliveryAddressFull": "123 Builder St, Springfield, IL 62701",
    "deliveryTime": "Today, 2:00 PM - 4:00 PM",
    "paymentMethod": {
      "type": "Credit Card",
      "last4": "4582",
      "brand": "Visa"
    },
    "paymentMethodDisplay": "Credit Card •••• 4582",
    "customerType": "Contractor",
    "notes": "",
    "items": [
      {
        "id": "507f1f77bcf86cd799439011",
        "productId": "507f1f77bcf86cd799439010",
        "productName": "Premium Cement (50kg)",
        "quantity": 2,
        "price": 12.99,
        "subtotal": 25.98,
        "productImage": "https://res.cloudinary.com/.../cement.jpg"
      }
    ],
    "orderHistory": [
      {
        "status": "Processing",
        "statusLabel": "Processing",
        "note": "Order is being prepared for shipment",
        "updatedBy": "Urban Supply Co.",
        "timestamp": "2025-03-15T10:30:00.000Z",
        "formattedDate": "March 15, 2025 • 10:30 AM"
      },
      {
        "status": "New Order",
        "statusLabel": "New Order",
        "note": "New order received from John Doe with 3 items totaling $45.97.",
        "updatedBy": "System",
        "timestamp": "2025-03-15T10:28:00.000Z",
        "formattedDate": "March 15, 2025 • 10:28 AM"
      }
    ],
    "createdAt": "2025-03-15T10:28:00.000Z",
    "updatedAt": "2025-03-15T10:30:00.000Z"
  }
}
```


---

### 22. Create Order

**Request:**
```http
POST http://localhost:3000/api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+1 (555) 123-4567",
  "customerType": "Contractor",
  "items": [
    {
      "productId": "69160f0a2f6b77274a2eceaf",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "name": "John's Construction Site",
    "street": "123 Builder St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "United States"
  },
  "deliveryMethod": "Standard Delivery",
  "deliveryTime": "Today, 2:00 PM - 4:00 PM",
  "paymentMethod": {
    "type": "Credit Card",
    "last4": "4582",
    "brand": "Visa"
  },
  "notes": "Please deliver to the construction site entrance"
}
```

Only send `productId` and `quantity`. Product details are fetched automatically.

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "507f1f77bcf86cd799439013",
    "orderNumber": "INS5785",
    "customerName": "John Doe",
    "customerInitials": "JD",
    "status": "New Order",
    "totalAmount": 45.97,
    "itemsCount": 3,
    "deliveryAddress": {
      "name": "John's Construction Site",
      "street": "123 Builder St",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62701",
      "country": "United States",
      "fullAddress": "123 Builder St, Springfield, IL 62701"
    },
    "deliveryMethod": "Standard Delivery",
    "deliveryTime": "Today, 2:00 PM - 4:00 PM",
    "paymentMethod": {
      "type": "Credit Card",
      "last4": "4582",
      "brand": "Visa"
    },
    "orderHistory": [
      {
        "status": "New Order",
        "statusLabel": "New Order",
        "note": "New order received from John Doe with 3 items totaling $45.97.",
        "updatedBy": "System",
        "timestamp": "2025-03-15T10:28:00.000Z",
        "formattedDate": "March 15, 2025 • 10:28 AM"
      }
    ],
    "createdAt": "2025-03-15T10:28:00.000Z"
  }
}
```

---

### 23. Update Order Status

**Request:**
```http
PUT http://localhost:3000/api/orders/507f1f77bcf86cd799439013/status
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "Processing",
  "note": "Order is being prepared for shipment"
}
```

**Required:** `status`  
**Optional:** `note`

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "id": "507f1f77bcf86cd799439013",
    "orderNumber": "INS5785",
    "status": "Processing",
    "lastUpdated": "March 15, 2025 • 10:30 AM",
    "lastUpdatedStatus": "Processing",
    "orderHistory": [
      {
        "status": "Processing",
        "statusLabel": "Processing",
        "note": "Order is being prepared for shipment",
        "updatedBy": "Urban Supply Co.",
        "timestamp": "2025-03-15T10:30:00.000Z",
        "formattedDate": "March 15, 2025 • 10:30 AM"
      },
      {
        "status": "New Order",
        "statusLabel": "New Order",
        "note": "New order received from John Doe with 3 items totaling $45.97.",
        "updatedBy": "System",
        "timestamp": "2025-03-15T10:28:00.000Z",
        "formattedDate": "March 15, 2025 • 10:28 AM"
      }
    ],
    "customerName": "John Doe",
    "customerInitials": "JD",
    "customerPhone": "+1 (555) 123-4567",
    "deliveryAddressName": "John's Construction Site",
    "deliveryAddressFull": "123 Builder St, Springfield, IL 62701",
    "deliveryTime": "Today, 2:00 PM - 4:00 PM",
    "paymentMethodDisplay": "Credit Card •••• 4582",
    ...
  }
}
```


---

### 24. Update Order

**Request:**
```http
PUT http://localhost:3000/api/orders/507f1f77bcf86cd799439013
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "customerName": "John Doe",
  "customerPhone": "+1 (555) 123-4567",
  "deliveryAddress": {
    "name": "John's Construction Site",
    "street": "123 Builder St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "United States"
  },
  "deliveryTime": "Today, 2:00 PM - 4:00 PM",
  "paymentMethod": {
    "type": "Credit Card",
    "last4": "4582",
    "brand": "Visa"
  },
  "notes": "Please deliver to the construction site entrance"
}
```

All fields are optional. Partial updates supported.

**Response:**
```json
{
  "success": true,
  "message": "Order updated successfully",
  "order": {
    "id": "507f1f77bcf86cd799439013",
    "orderNumber": "INS5785",
    "customerName": "John Doe",
    "customerInitials": "JD",
    "deliveryAddress": {
      "name": "John's Construction Site",
      "street": "123 Builder St",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62701",
      "country": "United States",
      "fullAddress": "123 Builder St, Springfield, IL 62701"
    },
    "deliveryAddressName": "John's Construction Site",
    "deliveryAddressFull": "123 Builder St, Springfield, IL 62701",
    "deliveryTime": "Today, 2:00 PM - 4:00 PM",
    "paymentMethodDisplay": "Credit Card •••• 4582",
    "orderHistory": [ ... ],
    ...
  }
}
```

---

### 25. Delete Order

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

### 26. Get Dashboard Summary

**Request:**
```http
GET http://localhost:3000/api/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentDate": "Tuesday, March 15, 2025",
    "todaySales": {
      "amount": "1254.00",
      "change": 12,
      "changeType": "increase"
    },
    "orders": {
      "count": 32,
      "change": 8,
      "changeType": "increase"
    },
    "rating": {
      "value": "4.8",
      "count": 125
    },
    "storeStatus": {
      "isOpen": true,
      "closingTime": "21:00",
      "message": "Until 21:00"
    },
    "recentOrders": [
      {
        "id": "507f1f77bcf86cd799439013",
        "orderNumber": "INS4304",
        "itemsCount": 3,
        "totalAmount": 89.97,
        "status": "Needs confirmation",
        "customerName": "John Doe",
        "createdAt": "2024-01-15T00:00:00.000Z",
        "items": [
          {
            "id": "507f1f77bcf86cd799439011",
            "name": "Premium Cement",
            "quantity": 2,
            "price": 12.99,
            "subtotal": 25.98,
            "image": "https://res.cloudinary.com/..."
          }
        ]
      }
    ]
  }
}
```


---

### 26. Get KPIs (Key Performance Indicators)

**Request:**
```http
GET http://localhost:3000/api/dashboard/kpis
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": {
      "value": 8245.50,
      "change": 18,
      "changeType": "increase"
    },
    "totalOrders": {
      "value": 142,
      "change": 12,
      "changeType": "increase"
    },
    "avgOrderValue": {
      "value": 58.07,
      "change": 5,
      "changeType": "increase"
    },
    "newCustomers": {
      "value": 28,
      "change": -3,
      "changeType": "decrease"
    }
  }
}
```


---

### 27. Get Sales Overview Graph Data

**Request:**
```http
GET http://localhost:3000/api/dashboard/sales-overview?period=daily
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `period` - Time period: "daily" (default), "weekly", or "monthly"

**Response (Daily):**
```json
{
  "success": true,
  "period": "daily",
  "data": [
    { "label": "Sun", "value": 1800.00 },
    { "label": "Mon", "value": 1200.00 },
    { "label": "Tue", "value": 1900.00 },
    { "label": "Wed", "value": 800.00 },
    { "label": "Thu", "value": 1400.00 },
    { "label": "Fri", "value": 2000.00 },
    { "label": "Sat", "value": 1300.00 }
  ]
}
```

**Response (Weekly):**
```json
{
  "success": true,
  "period": "weekly",
  "data": [
    { "label": "Week Jan 1", "value": 5200.00 },
    { "label": "Week Jan 8", "value": 6800.00 },
    { "label": "Week Jan 15", "value": 7500.00 },
    { "label": "Week Jan 22", "value": 8200.00 }
  ]
}
```

**Response (Monthly):**
```json
{
  "success": true,
  "period": "monthly",
  "data": [
    { "label": "Jan 2024", "value": 25000.00 },
    { "label": "Feb 2024", "value": 28000.00 },
    { "label": "Mar 2024", "value": 32000.00 }
  ]
}
```

---

### 28. Get Top Products

**Request:**
```http
GET http://localhost:3000/api/dashboard/top-products?limit=10&sortBy=revenue
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `limit` - Number of products to return (default: 10)
- `sortBy` - Sort by "revenue" (default) or "units"

**Response:**
```json
{
  "success": true,
  "sortBy": "revenue",
  "count": 4,
  "products": [
    {
      "rank": 1,
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Power Drill Set (18V)",
      "productImage": "https://res.cloudinary.com/.../drill.jpg",
      "unitsSold": 32,
      "revenue": 2879.68
    },
    {
      "rank": 2,
      "productId": "507f1f77bcf86cd799439012",
      "productName": "Premium Cement (50kg)",
      "productImage": "https://res.cloudinary.com/.../cement.jpg",
      "unitsSold": 45,
      "revenue": 579.68
    },
    {
      "rank": 3,
      "productId": "507f1f77bcf86cd799439013",
      "productName": "Copper Pipes (10pcs)",
      "productImage": "https://res.cloudinary.com/.../pipes.jpg",
      "unitsSold": 18,
      "revenue": 621.00
    },
    {
      "rank": 4,
      "productId": "507f1f77bcf86cd799439014",
      "productName": "LED Light Bulbs (5pk)",
      "productImage": "https://res.cloudinary.com/.../bulbs.jpg",
      "unitsSold": 27,
      "revenue": 539.73
    }
  ]
}
```


---

### 29. Get Customer Demographics

**Request:**
```http
GET http://localhost:3000/api/dashboard/customer-demographics
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "total": 150,
  "demographics": [
    {
      "type": "Contractor",
      "count": 75,
      "percentage": 50.0
    },
    {
      "type": "DIY Homeowner",
      "count": 45,
      "percentage": 30.0
    },
    {
      "type": "Business",
      "count": 20,
      "percentage": 13.3
    },
    {
      "type": "Other",
      "count": 10,
      "percentage": 6.7
    }
  ]
}
```


---

## 🏪 Store Settings APIs

### 30. Get Store Settings

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

### 31. Update Store Settings

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

### 32. Get All Reviews

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
  "count": 20,
  "total": 124,
  "page": 1,
  "pages": 7,
  "ratingDistribution": {
    "5": 85,
    "4": 12,
    "3": 2,
    "2": 1,
    "1": 0
  },
  "reviews": [
    {
      "id": "507f1f77bcf86cd799439014",
      "customerName": "John D.",
      "customerInitials": "JD",
      "customerEmail": "john@example.com",
      "rating": 5,
      "reviewText": "Great quality products and super fast delivery! I ordered some cement bags and they arrived within hours. The staff was also very helpful with loading them into my truck. Will definitely order again.",
      "images": [
        "https://res.cloudinary.com/.../cement1.jpg"
      ],
      "imagesCount": 3,
      "timeAgo": "2 days ago",
      "createdAt": "2024-01-15T00:00:00.000Z",
      "reply": null,
      "hasReply": false
    },
    {
      "id": "507f1f77bcf86cd799439015",
      "customerName": "Sarah M.",
      "customerInitials": "SM",
      "customerEmail": "sarah@example.com",
      "rating": 4,
      "reviewText": "The power drill I ordered works great! Shipping was fast and the product came well-packaged. Only giving 4 stars because the battery doesn't seem to last as long as advertised.",
      "images": [],
      "imagesCount": 0,
      "timeAgo": "1 week ago",
      "createdAt": "2024-01-08T00:00:00.000Z",
      "reply": {
        "companyName": "Urban Supply Co.",
        "replyText": "Thank you for your feedback, Sarah! We're sorry to hear about the battery life. Please contact our customer service and we'll be happy to check if there might be an issue with the battery.",
        "timeAgo": "6 days ago",
        "createdAt": "2024-01-09T00:00:00.000Z"
      },
      "hasReply": true
    }
  ]
}
```


---

### 33. Get Review Summary

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
    "averageRating": 4.9,
    "totalReviews": 124,
    "ratingDistribution": {
      "5": 85,
      "4": 12,
      "3": 2,
      "2": 1,
      "1": 0
    },
    "topPercentage": "Top 5%"
  }
}
```


---

### 34. Create Review

**Request (Without Images - JSON):**
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

**Request (With Images - Use form-data):**
```http
POST http://localhost:3000/api/reviews
Content-Type: multipart/form-data
```

**Required:** `supplierId`, `customerName`, `rating`  
**Optional:** `customerEmail`, `comment` (or `reviewText`), `images` (max 5, JPG/JPEG/PNG/GIF/WEBP/SVG, 10 MB each)

**Response (Without Images):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "review": {
    "id": "507f1f77bcf86cd799439014",
    "supplier": "507f1f77bcf86cd799439011",
    "customerName": "John Customer",
    "customerEmail": "john@example.com",
    "rating": 5,
    "reviewText": "Excellent service and quality products! Highly recommend this supplier.",
    "images": [],
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

**Response (With Images):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "review": {
    "id": "507f1f77bcf86cd799439014",
    "supplier": "507f1f77bcf86cd799439011",
    "customerName": "John Customer",
    "customerEmail": "john@example.com",
    "rating": 5,
    "reviewText": "Excellent service and quality products! Highly recommend this supplier.",
    "images": [
      "https://res.cloudinary.com/.../review1.jpg",
      "https://res.cloudinary.com/.../review2.jpg"
    ],
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```


---

### 34.1. Upload Review Images (After Creation)

**Request:**
```http
POST http://localhost:3000/api/reviews/507f1f77bcf86cd799439014/upload-images
Content-Type: multipart/form-data
```

**Images:** JPG, JPEG, PNG, GIF, WEBP, SVG (max 10 MB each, max 5 images). Use form-data with field name `images`.

**Response:**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "images": [
    "https://res.cloudinary.com/.../review1.jpg",
    "https://res.cloudinary.com/.../review2.jpg"
  ],
  "review": {
    "id": "507f1f77bcf86cd799439014",
    "images": [
      "https://res.cloudinary.com/.../review1.jpg",
      "https://res.cloudinary.com/.../review2.jpg"
    ],
    ...
  }
}
```

---

### 35. Add Reply to Review

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

Use `replyText` or `message`. `companyName` is optional.

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

### 36. Get All Campaigns

**Request:**
```http
GET http://localhost:3000/api/campaigns?status=Active&page=1&limit=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `status` - Filter by status (Active, Paused, Completed, Cancelled, or "All" for all)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "page": 1,
  "pages": 1,
  "summary": {
    "activeCampaigns": 2,
    "totalBudgetSpent": 38.50
  },
  "campaigns": [
    {
      "id": "507f1f77bcf86cd799439020",
      "name": "Summer Building Materials",
      "status": "Active",
      "dailyBudget": 10.00,
      "impressions": 2458,
      "clicks": 154,
      "totalBudgetSpent": 38.50,
      "productImages": [
        "https://res.cloudinary.com/.../product1.jpg",
        "https://res.cloudinary.com/.../product2.jpg",
        "https://res.cloudinary.com/.../product3.jpg"
      ],
      "productsCount": 3,
      "products": [
        {
          "id": "507f1f77bcf86cd799439011",
          "name": "Premium Cement (50kg)",
          "image": "https://res.cloudinary.com/.../cement.jpg",
          "price": 12.99,
          "category": "Building Materials"
        }
      ],
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": null,
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```


---

### 37. Create Campaign

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

**Required:** `name`, `products` (array), `dailyBudget`  
**Optional:** `startDate`, `endDate`

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

### 37.1. Get Top Ranking Products

**Request:**
```http
GET http://localhost:3000/api/campaigns/top-ranking?limit=10
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `limit` - Number of products to return (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "products": [
    {
      "id": "507f1f77bcf86cd799439011",
      "rank": 1,
      "productName": "Power Drill Set (18V)",
      "productImage": "https://res.cloudinary.com/.../drill.jpg",
      "category": "Tools",
      "price": 89.99,
      "rankingTags": ["Top Rated", "Promoted"],
      "positionText": "1st in Tools",
      "soldQuantity": 245
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "rank": 2,
      "productName": "Premium Cement (50kg)",
      "productImage": "https://res.cloudinary.com/.../cement.jpg",
      "category": "Building Materials",
      "price": 12.99,
      "rankingTags": ["Best Seller", "Promoted"],
      "positionText": "2nd in Building Materials",
      "soldQuantity": 180
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "rank": 5,
      "productName": "Copper Pipes (10pcs)",
      "productImage": "https://res.cloudinary.com/.../pipes.jpg",
      "category": "Plumbing",
      "price": 34.50,
      "rankingTags": ["Popular"],
      "positionText": "5th in Plumbing",
      "soldQuantity": 92
    }
  ]
}
```


---

### 37.2. Boost Product Ranking

**Request:**
```http
POST http://localhost:3000/api/campaigns/boost-ranking
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "category": "Tools",
  "tags": ["Top Rated", "Promoted"]
}
```

**Required:** `productId`  
**Optional:** `category`, `tags`

**Response:**
```json
{
  "success": true,
  "message": "Product ranking boosted successfully",
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Power Drill Set (18V)",
    "ranking": {
      "position": 1,
      "category": "Tools",
      "tags": ["Top Rated", "Promoted"]
    }
  }
}
```

---

### 37.3. Get Campaign Insights

**Request:**
```http
GET http://localhost:3000/api/campaigns/507f1f77bcf86cd799439020/insights?period=7days

or

http://localhost:3000/api/campaigns?status=Active
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `period` - Time period for daily performance (7days, 14days, 30days) - default: 7days

**Response:**
```json
{
  "success": true,
  "campaign": {
    "id": "507f1f77bcf86cd799439020",
    "name": "Summer Building Materials",
    "status": "Active",
    "startDate": "2025-03-01T00:00:00.000Z",
    "startDateFormatted": "Mar 1, 2025",
    "endDate": "2025-03-30T00:00:00.000Z",
    "endDateFormatted": "Mar 30, 2025",
    "dailyBudget": 10.00,
    "products": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Premium Cement (50kg)",
        "image": "https://res.cloudinary.com/.../cement.jpg",
        "price": 12.99,
        "category": "Building Materials"
      }
    ],
    "productImages": [
      "https://res.cloudinary.com/.../product1.jpg",
      "https://res.cloudinary.com/.../product2.jpg",
      "https://res.cloudinary.com/.../product3.jpg"
    ]
  },
  "overallPerformance": {
    "impressions": {
      "value": 2458,
      "change": 12,
      "changeType": "increase",
      "changeLabel": "12% vs. last week"
    },
    "clicks": {
      "value": 154,
      "change": 8,
      "changeType": "increase",
      "changeLabel": "8% vs. last week"
    },
    "ctr": 6.3,
    "cpc": 0.25,
    "totalSpend": 38.50
  },
  "dailyPerformance": {
    "period": "7days",
    "periodLabel": "Last 7 Days",
    "data": [
      {
        "label": "Mon",
        "date": "2025-03-10",
        "impressions": 390,
        "clicks": 26
      },
      {
        "label": "Tue",
        "date": "2025-03-11",
        "impressions": 410,
        "clicks": 28
      },
      {
        "label": "Wed",
        "date": "2025-03-12",
        "impressions": 430,
        "clicks": 29
      },
      {
        "label": "Thu",
        "date": "2025-03-13",
        "impressions": 450,
        "clicks": 30
      },
      {
        "label": "Fri",
        "date": "2025-03-14",
        "impressions": 445,
        "clicks": 29
      },
      {
        "label": "Sat",
        "date": "2025-03-15",
        "impressions": 380,
        "clicks": 24
      },
      {
        "label": "Sun",
        "date": "2025-03-16",
        "impressions": 373,
        "clicks": 23
      }
    ]
  },
  "productPerformance": [
    {
      "product": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Power Drill Set (18V)",
        "image": "https://res.cloudinary.com/.../drill.jpg",
        "category": "Building Materials",
        "price": 12.99
      },
      "salesIncrease": "+32%",
      "salesIncreaseValue": 32,
      "impressions": 845,
      "clicks": 62,
      "ctr": 7.3
    },
    {
      "product": {
        "id": "507f1f77bcf86cd799439012",
        "name": "Poland Cement (40kg)",
        "image": "https://res.cloudinary.com/.../cement.jpg",
        "category": "Building Materials",
        "price": 11.99
      },
      "salesIncrease": "+18%",
      "salesIncreaseValue": 18,
      "impressions": 635,
      "clicks": 41,
      "ctr": 6.5
    },
    {
      "product": {
        "id": "507f1f77bcf86cd799439013",
        "name": "White Cement (20kg)",
        "image": "https://res.cloudinary.com/.../white-cement.jpg",
        "category": "Building Materials",
        "price": 18.99
      },
      "salesIncrease": "+24%",
      "salesIncreaseValue": 24,
      "impressions": 542,
      "clicks": 32,
      "ctr": 5.9
    }
  ],
  "recommendations": [
    {
      "type": "increase_budget",
      "icon": "lightbulb",
      "message": "Your campaign has a high CTR (6.3%). Consider increasing your daily budget to reach more customers."
    },
    {
      "type": "add_products",
      "icon": "location",
      "message": "You could increase visibility by adding complementary products like sand or gravel to this campaign."
    },
    {
      "type": "extend_campaign",
      "icon": "clock",
      "message": "This campaign is performing well. Consider extending it beyond Mar 30, 2025 for continued sales growth."
    }
  ]
}
```


---

## 🔔 Notification APIs

### 38. Get All Notifications

**Request:**
```http
GET http://localhost:3000/api/notifications?type=Order&isRead=false&page=1&limit=50
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `type` - Filter by type (Order, Product, Campaign, Review, Payment, System, or "All" for all types)
- `isRead` - Filter by read status (true/false)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "count": 6,
  "total": 6,
  "unreadCount": 3,
  "page": 1,
  "pages": 1,
  "notifications": [
    {
      "id": "507f1f77bcf86cd799439016",
      "type": "Order",
      "title": "New Order #INS42586",
      "message": "John D. Placed an order for 3 items with a total of $45.97.",
      "icon": "order",
      "isRead": false,
      "timeAgo": "30 minutes ago",
      "dateGroup": "Today",
      "createdAt": "2024-01-15T14:30:00.000Z",
      "relatedId": "507f1f77bcf86cd799439013",
      "relatedType": "Order",
      "metadata": {
        "orderNumber": "INS42586",
        "customerName": "John D.",
        "itemsCount": 3,
        "totalAmount": 45.97
      }
    },
    {
      "id": "507f1f77bcf86cd799439017",
      "type": "Product",
      "title": "Low Stock Alert",
      "message": "Your product 'Copper Pipes (10pcs)' has low stock (only 8 units left).",
      "icon": "alert",
      "isRead": false,
      "timeAgo": "2 hours ago",
      "dateGroup": "Today",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "relatedId": "507f1f77bcf86cd799439012",
      "relatedType": "Product",
      "metadata": {
        "productName": "Copper Pipes (10pcs)",
        "stockLevel": 8
      }
    },
    {
      "id": "507f1f77bcf86cd799439018",
      "type": "Campaign",
      "title": "Campaign Performance",
      "message": "Your 'Summer Building Materials' campaign is performing well with a 5.2% CTR.",
      "icon": "campaign",
      "isRead": false,
      "timeAgo": "4 hours ago",
      "dateGroup": "Today",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "relatedId": "507f1f77bcf86cd799439020",
      "relatedType": "Campaign",
      "metadata": {
        "campaignName": "Summer Building Materials",
        "ctr": 5.2
      }
    },
    {
      "id": "507f1f77bcf86cd799439019",
      "type": "Order",
      "title": "Order Delivered",
      "message": "Order #INS42556 has been delivered.",
      "icon": "order",
      "isRead": true,
      "timeAgo": "Yesterday at 4:32 PM",
      "dateGroup": "Yesterday",
      "createdAt": "2024-01-14T16:32:00.000Z",
      "relatedId": "507f1f77bcf86cd799439014",
      "relatedType": "Order",
      "metadata": {
        "orderNumber": "INS42556"
      }
    },
    {
      "id": "507f1f77bcf86cd799439020",
      "type": "Review",
      "title": "New 5-Star Review",
      "message": "Micheal K. left a 5-star review: \"Best supplier in the area! Their prices are competitive and...\"",
      "icon": "review",
      "isRead": true,
      "timeAgo": "Yesterday at 2:15 PM",
      "dateGroup": "Yesterday",
      "createdAt": "2024-01-14T14:15:00.000Z",
      "relatedId": "507f1f77bcf86cd799439015",
      "relatedType": "Review",
      "metadata": {
        "customerName": "Micheal K.",
        "rating": 5
      }
    },
    {
      "id": "507f1f77bcf86cd799439021",
      "type": "Payment",
      "title": "Payment Received",
      "message": "You received a payment of $89.99 for Order #INS42554",
      "icon": "payment",
      "isRead": true,
      "timeAgo": "Mar 12, 2025",
      "dateGroup": "Mar 12, 2025",
      "createdAt": "2024-03-12T00:00:00.000Z",
      "relatedId": "507f1f77bcf86cd799439013",
      "relatedType": "Payment",
      "metadata": {
        "amount": 89.99,
        "orderNumber": "INS42554"
      }
    }
  ],
  "groupedByDate": {
    "Today": [
      {
        "id": "507f1f77bcf86cd799439016",
        "type": "Order",
        "title": "New Order #INS42586",
        "message": "John D. Placed an order for 3 items with a total of $45.97.",
        "icon": "order",
        "isRead": false,
        "timeAgo": "30 minutes ago",
        "dateGroup": "Today",
        "createdAt": "2024-01-15T14:30:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439017",
        "type": "Product",
        "title": "Low Stock Alert",
        "message": "Your product 'Copper Pipes (10pcs)' has low stock (only 8 units left).",
        "icon": "alert",
        "isRead": false,
        "timeAgo": "2 hours ago",
        "dateGroup": "Today",
        "createdAt": "2024-01-15T12:00:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439018",
        "type": "Campaign",
        "title": "Campaign Performance",
        "message": "Your 'Summer Building Materials' campaign is performing well with a 5.2% CTR.",
        "icon": "campaign",
        "isRead": false,
        "timeAgo": "4 hours ago",
        "dateGroup": "Today",
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "Yesterday": [
      {
        "id": "507f1f77bcf86cd799439019",
        "type": "Order",
        "title": "Order Delivered",
        "message": "Order #INS42556 has been delivered.",
        "icon": "order",
        "isRead": true,
        "timeAgo": "Yesterday at 4:32 PM",
        "dateGroup": "Yesterday",
        "createdAt": "2024-01-14T16:32:00.000Z"
      },
      {
        "id": "507f1f77bcf86cd799439020",
        "type": "Review",
        "title": "New 5-Star Review",
        "message": "Micheal K. left a 5-star review: \"Best supplier in the area! Their prices are competitive and...\"",
        "icon": "review",
        "isRead": true,
        "timeAgo": "Yesterday at 2:15 PM",
        "dateGroup": "Yesterday",
        "createdAt": "2024-01-14T14:15:00.000Z"
      }
    ],
    "Mar 12, 2025": [
      {
        "id": "507f1f77bcf86cd799439021",
        "type": "Payment",
        "title": "Payment Received",
        "message": "You received a payment of $89.99 for Order #INS42554",
        "icon": "payment",
        "isRead": true,
        "timeAgo": "Mar 12, 2025",
        "dateGroup": "Mar 12, 2025",
        "createdAt": "2024-03-12T00:00:00.000Z"
      }
    ]
  }
}
```


---

### 39. Mark Notification as Read

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
  "notification": {
    "id": "507f1f77bcf86cd799439016",
    "type": "Order",
    "title": "New Order #INS42586",
    "message": "John D. Placed an order for 3 items with a total of $45.97.",
    "icon": "order",
    "isRead": true,
    "timeAgo": "30 minutes ago",
    "dateGroup": "Today",
    "createdAt": "2024-01-15T14:30:00.000Z",
    "relatedId": "507f1f77bcf86cd799439013",
    "relatedType": "Order",
    "metadata": {
      "orderNumber": "INS42586",
      "customerName": "John D.",
      "itemsCount": 3,
      "totalAmount": 45.97
    }
  }
}
```

---

### 40. Mark All Notifications as Read

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


---
## 📝 Notes

- All protected routes require `Authorization: Bearer <token>` header
- Image uploads use `multipart/form-data` content type
- All dates are in ISO 8601 format
- Error responses: `{ "success": false, "message": "Error message" }`

