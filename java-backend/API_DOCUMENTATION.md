# API Documentation - Java Spring Boot Backend

## 📍 Base URL
```
http://localhost:8080/api
```

---

## 🔐 Authentication APIs

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "jwt.token.here"
  }
}
```

---

### Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "jwt.token.here"
  }
}
```

---

### Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "avatar": "https://...",
    "phone": "1234567890"
  }
}
```

---

## 🍽️ Table Management APIs

### Get All Tables
**GET** `/tables`

**Query Parameters:**
- `status` (optional): Filter by status (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "tableNumber": "T-101",
      "capacity": 4,
      "status": "AVAILABLE",
      "description": "Window side table",
      "location": "Main Hall"
    }
  ]
}
```

---

### Get Table by ID
**GET** `/tables/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "tableNumber": "T-101",
    "capacity": 4,
    "status": "AVAILABLE",
    "description": "Window side table",
    "location": "Main Hall"
  }
}
```

---

### Create Table
**POST** `/tables`

**Request Body:**
```json
{
  "tableNumber": "T-101",
  "capacity": 4,
  "status": "AVAILABLE",
  "description": "Window side table",
  "location": "Main Hall"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Table created successfully",
  "data": { /* table object */ }
}
```

---

### Update Table
**PUT** `/tables/{id}`

**Request Body:**
```json
{
  "capacity": 6,
  "status": "MAINTENANCE"
}
```

---

### Delete Table
**DELETE** `/tables/{id}`

**Response:**
```json
{
  "success": true,
  "message": "Table deleted successfully"
}
```

---

## 📅 Reservation APIs

### Get All Reservations
**GET** `/reservations`

**Query Parameters:**
- `userId` (optional): Filter by user
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "table": { /* table object */ },
      "user": { /* user object */ },
      "reservationDate": "2026-01-15",
      "reservationTime": "19:00:00",
      "duration": 60,
      "guests": 4,
      "specialRequests": "Window seat",
      "status": "CONFIRMED",
      "totalAmount": 100.00,
      "createdAt": "2026-01-12T10:00:00"
    }
  ]
}
```

---

### Create Reservation
**POST** `/reservations`

**Request Body:**
```json
{
  "tableId": "table-uuid",
  "userId": "user-uuid",
  "reservationDate": "2026-01-15",
  "reservationTime": "19:00:00",
  "duration": 60,
  "guests": 4,
  "specialRequests": "Window seat",
  "totalAmount": 100.00
}
```

---

### Update Reservation Status
**PATCH** `/reservations/{id}/status`

**Request Body:**
```json
{
  "status": "CONFIRMED"
}
```

**Status Values:** `PENDING`, `CONFIRMED`, `SEATED`, `COMPLETED`, `CANCELLED`

---

### Cancel Reservation
**DELETE** `/reservations/{id}`

---

## 🍔 Food Item APIs

### Get All Food Items
**GET** `/food/items`

**Query Parameters:**
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Chicken Burger",
      "description": "Juicy grilled chicken burger",
      "price": 12.99,
      "category": "Main Course",
      "image": "https://...",
      "available": true,
      "preparationTime": 15
    }
  ]
}
```

---

### Get Food Item by ID
**GET** `/food/items/{id}`

---

### Create Food Item
**POST** `/food/items`

**Request Body:**
```json
{
  "name": "Chicken Burger",
  "description": "Juicy grilled chicken burger",
  "price": 12.99,
  "category": "Main Course",
  "image": "https://...",
  "available": true,
  "preparationTime": 15
}
```

---

### Update Food Item
**PUT** `/food/items/{id}`

---

### Delete Food Item
**DELETE** `/food/items/{id}`

---

## 🛒 Food Order APIs

### Get All Orders
**GET** `/food/orders`

**Query Parameters:**
- `userId` (optional): Filter by user
- `status` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": { /* user object */ },
      "status": "PREPARING",
      "totalAmount": 45.99,
      "roomNumber": "101",
      "items": [
        {
          "id": "uuid",
          "foodItem": { /* food item object */ },
          "quantity": 2,
          "price": 12.99
        }
      ],
      "createdAt": "2026-01-12T10:00:00"
    }
  ]
}
```

---

### Create Order
**POST** `/food/orders`

**Request Body:**
```json
{
  "userId": "user-uuid",
  "roomNumber": "101",
  "items": [
    {
      "foodItemId": "item-uuid",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "totalAmount": 45.99
}
```

---

### Update Order Status
**PATCH** `/food/orders/{id}/status`

**Request Body:**
```json
{
  "status": "READY"
}
```

**Status Values:** `PENDING`, `PREPARING`, `READY`, `DELIVERED`, `CANCELLED`

---

## 💳 Payment APIs

### Get All Payments
**GET** `/payments`

---

### Create Payment Intent
**POST** `/payments/create-intent`

**Request Body:**
```json
{
  "amount": 100.00,
  "reservationId": "reservation-uuid",
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx"
  }
}
```

---

### Confirm Payment
**POST** `/payments/confirm`

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "reservationId": "reservation-uuid",
  "userId": "user-uuid"
}
```

---

## 👥 Staff Management APIs

### Get All Staff
**GET** `/staff`

**Authorization:** Admin only

---

### Create Staff Member
**POST** `/staff`

**Authorization:** Admin only

**Request Body:**
```json
{
  "userId": "user-uuid",
  "department": "Kitchen",
  "position": "Chef",
  "salary": 5000.00,
  "hireDate": "2026-01-01T00:00:00"
}
```

---

### Update Staff
**PUT** `/staff/{id}`

**Authorization:** Admin only

---

### Delete Staff
**DELETE** `/staff/{id}`

**Authorization:** Admin only

---

## 📤 File Upload API

### Upload Image
**POST** `/upload/image`

**Request:** Multipart form data with file field

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cloudinary.com/...",
    "publicId": "image-public-id"
  }
}
```

---

## 📊 Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

---

## 🔑 Authorization

Most endpoints require JWT token in the Authorization header:

```
Authorization: Bearer {your-jwt-token}
```

**Role-based Access:**
- **USER**: Can create reservations, orders, view own data
- **STAFF**: Can manage tables, update reservation/order status
- **ADMIN**: Full access to all endpoints

---

## 📝 Notes

1. All timestamps are in ISO 8601 format
2. All monetary values are in decimal format (2 decimal places)
3. UUIDs are used for all entity IDs
4. CORS is enabled for localhost:8080 and localhost:5173
5. No authentication required for GET endpoints (except /auth/me)
6. Authentication required for POST, PUT, PATCH, DELETE operations

---

## 🧪 Testing

Use tools like:
- **Postman** - GUI-based API testing
- **curl** - Command-line testing
- **Thunder Client** - VS Code extension
- **Insomnia** - Another popular API client

---

**This documentation covers all the main endpoints. Refer to the controller classes for complete details on each endpoint.**

