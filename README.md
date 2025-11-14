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

This will install all required packages like Express, MongoDB, JWT, etc.

**What happens:** npm reads the `package.json` file and downloads all the libraries your project needs.

---

## ⚙️ Environment Setup

### Step 2: Create .env File

Create a file named `.env` in the root folder (same folder as `server.js`).

Copy and paste this template:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/supply_app

# JWT Secret (for authentication tokens)
# Generate a random string - you can use: https://randomkeygen.com/
JWT_SECRET=your_super_secret_jwt_key_here_change_this_to_random_string

# Email Configuration (for sending OTP codes)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Cloudinary Configuration (for image storage)
# Sign up at: https://cloudinary.com/
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Fill in Your Values

1. **JWT_SECRET**: 
   - Go to https://randomkeygen.com/
   - Copy a random string (at least 32 characters)
   - Paste it as your JWT_SECRET

2. **Email Settings** (for Gmail):
   - Use your Gmail address for `EMAIL_USER`
   - For `EMAIL_PASS`, you need an "App Password":
     - Go to Google Account → Security → 2-Step Verification → App Passwords
     - Generate a new app password
     - Use that password (not your regular Gmail password)

3. **Cloudinary** (for image uploads):
   - Sign up at https://cloudinary.com/ (free account works)
   - Go to Dashboard
   - Copy your Cloud Name, API Key, and API Secret
   - Paste them in the .env file

---

## 🗄️ Running MongoDB Locally

### Option 1: Install MongoDB on Your Computer

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Choose your operating system
   - Download and install

2. **Start MongoDB Service**

   **On Windows:**
   ```bash
   # MongoDB usually starts automatically after installation
   # If not, open Services and start "MongoDB" service
   ```

   **On Mac:**
   ```bash
   brew services start mongodb-community
   ```

   **On Linux:**
   ```bash
   sudo systemctl start mongod
   ```

3. **Verify MongoDB is Running**
   ```bash
   mongosh
   # If this opens MongoDB shell, you're good!
   # Type 'exit' to leave
   ```

### Option 2: Use MongoDB Atlas (Cloud - Easier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier works)
4. Get your connection string
5. Replace `MONGODB_URI` in `.env` with your Atlas connection string

**Example Atlas connection string:**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/supply_app?retryWrites=true&w=majority
```

---

## ▶️ Starting the Server

### Step 1: Make sure MongoDB is running

Check if MongoDB is running (see section above).

### Step 2: Start the server

In your terminal, run:

```bash
npm start
```

**What you should see:**
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

### Step 3: Test the server

Open your browser and go to:
```
http://localhost:3000
```

You should see:
```json
{
  "success": true,
  "message": "Welcome to InstaSupply Supplier Portal API",
  "version": "1.0.0"
}
```

**Success!** Your server is running! 🎉

---

## 🧪 Testing APIs with Postman

### Step 1: Import Postman Collection

1. Open Postman
2. Click "Import" button
3. Select the file `API_COLLECTION.json` from this project
4. All API endpoints will be imported

### Step 2: Set Up Environment Variables in Postman

1. In Postman, click "Environments" → "Create Environment"
2. Name it "InstaSupply Local"
3. Add these variables:
   - `base_url`: `http://localhost:3000`
   - `token`: (leave empty, will be filled after login)

### Step 3: Test Authentication

1. **Register a new user:**
   - Use: `POST {{base_url}}/api/auth/register`
   - Body (JSON):
     ```json
     {
       "name": "John Doe",
       "email": "john@example.com",
       "password": "password123",
       "phone": "1234567890"
     }
     ```
   - Click "Send"
   - Check your email for OTP code

2. **Verify OTP:**
   - Use: `POST {{base_url}}/api/auth/verify-otp`
   - Body (JSON):
     ```json
     {
       "email": "john@example.com",
       "otp": "1234"
     }
     ```
   - Copy the `token` from response
   - Paste it in Postman environment variable `token`

3. **Test Protected Route:**
   - Use: `GET {{base_url}}/api/users/me`
   - In "Authorization" tab, select "Bearer Token"
   - Paste your token
   - Click "Send"
   - You should see your user information

### Step 4: Test Other Endpoints

All endpoints are in the imported collection. Just make sure to:
- Add `Authorization: Bearer {{token}}` header for protected routes
- Fill in the request body with proper data

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
- `POST /api/auth/verify-otp` - Verify OTP and login
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
- `GET /api/dashboard/analytics` - Get analytics (protected)
- `GET /api/dashboard/kpis` - Get KPIs (protected)
- `GET /api/dashboard/sales-overview` - Get sales chart data (protected)
- `GET /api/dashboard/top-products` - Get top products (protected)
- `GET /api/dashboard/customer-demographics` - Get customer data (protected)

### Store Settings
- `GET /api/store/settings` - Get store settings (protected)
- `PUT /api/store/settings` - Update store settings (protected)
- `PUT /api/store/rating` - Update store rating (protected)

### Reviews
- `GET /api/reviews` - Get all reviews (protected)
- `GET /api/reviews/summary` - Get review summary (protected)
- `POST /api/reviews` - Create review (protected)
- `POST /api/reviews/:id/reply` - Add reply to review (protected)
- `POST /api/reviews/:id/upload-images` - Upload review images (protected)
- `DELETE /api/reviews/:id` - Delete review (protected)

### Campaigns
- `GET /api/campaigns` - Get all campaigns (protected)
- `GET /api/campaigns/:id` - Get single campaign (protected)
- `POST /api/campaigns` - Create campaign (protected)
- `PUT /api/campaigns/:id` - Update campaign (protected)
- `DELETE /api/campaigns/:id` - Delete campaign (protected)
- `GET /api/campaigns/:id/stats` - Get campaign statistics (protected)
- `GET /api/campaigns/:id/insights` - Get campaign insights (protected)
- `PUT /api/campaigns/:id/metrics` - Update campaign metrics (protected)

### Notifications
- `GET /api/notifications` - Get all notifications (protected)
- `PUT /api/notifications/:id/read` - Mark notification as read (protected)
- `PUT /api/notifications/read-all` - Mark all as read (protected)
- `DELETE /api/notifications/:id` - Delete notification (protected)

**Note:** All endpoints marked "(protected)" require a JWT token in the Authorization header.

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

**Error messages are user-friendly** - no technical stack traces are shown to users.

---

## 🔧 Troubleshooting

### Problem: "Cannot connect to MongoDB"

**Solution:**
1. Make sure MongoDB is running
2. Check your `MONGODB_URI` in `.env` file
3. Try connecting manually: `mongosh mongodb://localhost:27017/supply_app`

### Problem: "JWT_SECRET is missing"

**Solution:**
1. Make sure `.env` file exists in root folder
2. Check that `JWT_SECRET` is set in `.env`
3. Restart the server after changing `.env`

### Problem: "Email not sending"

**Solution:**
1. Check your email credentials in `.env`
2. For Gmail, use App Password (not regular password)
3. Make sure 2-Step Verification is enabled on Gmail

### Problem: "Cloudinary upload failed"

**Solution:**
1. Check your Cloudinary credentials in `.env`
2. Make sure you're using the correct Cloud Name, API Key, and API Secret
3. Verify your Cloudinary account is active

### Problem: "Port 3000 already in use"

**Solution:**
1. Change `PORT` in `.env` to a different number (e.g., `3001`)
2. Or stop the other program using port 3000

### Problem: "Module not found"

**Solution:**
1. Run `npm install` again
2. Make sure you're in the correct folder
3. Delete `node_modules` folder and `package-lock.json`, then run `npm install`

---

## 📝 Notes

- **Development Mode**: Server runs in development mode by default. Set `NODE_ENV=production` for production.
- **Image Uploads**: All images are stored on Cloudinary and return direct URLs.
- **Authentication**: JWT tokens expire after 30 days (configurable in `src/utils/generateToken.js`).
- **OTP Codes**: OTP codes expire after 1 minute.

---

## 🎉 You're All Set!

Your backend is ready to use. Start building your frontend or test the APIs with Postman!

For detailed API documentation with request/response examples, see `API_DOCUMENTATION.md`.

For quick API reference, see `API_REFERENCE.md`.

---

## 📞 Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Check the console logs for error messages
3. Verify all environment variables are set correctly
4. Make sure MongoDB is running

---

**Happy Coding! 🚀**
