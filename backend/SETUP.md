# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Create .env File

Create a `.env` file in the `backend` directory with the following content:

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

# JWT Secret (Change this to a random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
FRONTEND_URL=http://localhost:8080

# Email Configuration (for OTP and notifications)
EMAIL_USER=sstream2023@gmail.com
EMAIL_PASS=ncrdgffgapmjvhgs

# Cloudinary Configuration (for image storage)
CLOUDINARY_CLOUD_NAME=dafjqlfj7
CLOUDINARY_API_KEY=357399486623525
CLOUDINARY_API_SECRET=AVtrjJXjvXpp-pNYo3euX7p1iBs
CLOUDINARY_UPLOAD_PRESET=finalyearproject
CLOUDINARY_ASSET_FOLDER=fyp

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_51Qw2xZGd5XQJoYaEDmnW2AjyqHOjBirZ9fARisAoSBr01flrls7MGvaW8N9yAHeti1VppAIut3StwvqPdUOWG3Pr00eifdgshP
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51Qw2xZGd5XQJoYaEAVWezOChviWUhg4FORS7VZjBwXNYcjwUzctSNpnzLFfsxuLgKQIRzFXGbIAOTwA4BF7a7wOv00k983tPDB
```

**Note**: Make sure MySQL is running and the database credentials are correct.

## Step 3: Run Database Migration

This will create the database and all tables automatically:

```bash
npm run migrate
```

After running this, you'll have:
- Database `hotel_sus` created
- All tables created
- Default admin user created:
  - Email: `admin@hotelsus.com`
  - Password: `admin123`

## Step 4: Start the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will be available at `http://localhost:5000`

## Step 5: Test the API

You can test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Or test login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotelsus.com","password":"admin123"}'
```

## Troubleshooting

### Database Connection Issues
- Make sure MySQL is running
- Verify database credentials in `.env`
- Check if the database user has proper permissions

### Port Already in Use
- Change the `PORT` in `.env` file
- Or stop the process using port 5000

### Migration Errors
- Make sure MySQL is running
- Check database user has CREATE DATABASE permission
- Verify `.env` file has correct database credentials










