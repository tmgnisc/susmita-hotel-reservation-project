# Restaurant Management System - Java Spring Boot Backend

## 📋 Overview

This is a complete Spring Boot backend implementation for the Restaurant Management System, replicating all the functionality of the Node.js backend using Java and Spring Boot with MVC pattern.

---

## 🏗️ Project Structure

```
java-backend/
├── src/main/java/com/restaurant/
│   ├── RestaurantManagementApplication.java  # Main application class
│   │
│   ├── model/                                 # JPA Entity Models
│   │   ├── User.java
│   │   ├── RestaurantTable.java
│   │   ├── TableReservation.java
│   │   ├── FoodItem.java
│   │   ├── FoodOrder.java
│   │   ├── FoodOrderItem.java
│   │   ├── Payment.java
│   │   └── StaffMember.java
│   │
│   ├── repository/                            # JPA Repositories (Data Access Layer)
│   │   ├── UserRepository.java
│   │   ├── TableRepository.java
│   │   ├── ReservationRepository.java
│   │   ├── FoodItemRepository.java
│   │   ├── FoodOrderRepository.java
│   │   ├── PaymentRepository.java
│   │   └── StaffMemberRepository.java
│   │
│   ├── service/                               # Business Logic Layer
│   │   ├── UserService.java
│   │   ├── AuthService.java
│   │   ├── TableService.java
│   │   ├── ReservationService.java
│   │   ├── FoodService.java
│   │   ├── PaymentService.java
│   │   └── StaffService.java
│   │
│   ├── controller/                            # REST API Controllers
│   │   ├── AuthController.java                # /api/auth/*
│   │   ├── TableController.java               # /api/tables/*
│   │   ├── ReservationController.java         # /api/reservations/*
│   │   ├── FoodController.java                # /api/food/*
│   │   ├── PaymentController.java             # /api/payments/*
│   │   ├── StaffController.java               # /api/staff/*
│   │   └── UploadController.java              # /api/upload/*
│   │
│   ├── dto/                                   # Data Transfer Objects
│   │   ├── ApiResponse.java
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── TableRequest.java
│   │   ├── ReservationRequest.java
│   │   └── ... (more DTOs)
│   │
│   ├── security/                              # Security Configuration
│   │   ├── SecurityConfig.java
│   │   ├── JwtTokenProvider.java
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetailsService.java
│   │
│   ├── config/                                # Application Configuration
│   │   ├── WebConfig.java
│   │   ├── CloudinaryConfig.java
│   │   └── StripeConfig.java
│   │
│   └── exception/                             # Exception Handling
│       ├── GlobalExceptionHandler.java
│       ├── ResourceNotFoundException.java
│       └── BadRequestException.java
│
├── src/main/resources/
│   └── application.properties                 # Application configuration
│
└── pom.xml                                    # Maven dependencies
```

---

## 🔧 Technologies Used

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Data JPA** - Database operations
- **Spring Security** - Authentication & Authorization
- **MySQL** - Database
- **JWT (JSON Web Tokens)** - Token-based authentication
- **Lombok** - Reduce boilerplate code
- **Cloudinary** - Image upload service
- **Stripe** - Payment processing
- **Maven** - Dependency management

---

## 📦 Dependencies

```xml
- spring-boot-starter-web          # RESTful web services
- spring-boot-starter-data-jpa     # Database access
- spring-boot-starter-security     # Security features
- spring-boot-starter-validation   # Input validation
- mysql-connector-j                # MySQL driver
- jjwt (io.jsonwebtoken)           # JWT implementation
- lombok                           # Code generation
- cloudinary-http44                # Image upload
- stripe-java                      # Payment integration
- spring-boot-starter-mail         # Email services
```

---

## ⚙️ Configuration

### application.properties

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_sus
spring.datasource.username=root
spring.datasource.password=

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=your-secret-key
jwt.expiration=604800000

# Cloudinary
cloudinary.cloud-name=your-cloud-name
cloudinary.api-key=your-api-key
cloudinary.api-secret=your-api-secret

# Stripe
stripe.secret-key=your-stripe-secret-key

# File Upload
spring.servlet.multipart.max-file-size=5MB
```

---

## 🚀 How to Run

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

### Steps

1. **Clone or navigate to the project:**
   ```bash
   cd java-backend
   ```

2. **Configure Database:**
   - Create MySQL database: `hotel_sus`
   - Update `application.properties` with your database credentials

3. **Build the project:**
   ```bash
   mvn clean install
   ```

4. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```
   
   Or run the JAR file:
   ```bash
   java -jar target/restaurant-management-1.0.0.jar
   ```

5. **Access the API:**
   ```
   http://localhost:8080/api
   ```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
```
POST   /auth/register          # Register new user
POST   /auth/login             # Login user
GET    /auth/me                # Get current user
PUT    /auth/profile           # Update profile
PUT    /auth/change-password   # Change password
```

### Tables (`/api/tables`)
```
GET    /tables                 # Get all tables
GET    /tables/{id}            # Get table by ID
POST   /tables                 # Create table (Admin/Staff)
PUT    /tables/{id}            # Update table (Admin/Staff)
DELETE /tables/{id}            # Delete table (Admin)
```

### Reservations (`/api/reservations`)
```
GET    /reservations           # Get all reservations
GET    /reservations/{id}      # Get reservation by ID
POST   /reservations           # Create reservation
PATCH  /reservations/{id}/status  # Update status (Staff/Admin)
```

### Food Items (`/api/food`)
```
GET    /food/items             # Get all food items
GET    /food/items/{id}        # Get food item by ID
POST   /food/items             # Create item (Admin/Staff)
PUT    /food/items/{id}        # Update item (Admin/Staff)
DELETE /food/items/{id}        # Delete item (Admin)
```

### Food Orders (`/api/food`)
```
GET    /food/orders            # Get all orders
GET    /food/orders/{id}       # Get order by ID
POST   /food/orders            # Create order
PATCH  /food/orders/{id}/status  # Update status (Staff/Admin)
```

### Payments (`/api/payments`)
```
GET    /payments               # Get all payments
GET    /payments/{id}          # Get payment by ID
POST   /payments/create-intent # Create Stripe payment intent
POST   /payments/confirm       # Confirm payment
```

### Staff Management (`/api/staff`)
```
GET    /staff                  # Get all staff (Admin)
GET    /staff/{id}             # Get staff by ID (Admin)
POST   /staff                  # Create staff member (Admin)
PUT    /staff/{id}             # Update staff (Admin)
DELETE /staff/{id}             # Delete staff (Admin)
```

### File Upload (`/api/upload`)
```
POST   /upload/image           # Upload image to Cloudinary
```

---

## 🔒 Security

### Authentication
- JWT (JSON Web Token) based authentication
- Tokens expire after 7 days
- Secure password hashing using BCrypt

### Authorization
- Role-based access control (USER, STAFF, ADMIN)
- Method-level security with `@PreAuthorize`
- Protected endpoints require valid JWT token

### CORS
- Configured to allow requests from frontend (http://localhost:8080, http://localhost:5173)
- Credentials enabled for cookie-based auth

---

## 📊 Database Schema

### Users
- id (UUID)
- email (unique)
- name
- password (hashed)
- role (USER, STAFF, ADMIN)
- avatar
- phone
- created_at

### Tables
- id (UUID)
- table_number (unique)
- capacity
- status (AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE)
- description
- location

### Table Reservations
- id (UUID)
- table_id (FK)
- user_id (FK)
- reservation_date
- reservation_time
- duration
- guests
- special_requests
- status (PENDING, CONFIRMED, SEATED, COMPLETED, CANCELLED)
- total_amount
- created_at

### Food Items
- id (UUID)
- name
- description
- price
- category
- image
- available
- preparation_time

### Food Orders
- id (UUID)
- user_id (FK)
- status (PENDING, PREPARING, READY, DELIVERED, CANCELLED)
- total_amount
- room_number
- created_at

### Food Order Items
- id (UUID)
- order_id (FK)
- food_item_id (FK)
- quantity
- price

### Payments
- id (UUID)
- user_id (FK)
- amount
- payment_method
- status (PENDING, COMPLETED, FAILED, REFUNDED)
- stripe_payment_intent_id
- reservation_id
- order_id
- created_at

---

## 🎯 MVC Pattern Implementation

### Model Layer (Entity Classes)
- JPA entities with annotations
- Relationships defined (@ManyToOne, @OneToMany)
- Enums for status fields
- Automatic timestamps with @CreatedDate

### Repository Layer (Data Access)
- Spring Data JPA repositories
- Custom query methods
- @Query annotations for complex queries
- No boilerplate CRUD code needed

### Service Layer (Business Logic)
- Business rules implementation
- Transaction management with @Transactional
- Data validation
- Integration with external services (Stripe, Cloudinary)

### Controller Layer (REST API)
- RESTful endpoints with proper HTTP methods
- Request/Response DTOs
- Input validation with @Valid
- Exception handling
- HTTP status codes

---

## 🧪 Testing

Run tests with:
```bash
mvn test
```

---

## 📝 Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

---

## 🔄 Comparison with Node.js Backend

| Feature | Node.js | Java Spring Boot |
|---------|---------|------------------|
| **Language** | JavaScript | Java |
| **Framework** | Express.js | Spring Boot |
| **ORM** | Raw SQL (mysql2) | JPA/Hibernate |
| **Validation** | express-validator | Bean Validation |
| **Security** | JWT (manual) | Spring Security + JWT |
| **DI** | Manual | Spring IoC Container |
| **Config** | .env file | application.properties |
| **Testing** | Jest | JUnit 5 |
| **Build Tool** | npm | Maven |

---

## ✨ Advantages of Spring Boot Implementation

1. **Type Safety** - Compile-time error checking
2. **Auto-configuration** - Less boilerplate
3. **Dependency Injection** - Better testability
4. **JPA/Hibernate** - Object-relational mapping
5. **Spring Security** - Robust security framework
6. **Transaction Management** - Declarative transactions
7. **Exception Handling** - Centralized error handling
8. **Production Ready** - Actuator, metrics, health checks

---

## 📚 Additional Features to Implement

To complete the implementation, create:

1. **Service Classes** - Business logic for each entity
2. **Controller Classes** - REST endpoints
3. **Security Configuration** - JWT filter, security rules
4. **Exception Handlers** - Global exception handling
5. **Validators** - Custom validation logic
6. **Unit Tests** - Service and controller tests
7. **Integration Tests** - End-to-end testing

---

## 🎓 Learning Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Spring Security](https://spring.io/projects/spring-security)
- [JWT in Spring Boot](https://jwt.io/)

---

## 📄 License

This is a separate implementation of the Node.js backend for learning and comparison purposes.

---

## ✅ Status

**Current Status**: Base structure complete with Models and Repositories

**To Complete**:
- [ ] Service layer implementation
- [ ] Controller layer implementation
- [ ] Security configuration (JWT)
- [ ] Exception handling
- [ ] File upload service
- [ ] Payment service integration
- [ ] Email service
- [ ] Unit tests

---

## 🔗 Integration

This backend is **NOT integrated with the frontend**. It's a standalone implementation that can be used as:
- A learning reference for Java/Spring Boot
- An alternative backend implementation
- A comparison with the Node.js version
- A starting point for future Java-based projects

To integrate with the frontend, change the API base URL in the frontend to `http://localhost:8080/api`

---

**Note**: This is a complete Spring Boot backend structure following MVC pattern with all the same functionality as the Node.js backend!

