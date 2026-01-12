# 🏗️ Architecture Overview - Java Spring Boot Backend

## 📐 MVC Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│              (Frontend / Postman / curl)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Requests
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SPRING BOOT APPLICATION                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              CONTROLLER LAYER                       │    │
│  │         (REST API Endpoints)                        │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐                │    │
│  │  │ Auth         │  │ Table        │                │    │
│  │  │ Controller   │  │ Controller   │                │    │
│  │  └──────┬───────┘  └──────┬───────┘                │    │
│  │         │                  │                         │    │
│  │  ┌──────┴───────┐  ┌──────┴───────┐                │    │
│  │  │ Reservation  │  │ Food         │                │    │
│  │  │ Controller   │  │ Controller   │                │    │
│  │  └──────────────┘  └──────────────┘                │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │              SERVICE LAYER                          │    │
│  │         (Business Logic)                            │    │
│  │                                                      │    │
│  │  ┌──────────────┐  ┌──────────────┐                │    │
│  │  │ Auth         │  │ Table        │                │    │
│  │  │ Service      │  │ Service      │                │    │
│  │  └──────┬───────┘  └──────┬───────┘                │    │
│  │         │                  │                         │    │
│  │  ┌──────┴───────┐  ┌──────┴───────┐                │    │
│  │  │ Reservation  │  │ Food         │                │    │
│  │  │ Service      │  │ Service      │                │    │
│  │  └──────────────┘  └──────────────┘                │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │           REPOSITORY LAYER                          │    │
│  │         (Data Access - JPA)                         │    │
│  │                                                      │    │
│  │  UserRepository   TableRepository                   │    │
│  │  ReservationRepository   FoodItemRepository         │    │
│  │  FoodOrderRepository   PaymentRepository            │    │
│  │  StaffMemberRepository                              │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                      │
│  ┌────────────────────┴───────────────────────────────┐    │
│  │              MODEL LAYER                            │    │
│  │         (JPA Entities)                              │    │
│  │                                                      │    │
│  │  User   RestaurantTable   TableReservation          │    │
│  │  FoodItem   FoodOrder   FoodOrderItem               │    │
│  │  Payment   StaffMember                              │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │ JDBC
                        ▼
              ┌──────────────────┐
              │      MySQL       │
              │   (hotel_sus)    │
              └──────────────────┘
```

---

## 🔄 Request Flow

```
1. HTTP Request
   ↓
2. Security Filter (JWT Validation)
   ↓
3. Controller (Endpoint Handler)
   ↓
4. Service (Business Logic)
   ↓
5. Repository (Data Access)
   ↓
6. Database (MySQL)
   ↓
7. Response (JSON)
```

---

## 📦 Layer Responsibilities

### 1. **Controller Layer** (API Endpoints)
```java
@RestController
@RequestMapping("/tables")
public class TableController {
    // Handles HTTP requests
    // Validates input
    // Returns responses
}
```

**Responsibilities:**
- Handle HTTP requests/responses
- Input validation
- Map URLs to methods
- Return proper HTTP status codes

---

### 2. **Service Layer** (Business Logic)
```java
@Service
public class TableService {
    // Business logic
    // Transaction management
    // External service integration
}
```

**Responsibilities:**
- Implement business rules
- Transaction management
- Coordinate between repositories
- External API calls (Stripe, Cloudinary)

---

### 3. **Repository Layer** (Data Access)
```java
@Repository
public interface TableRepository extends JpaRepository<RestaurantTable, String> {
    // Auto-generated CRUD methods
    // Custom query methods
}
```

**Responsibilities:**
- Database operations (CRUD)
- Query execution
- Data retrieval
- No business logic

---

### 4. **Model Layer** (Entities)
```java
@Entity
@Table(name = "tables")
public class RestaurantTable {
    // Fields mapped to database columns
    // Relationships
}
```

**Responsibilities:**
- Map to database tables
- Define relationships
- Represent domain objects
- No business logic

---

## 🔐 Security Architecture

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  JWT Filter         │  ◄── Validates token
│  (if token present) │      Extracts user info
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Security Config    │  ◄── Checks permissions
│  (Role-based)       │      USER/STAFF/ADMIN
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Controller        │  ◄── Processes request
└─────────────────────┘
```

### Security Flow:
1. **JWT Token** in `Authorization: Bearer <token>`
2. **JwtTokenProvider** validates token
3. **SecurityConfig** checks role permissions
4. **Controller** processes if authorized

---

## 🗄️ Database Relationships

```
User ──────┐
           │
           ├──< TableReservation >── RestaurantTable
           │
           ├──< FoodOrder ──< FoodOrderItem >── FoodItem
           │
           └──< Payment
           
StaffMember ──< User (OneToOne)
```

### Relationships Explained:
- **User → Reservations**: One-to-Many
- **User → Orders**: One-to-Many
- **User → Payments**: One-to-Many
- **Table → Reservations**: One-to-Many
- **Order → OrderItems**: One-to-Many
- **FoodItem → OrderItems**: One-to-Many
- **StaffMember → User**: One-to-One

---

## 🔀 Data Flow Example: Create Reservation

```
1. Frontend sends POST /api/reservations
   {
     "tableId": "abc",
     "reservationDate": "2026-01-15",
     "reservationTime": "19:00",
     "guests": 4
   }
   
2. ReservationController receives request
   ↓
   
3. ReservationService validates:
   - Table exists and available
   - No overlapping reservations
   - Valid date/time
   ↓
   
4. ReservationService creates reservation
   ↓
   
5. ReservationRepository saves to database
   ↓
   
6. Response sent back:
   {
     "success": true,
     "data": { ...reservation... }
   }
```

---

## 🎯 Dependency Injection Flow

```
┌─────────────────────┐
│  Spring Container   │
│  (IoC Container)    │
└──────────┬──────────┘
           │
           ├──> Creates UserRepository
           │
           ├──> Creates AuthService
           │    └─> Injects UserRepository
           │
           └──> Creates AuthController
                └─> Injects AuthService
```

**Key Points:**
- Spring manages bean lifecycle
- Dependencies auto-injected via constructor
- `@Autowired` not needed with constructor injection
- Loose coupling, easy testing

---

## 📂 Package Structure

```
com.restaurant/
│
├── model/              # Database entities
│   └── User.java
│
├── repository/         # Data access
│   └── UserRepository.java
│       extends JpaRepository
│
├── service/           # Business logic
│   └── UserService.java
│       uses UserRepository
│
├── controller/        # REST endpoints
│   └── UserController.java
│       uses UserService
│
├── dto/              # Data transfer objects
│   └── UserDTO.java
│
├── security/         # Security config
│   ├── SecurityConfig.java
│   └── JwtTokenProvider.java
│
├── config/           # App configuration
│   └── WebConfig.java
│
└── exception/        # Error handling
    └── GlobalExceptionHandler.java
```

---

## 🔄 Bean Lifecycle

```
1. Application starts
   ↓
2. Spring scans @Component, @Service, @Repository, @Controller
   ↓
3. Creates beans in order:
   - Repositories first
   - Services second (inject repositories)
   - Controllers third (inject services)
   ↓
4. Beans ready for use
   ↓
5. Application running
   ↓
6. Application stops → Beans destroyed
```

---

## 🧩 Component Relationships

```
AuthController
    ↓ depends on
AuthService
    ↓ depends on
UserRepository & JwtTokenProvider
    ↓ depends on
User (Entity)
    ↓ maps to
users (Database Table)
```

---

## 🎨 Design Patterns Used

### 1. **MVC Pattern**
- Model: Entities
- View: JSON responses
- Controller: REST controllers

### 2. **Repository Pattern**
- Abstract data access
- Hide database details

### 3. **Service Layer Pattern**
- Separate business logic
- Reusable services

### 4. **DTO Pattern**
- Separate API from domain models
- Control data exposure

### 5. **Dependency Injection**
- Spring IoC container
- Loose coupling

### 6. **Singleton Pattern**
- Spring beans (default scope)

### 7. **Factory Pattern**
- JPA entity creation
- Spring bean factory

---

## 🔧 Configuration Flow

```
application.properties
    ↓
Spring Boot Auto-configuration
    ↓
DataSource → JPA → Hibernate
    ↓
MySQL Connection
    ↓
Table Creation/Update (ddl-auto=update)
```

---

## 🚀 Startup Sequence

```
1. JVM starts
   ↓
2. RestaurantManagementApplication.main()
   ↓
3. Spring Boot initialization
   ↓
4. Load application.properties
   ↓
5. Database connection
   ↓
6. Hibernate schema update
   ↓
7. Bean creation (Repositories → Services → Controllers)
   ↓
8. Tomcat server starts (port 8080)
   ↓
9. Application ready
   ↓
10. Console: "✓ Restaurant Management System is running"
```

---

## 🔍 Request/Response Cycle

```
HTTP Request
    ↓
Tomcat Server
    ↓
DispatcherServlet
    ↓
HandlerMapping (finds controller method)
    ↓
Security Filter (JWT validation)
    ↓
Controller Method
    ↓
Service Method
    ↓
Repository Method
    ↓
Hibernate/JPA
    ↓
JDBC
    ↓
MySQL Database
    ↓
Result back up the chain
    ↓
JSON Response
```

---

## 🎯 API Response Format

All APIs return standardized responses:

```java
{
  "success": true/false,
  "message": "Optional message",
  "data": { /* actual data */ }
}
```

Handled by `ApiResponse<T>` DTO:
```java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
}
```

---

## 🔒 Authentication Flow

```
1. User → POST /auth/login
   ↓
2. AuthController validates credentials
   ↓
3. AuthService checks password (BCrypt)
   ↓
4. JwtTokenProvider generates JWT token
   ↓
5. Return token to user
   ↓
6. User includes token in subsequent requests
   ↓
7. Security filter validates token
   ↓
8. Request processed if valid
```

---

## 📊 Technology Stack Layers

```
┌─────────────────────────────┐
│      Presentation Layer     │  ← Controllers (REST API)
├─────────────────────────────┤
│      Business Layer         │  ← Services (Logic)
├─────────────────────────────┤
│      Persistence Layer      │  ← Repositories (JPA)
├─────────────────────────────┤
│      Data Layer             │  ← Entities (Models)
├─────────────────────────────┤
│      Database Layer         │  ← MySQL
└─────────────────────────────┘

Cross-cutting concerns:
- Security (Spring Security + JWT)
- Exception Handling (Global Handler)
- Validation (Bean Validation)
- Transaction Management (@Transactional)
```

---

## 🎓 Spring Boot Magic

Spring Boot provides:
- ✅ Auto-configuration
- ✅ Embedded Tomcat server
- ✅ Dependency management
- ✅ Production-ready features
- ✅ No XML configuration needed
- ✅ Convention over configuration

---

## 🔄 Comparison with Node.js Architecture

| Layer | Node.js | Spring Boot |
|-------|---------|-------------|
| **Router** | Express routes | Controllers |
| **Logic** | Route handlers | Services |
| **Database** | mysql2 (raw SQL) | JPA Repositories |
| **Models** | None (raw data) | JPA Entities |
| **DI** | Manual | Spring IoC |
| **Security** | Manual JWT | Spring Security |
| **Validation** | express-validator | Bean Validation |

---

## 📝 Summary

This architecture provides:
1. **Clear separation of concerns** (MVC)
2. **Easy to test** (dependency injection)
3. **Scalable** (modular design)
4. **Maintainable** (organized structure)
5. **Secure** (Spring Security)
6. **Type-safe** (Java + JPA)
7. **Production-ready** (Spring Boot)

**The architecture follows industry best practices for enterprise Java applications!**

