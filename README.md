# InstaSupply Supplier Portal - Backend API

A complete backend API for the InstaSupply Supplier Portal built with Node.js, Express, and MongoDB.

## 📋 Table of Contents

- [What This Project Does](#what-this-project-does)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running MongoDB Locally](#running-mongodb-locally)
- [Starting the Server](#starting-the-server)
- [Testing APIs with Postman](#testing-apis-with-postman)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Troubleshooting](#troubleshooting)

---

## 🎯 What This Project Does

This backend API provides all the functionality needed for a supplier portal:

- **User Authentication**: Register, login with OTP, and manage user accounts
- **Product Management**: Create, update, delete, and search products with images
- **Order Management**: Handle orders, update status, and track customer information
- **Dashboard & Analytics**: View sales, orders, ratings, and business insights
- **Store Settings**: Manage operating hours, store status, and ratings
- **Reviews & Feedback**: Handle customer reviews and supplier replies
- **Campaigns**: Create and manage product campaigns and promotions
- **Notifications**: System notifications for new orders, low stock, etc.

---

## 📦 Prerequisites

Before you start, make sure you have these installed on your computer:

1. **Node.js** (version 14 or higher)
   - Download from: https://nodejs.org/
   - Check if installed: `node --version`

2. **MongoDB** (version 4.4 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud version)

3. **npm** (comes with Node.js)
   - Check if installed: `npm --version`

4. **Postman** (optional, for testing APIs)
   - Download from: https://www.postman.com/downloads/

---

## 🚀 Installation

### Step 1: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

---

## ⚙️ Environment Setup

### Step 2: Create .env File

Create a `.env` file in the root folder with:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/supply_app

JWT_SECRET=your_super_secret_jwt_key_here_change_this_to_random_string
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Configure Values

- **JWT_SECRET**: Generate random string (32+ chars) from https://randomkeygen.com/
- **Email**: Use Gmail with App Password (Google Account → Security → 2-Step Verification → App Passwords)
- **Cloudinary**: Sign up at https://cloudinary.com/ and get credentials from Dashboard

---

## 🗄️ Running MongoDB Locally

### Option 1: Install MongoDB Locally

1. Download from https://www.mongodb.com/try/download/community
2. Install and start service:
   - **Windows**: Starts automatically (or via Services)
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`
3. Verify: `mongosh` (type `exit` to leave)

### Option 2: Use MongoDB Atlas (Cloud)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string and update `MONGODB_URI` in `.env`

Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/supply_app?retryWrites=true&w=majority`

---

## ▶️ Starting the Server

1. Ensure MongoDB is running
2. Run: `npm start`

Expected output:
```
🚀 Starting InstaSupply Backend Server...
📦 Loading environment variables...
🔌 Connecting to MongoDB...
   📍 Connecting to: mongodb://localhost:27017/supply_app
   ✅ MongoDB Connected Successfully!
   📦 Database: supply_app
   🖥️  Host: localhost
📋 Setting up API routes...
✅ All routes loaded successfully

═══════════════════════════════════════════════════════
✅ InstaSupply Backend Server is Running!
═══════════════════════════════════════════════════════
🌐 Server URL: http://localhost:3000
📊 Environment: development
🗄️  Database: MongoDB
📝 API Base: http://localhost:3000/api
═══════════════════════════════════════════════════════
```

3. Test: Open http://localhost:3000 in browser

---

## 🧪 Testing APIs with Postman

1. Import `API_COLLECTION.json` into Postman
2. Create environment "InstaSupply Local" with:
   - `base_url`: `http://localhost:3000`
   - `token`: (leave empty, fill after login)
3. Test authentication:
   - Register: `POST {{base_url}}/api/auth/register`
   - Verify OTP: `POST {{base_url}}/api/auth/verify-otp`
   - Login: `POST {{base_url}}/api/auth/login` (copy token to environment)
   - Test protected route: `GET {{base_url}}/api/users/me` with Bearer token

For detailed API examples, see `API_EXAMPLES.md`.

---

## 📁 Project Structure

```
supply flow/
├── server.js                 # Main server file (starts the app)
├── package.json              # Project dependencies
├── .env                      # Environment variables (you create this)
│
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # MongoDB connection
│   │   └── cloudinary.js    # Cloudinary image storage setup
│   │
│   ├── models/              # Database models (schemas)
│   │   ├── User.js          # User/supplier data structure
│   │   ├── Product.js       # Product data structure
│   │   ├── Order.js         # Order data structure
│   │   ├── Review.js        # Review data structure
│   │   ├── Campaign.js      # Campaign data structure
│   │   ├── Notification.js  # Notification data structure
│   │   └── StoreSettings.js # Store settings structure
│   │
│   ├── controllers/         # Business logic (what happens when API is called)
│   │   ├── authController.js      # Login, register, OTP
│   │   ├── userController.js      # User profile management
│   │   ├── productController.js    # Product CRUD operations
│   │   ├── orderController.js     # Order management
│   │   ├── dashboardController.js  # Dashboard data
│   │   ├── storeController.js     # Store settings
│   │   ├── reviewController.js    # Reviews and feedback
│   │   ├── campaignController.js   # Campaigns
│   │   └── notificationController.js # Notifications
│   │
│   ├── routes/              # API routes (URLs)
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── storeRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── campaignRoutes.js
│   │   └── notificationRoutes.js
│   │
│   ├── middleware/          # Middleware (runs before routes)
│   │   ├── auth.js          # JWT token verification
│   │   └── upload.js        # File upload handling
│   │
│   └── utils/               # Helper functions
│       ├── generateOTP.js   # Generate 4-digit OTP
│       ├── sendEmail.js     # Send emails
│       └── generateToken.js # Create JWT tokens
│
└── API_COLLECTION.json      # Postman collection
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - Login
- `POST /api/auth/request-otp` - Request new OTP
- `POST /api/auth/logout` - Logout (protected)

### User Profile
- `GET /api/users/me` - Get current user (protected)
- `PUT /api/users/profile` - Update profile (protected)
- `POST /api/users/upload-profile-image` - Upload profile picture (protected)
- `GET /api/users/profile-info` - Get detailed profile (protected)

### Products
- `GET /api/products` - Get all products (protected)
- `GET /api/products/:id` - Get single product (protected)
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)
- `POST /api/products/:id/upload-image` - Upload product image (protected)
- `POST /api/products/:id/upload-images` - Upload multiple images (protected)
- `DELETE /api/products/:id/images/:imageIndex` - Delete product image (protected)
- `GET /api/products/categories` - Get all categories (protected)

### Orders
- `GET /api/orders` - Get all orders (protected)
- `GET /api/orders/recent` - Get recent orders (protected)
- `GET /api/orders/:id` - Get single order (protected)
- `POST /api/orders` - Create order (protected)
- `PUT /api/orders/:id` - Update order (protected)
- `PUT /api/orders/:id/status` - Update order status (protected)
- `DELETE /api/orders/:id` - Delete order (protected)

### Dashboard
- `GET /api/dashboard` - Get dashboard summary (protected)
- `GET /api/dashboard/kpis` - Get KPIs (protected)
- `GET /api/dashboard/sales-overview` - Get sales chart data (protected)
- `GET /api/dashboard/top-products` - Get top products (protected)
- `GET /api/dashboard/customer-demographics` - Get customer data (protected)

### Store Settings
- `GET /api/store/settings` - Get store settings (protected)
- `PUT /api/store/settings` - Update store settings (protected)

### Reviews
- `GET /api/reviews` - Get all reviews (protected)
- `GET /api/reviews/summary` - Get review summary (protected)
- `POST /api/reviews` - Create review
- `POST /api/reviews/:id/reply` - Add reply to review (protected)
- `POST /api/reviews/:id/upload-images` - Upload review images (protected)

### Campaigns
- `GET /api/campaigns` - Get all campaigns (protected)
- `POST /api/campaigns` - Create campaign (protected)
- `GET /api/campaigns/:id/insights` - Get campaign insights (protected)
- `GET /api/campaigns/top-ranking` - Get top ranking products (protected)
- `POST /api/campaigns/boost-ranking` - Boost product ranking (protected)

### Notifications
- `GET /api/notifications` - Get all notifications (protected)
- `PUT /api/notifications/:id/read` - Mark notification as read (protected)
- `PUT /api/notifications/read-all` - Mark all as read (protected)
- `DELETE /api/notifications/:id` - Delete notification (protected)

All endpoints marked "(protected)" require `Authorization: Bearer <token>` header.

---

## ⚠️ Error Handling

The API returns errors in a clean format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common Error Codes:**
- `400` - Bad Request (missing or invalid data)
- `401` - Unauthorized (not logged in or invalid token)
- `404` - Not Found (resource doesn't exist)
- `500` - Server Error (something went wrong on server)

Error messages are user-friendly (no stack traces).

---

## 🔧 Troubleshooting

**Cannot connect to MongoDB:**
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Test: `mongosh mongodb://localhost:27017/supply_app`

**JWT_SECRET is missing:**
- Verify `.env` exists in root folder
- Check `JWT_SECRET` is set
- Restart server after changes

**Email not sending:**
- Verify email credentials in `.env`
- Use Gmail App Password (not regular password)
- Enable 2-Step Verification on Gmail

**Cloudinary upload failed:**
- Check Cloudinary credentials in `.env`
- Verify account is active

**Port 3000 already in use:**
- Change `PORT` in `.env` to different number
- Or stop other program using port 3000

**Module not found:**
- Run `npm install`
- Delete `node_modules` and `package-lock.json`, then `npm install`

---

## 📝 Notes

- Server runs in development mode by default (`NODE_ENV=production` for production)
- Images stored on Cloudinary with direct URLs
- JWT tokens expire after 7 days (configurable)
- OTP codes expire after 1 minute

---

## 📚 Documentation

- **API Examples**: See `API_EXAMPLES.md` for detailed request/response examples
- **Features**: See `FEATURES_SUMMARY.md` for feature overview
- **Filters**: See `FILTERS_FEATURE.md` for filtering capabilities

---

**Happy Coding! 🚀**
