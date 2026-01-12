# Hotel Sus Backend API

Node.js/Express backend API for the Hotel Sus management system with MySQL database.

## Features

- User authentication and authorization (JWT)
- Room management
- Booking system
- Food ordering system
- Staff management
- Payment integration (Stripe)
- Image upload support (Cloudinary)
- Email notifications (Nodemailer)

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hotel_sus
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
FRONTEND_URL=http://localhost:8080

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=your-upload-preset
CLOUDINARY_ASSET_FOLDER=your-folder

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

4. Run database migration to create all tables:
```bash
npm run migrate
```

This will:
- Create the database if it doesn't exist
- Create all required tables
- Create a default admin user (email: `admin@hotelsus.com`, password: `admin123`)

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires authentication)
- `PUT /api/auth/profile` - Update user profile (requires authentication)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID

### Rooms
- `GET /api/rooms` - Get all rooms (with optional filters: type, status, minPrice, maxPrice)
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Delete room (admin only)

### Bookings
- `GET /api/bookings` - Get all bookings (users see only their own)
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create booking (requires authentication)
- `PATCH /api/bookings/:id/status` - Update booking status (admin/staff only)
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Food
- `GET /api/food/items` - Get all food items
- `GET /api/food/items/:id` - Get food item by ID
- `POST /api/food/items` - Create food item (admin only)
- `PUT /api/food/items/:id` - Update food item (admin only)
- `DELETE /api/food/items/:id` - Delete food item (admin only)
- `GET /api/food/orders` - Get all food orders
- `GET /api/food/orders/:id` - Get food order by ID
- `POST /api/food/orders` - Create food order (requires authentication)
- `PATCH /api/food/orders/:id/status` - Update order status (admin/staff only)

### Staff
- `GET /api/staff` - Get all staff members (admin only)
- `GET /api/staff/:id` - Get staff member by ID
- `POST /api/staff` - Create staff member (admin only)
- `PUT /api/staff/:id` - Update staff member (admin only)
- `DELETE /api/staff/:id` - Delete staff member (admin only)

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/confirm` - Confirm payment
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments` - Get all payments (admin/staff only)

## Database Schema

The database includes the following tables:
- `users` - User accounts
- `rooms` - Hotel rooms
- `room_amenities` - Room amenities (many-to-many)
- `room_images` - Room images
- `bookings` - Room bookings
- `food_items` - Menu items
- `food_orders` - Food orders
- `food_order_items` - Order items (many-to-many)
- `staff_members` - Staff information
- `payments` - Payment records

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Default Admin Credentials

After running the migration:
- Email: `admin@hotelsus.com`
- Password: `admin123`

**Important**: Change the default admin password after first login!

## Error Handling

All API responses follow this format:

Success:
```json
{
  "success": true,
  "data": { ... }
}
```

Error:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Development

The server uses:
- Express.js for the web framework
- MySQL2 for database operations
- JWT for authentication
- bcryptjs for password hashing
- Stripe for payments
- Cloudinary for image storage
- Nodemailer for email notifications

## License

ISC










