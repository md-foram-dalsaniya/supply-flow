# Supplier Review System - Design Documentation

## Overview

The review system is **supplier-based**, not product-based. Customers review the entire supplier/store experience, not individual products. This provides a holistic view of the supplier's service quality, product quality, delivery, and overall customer satisfaction.

---

## Database Model Structure

### Review Model (`src/models/Review.js`)

```javascript
{
  supplier: ObjectId,        // Required - The supplier being reviewed
  customerName: String,      // Required - Name of the reviewer
  customerEmail: String,     // Optional - Email of the reviewer
  rating: Number,            // Required - 1 to 5 stars
  reviewText: String,        // Optional - Written comment/feedback
  images: [String],          // Optional - Array of Cloudinary image URLs (up to 5)
  reply: {                   // Optional - Supplier's reply to the review
    companyName: String,
    replyText: String,
    createdAt: Date
  },
  isVisible: Boolean,        // Default: true - For soft delete
  createdAt: Date,
  updatedAt: Date
}
```

**Key Points:**
- ✅ Reviews are linked to `supplier` (User model), NOT products
- ✅ Multiple images supported (up to 5 per review)
- ✅ Suppliers can reply to reviews
- ✅ Soft delete via `isVisible` flag

### StoreSettings Model (`src/models/StoreSettings.js`)

Automatically maintains aggregate rating statistics:

```javascript
{
  supplier: ObjectId,        // Unique - One settings per supplier
  rating: Number,            // Average rating (0-5)
  totalRatings: Number,     // Sum of all ratings
  ratingCount: Number,      // Number of reviews
  // ... other store settings
}
```

**Auto-updated** when a new review is created.

---

## API Endpoints

### 1. Create Review
**POST** `/api/reviews`

**Access:** Public (no authentication required)

**Request Body (JSON - without images):**
```json
{
  "supplierId": "507f1f77bcf86cd799439011",
  "customerName": "John Customer",
  "customerEmail": "john@example.com",
  "rating": 5,
  "comment": "Excellent service and quality products!"
}
```

**Request Body (form-data - with images):**
- `supplierId`: Text
- `customerName`: Text
- `customerEmail`: Text (optional)
- `rating`: Text (1-5)
- `comment`: Text
- `images`: File (can add multiple, up to 5)

**Response:**
```json
{
  "success": true,
  "message": "Review created successfully",
  "review": {
    "_id": "...",
    "supplier": "...",
    "customerName": "John Customer",
    "rating": 5,
    "reviewText": "Excellent service...",
    "images": ["https://..."],
    "createdAt": "..."
  }
}
```

### 2. Get Reviews (Supplier View)
**GET** `/api/reviews`

**Access:** Private (supplier must be authenticated)

**Query Parameters:**
- `rating`: Filter by rating (1-5 or 'all')
- `sortBy`: 'recent', 'oldest', 'highest', 'lowest'
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 3,
  "ratingDistribution": {
    "5": 60,
    "4": 25,
    "3": 10,
    "2": 3,
    "1": 2
  },
  "reviews": [...]
}
```

### 3. Get Review Summary
**GET** `/api/reviews/summary`

**Access:** Private (supplier must be authenticated)

**Response:**
```json
{
  "success": true,
  "summary": {
    "averageRating": "4.5",
    "totalReviews": 50,
    "ratingDistribution": {
      "5": 30,
      "4": 15,
      "3": 3,
      "2": 1,
      "1": 1
    }
  }
}
```

### 4. Add Reply to Review
**POST** `/api/reviews/:id/reply`

**Access:** Private (supplier must be authenticated)

**Request:**
```json
{
  "replyText": "Thank you for your feedback!",
  "companyName": "Urban Supply Co." // Optional, defaults to supplier name
}
```

### 5. Upload Review Images (Separate Endpoint)
**POST** `/api/reviews/:id/upload-images`

**Access:** Public (or can be restricted)

**Note:** Images can also be uploaded during review creation (recommended).

### 6. Delete Review (Soft Delete)
**DELETE** `/api/reviews/:id`

**Access:** Private (supplier must be authenticated)

Sets `isVisible: false` instead of hard delete.

---

## Data Flow

### Creating a Review

1. **Customer submits review** (with or without images)
2. **System validates:**
   - `supplierId` exists
   - `rating` is 1-5
   - `customerName` is provided
3. **Upload images** (if provided) to Cloudinary
4. **Create review** in database
5. **Update StoreSettings:**
   - Recalculate average rating
   - Increment rating count
   - Update total ratings sum

### Viewing Reviews

1. **Supplier requests reviews** (authenticated)
2. **System filters** by supplier ID
3. **Applies filters** (rating, sort order)
4. **Returns paginated results** with rating distribution

---

## Key Design Decisions

### ✅ Why Supplier-Based Reviews?

1. **Holistic Evaluation:** Customers evaluate the entire supplier experience (products, service, delivery, communication)
2. **Simpler Structure:** One review per customer-supplier interaction, not per product
3. **Better for Suppliers:** Focuses on overall reputation rather than individual product ratings
4. **Easier Management:** Suppliers manage one set of reviews, not hundreds of product reviews

### ✅ Image Support

- **Up to 5 images** per review
- **Uploaded to Cloudinary** during review creation
- **Stored as URLs** in the `images` array
- **Optional** - reviews can be created without images

### ✅ Rating System

- **1-5 star rating** (required)
- **Written comment** (optional but recommended)
- **Automatic aggregation** in StoreSettings
- **Rating distribution** calculated for analytics

### ✅ Reply System

- **Suppliers can reply** to reviews
- **Stored in review document** (embedded)
- **Includes company name** and reply text
- **Timestamped** automatically

---

## Example Use Cases

### Use Case 1: Customer Leaves Review
```
1. Customer completes order with Supplier A
2. Customer visits supplier's profile
3. Customer creates review:
   - Rating: 5 stars
   - Comment: "Great products and fast delivery!"
   - Images: 2 photos of delivered products
4. Review is saved and supplier's average rating updates
```

### Use Case 2: Supplier Views Reviews
```
1. Supplier logs in
2. Supplier navigates to Reviews section
3. System shows:
   - Average rating: 4.5/5
   - Total reviews: 50
   - Rating breakdown (5★: 60%, 4★: 25%, etc.)
   - List of all reviews (paginated)
4. Supplier can filter by rating, sort by date
```

### Use Case 3: Supplier Replies to Review
```
1. Supplier sees a negative review (2 stars)
2. Supplier clicks "Reply"
3. Supplier writes: "We apologize for the issue. Please contact us..."
4. Reply is saved and displayed with the review
```

---

## Testing the API

### Create Review (JSON - No Images)
```bash
POST http://localhost:3000/api/reviews
Content-Type: application/json

{
  "supplierId": "YOUR_SUPPLIER_ID",
  "customerName": "Test Customer",
  "rating": 5,
  "comment": "Great service!"
}
```

### Create Review (Form-Data - With Images)
In Postman:
1. Select `POST` method
2. URL: `http://localhost:3000/api/reviews`
3. Body → `form-data`
4. Add fields:
   - `supplierId`: Text → `YOUR_SUPPLIER_ID`
   - `customerName`: Text → `Test Customer`
   - `rating`: Text → `5`
   - `comment`: Text → `Great service!`
   - `images`: File → Select image file
   - `images`: File → Select another image (optional)

---

## Summary

✅ **Supplier-based reviews** (not product-based)  
✅ **Rating (1-5)** + **Comment** + **Images (up to 5)**  
✅ **Public creation** (no auth required)  
✅ **Supplier can reply** to reviews  
✅ **Automatic rating aggregation** in StoreSettings  
✅ **Pagination, filtering, sorting** for viewing reviews  
✅ **Soft delete** via `isVisible` flag  

The system is designed to be simple, flexible, and focused on overall supplier reputation rather than individual product ratings.

