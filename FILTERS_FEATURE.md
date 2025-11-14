# Product Filters & Sorting Feature

## Overview

The product listing endpoint now supports comprehensive filtering and sorting capabilities matching the Figma Filters screen design.

## Filter Parameters

### 1. Category Filter
Filter products by category.

**Query Parameter:** `category`

**Values:**
- `All` - Show all categories
- `Building Materials`
- `Tools`
- `Electrical`
- `Plumbing`
- `Hardware`
- `Other`

**Example:**
```
GET /api/products?category=Building Materials
```

### 2. Price Range Filter
Filter products by price range.

**Query Parameters:**
- `minPrice` - Minimum price (number)
- `maxPrice` - Maximum price (number)

**Example:**
```
GET /api/products?minPrice=10&maxPrice=50
```

### 3. Stock Status Filter
Filter products by inventory status.

**Query Parameter:** `stockStatus`

**Values:** Comma-separated list of:
- `inStock` - Stock > lowStockThreshold
- `lowStock` - Stock > 0 AND stock <= lowStockThreshold
- `outOfStock` - Stock === 0

**Example:**
```
GET /api/products?stockStatus=inStock,lowStock
```

### 4. Search Filter
Search products by name or description.

**Query Parameter:** `search`

**Example:**
```
GET /api/products?search=cement
```

## Sort Options

**Query Parameter:** `sortBy`

**Available Options:**

1. **`newest`** (default)
   - Sort by creation date (newest first)

2. **`price-low-to-high`**
   - Sort by price ascending

3. **`price-high-to-low`**
   - Sort by price descending

4. **`best-selling`**
   - Sort by sold quantity (highest first)
   - Falls back to newest if sold quantities are equal

**Example:**
```
GET /api/products?sortBy=price-low-to-high
```

## Combined Filters Example

You can combine multiple filters and sorting:

```
GET /api/products?category=Building Materials&minPrice=10&maxPrice=50&stockStatus=inStock,lowStock&sortBy=price-low-to-high&page=1&limit=20
```

This will:
- Filter by "Building Materials" category
- Filter by price range $10-$50
- Show only in-stock and low-stock items
- Sort by price (low to high)
- Return page 1 with 20 items per page

## Response Format

Each product in the response includes a `stockStatus` field for convenience:

```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "products": [
    {
      "_id": "...",
      "name": "Premium Cement (50kg)",
      "category": "Building Materials",
      "price": 12.99,
      "stock": 120,
      "lowStockThreshold": 10,
      "soldQuantity": 45,
      "stockStatus": "inStock",  // Added for frontend convenience
      "image": "...",
      ...
    }
  ]
}
```

## Best Selling Tracking

The `soldQuantity` field is automatically updated when:
- An order is created (incremented by order quantity)
- An order is cancelled (decremented by order quantity)

This allows accurate tracking of best-selling products for the "Best Selling" sort option.

## Frontend Integration

The filters screen can send all filter parameters in a single request:

```javascript
// Example filter state
const filters = {
  category: "Building Materials",
  minPrice: 10,
  maxPrice: 50,
  stockStatus: "inStock,lowStock",
  sortBy: "price-high-to-low",
  search: "cement"
};

// Build query string
const queryParams = new URLSearchParams();
if (filters.category && filters.category !== 'All') {
  queryParams.append('category', filters.category);
}
if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
if (filters.stockStatus) queryParams.append('stockStatus', filters.stockStatus);
if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
if (filters.search) queryParams.append('search', filters.search);

// Make API call
fetch(`/api/products?${queryParams.toString()}`)
```

## Reset Filters

To reset all filters, simply call the endpoint without any query parameters:

```
GET /api/products
```

This will return all products sorted by newest first.

