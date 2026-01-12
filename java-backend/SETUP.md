# Java Spring Boot Backend - Setup Guide

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

1. **Java Development Kit (JDK) 17 or higher**
   ```bash
   # Check Java version
   java -version
   
   # If not installed, download from:
   # https://www.oracle.com/java/technologies/downloads/
   # or use OpenJDK: https://openjdk.org/
   ```

2. **Maven 3.6 or higher**
   ```bash
   # Check Maven version
   mvn -version
   
   # If not installed:
   # - Ubuntu/Debian: sudo apt-get install maven
   # - Mac: brew install maven
   # - Windows: Download from https://maven.apache.org/download.cgi
   ```

3. **MySQL 8.0 or higher** (Already installed for Node.js backend)
   ```bash
   # MySQL should already be running for the Node.js backend
   mysql --version
   ```

---

## 📦 Installation Steps

### Step 1: Navigate to the Java Backend Directory

```bash
cd "/home/shifu/Downloads/susmita project/java-backend"
```

### Step 2: Update Configuration

The `application.properties` file is already configured to use the same database as the Node.js backend (`hotel_sus`).

If you need to change database credentials, edit:
```bash
nano src/main/resources/application.properties
```

Update these lines if needed:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_sus
spring.datasource.username=root
spring.datasource.password=your_password_if_any
```

### Step 3: Build the Project

```bash
# Clean and build the project
mvn clean install

# This will:
# - Download all dependencies
# - Compile the code
# - Run tests (if any)
# - Create a JAR file in target/ directory
```

### Step 4: Run the Application

#### Option A: Using Maven (Development Mode)
```bash
mvn spring-boot:run
```

#### Option B: Using the JAR file (Production Mode)
```bash
java -jar target/restaurant-management-1.0.0.jar
```

### Step 5: Verify the Application is Running

You should see output similar to:
```
✓ Restaurant Management System is running
✓ Server is running on port 8080
✓ API available at http://localhost:8080/api
✓ Environment: development
```

Test the API:
```bash
# Test with curl
curl http://localhost:8080/api/food/items

# Or open in browser
http://localhost:8080/api/food/items
```

---

## 🔧 Running Both Backends Simultaneously

**Important**: The Java backend runs on port **8080** (different from Node.js backend which runs on port **5000**).

### Terminal 1: Node.js Backend
```bash
cd "/home/shifu/Downloads/susmita project/backend"
npm run dev
# Runs on http://localhost:5000
```

### Terminal 2: Java Backend
```bash
cd "/home/shifu/Downloads/susmita project/java-backend"
mvn spring-boot:run
# Runs on http://localhost:8080
```

---

## 📊 Database Setup

The Java backend uses the **same database** (`hotel_sus`) as the Node.js backend.

### Auto Schema Creation

Spring Boot with Hibernate will automatically:
- Create missing tables
- Update table structures if models change
- Preserve existing data

This is configured in `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=update
```

### Manual Schema Check

To verify tables are created:
```bash
mysql -u root -p
USE hotel_sus;
SHOW TABLES;
```

---

## 🧪 Testing the API

### Using curl

```bash
# Get all tables
curl http://localhost:8080/api/tables

# Get all food items
curl http://localhost:8080/api/food/items

# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "1234567890"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Using Postman or Thunder Client

Import the following base URL:
```
http://localhost:8080/api
```

Test endpoints:
- GET `/tables`
- GET `/food/items`
- POST `/auth/register`
- POST `/auth/login`

---

## 🔄 Development Workflow

### Hot Reload

Spring Boot DevTools is included, which provides automatic restart when files change.

To enable it, just run:
```bash
mvn spring-boot:run
```

Any changes to `.java` files will automatically restart the application.

### View Logs

Logs are displayed in the terminal. To increase log level, edit `application.properties`:
```properties
logging.level.com.restaurant=DEBUG
```

---

## 🐛 Troubleshooting

### Port 8080 Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or change port in application.properties
server.port=8081
```

### Maven Build Fails

```bash
# Clear Maven cache
mvn clean

# Update dependencies
mvn dependency:purge-local-repository

# Rebuild
mvn clean install
```

### Database Connection Error

```bash
# Check MySQL is running
sudo service mysql status

# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'hotel_sus';"

# Verify credentials in application.properties
```

### Java Version Mismatch

```bash
# Check Java version
java -version

# Should be Java 17 or higher
# If not, install correct version and set JAVA_HOME
export JAVA_HOME=/path/to/java17
export PATH=$JAVA_HOME/bin:$PATH
```

---

## 📝 IDE Setup (Optional)

### IntelliJ IDEA

1. Open IntelliJ IDEA
2. File → Open
3. Select `java-backend` folder
4. IntelliJ will auto-detect Maven project
5. Right-click `RestaurantManagementApplication.java`
6. Run 'RestaurantManagementApplication'

### VS Code

1. Install extensions:
   - Extension Pack for Java
   - Spring Boot Extension Pack
2. Open `java-backend` folder
3. Press F5 to run
4. Or use command: `mvn spring-boot:run`

### Eclipse

1. File → Import → Existing Maven Projects
2. Select `java-backend` folder
3. Right-click project → Run As → Spring Boot App

---

## 🎯 Next Steps

After the backend is running:

1. **Test all endpoints** using Postman or curl
2. **Complete the Service layer** - Business logic for each entity
3. **Implement Security** - JWT authentication and authorization
4. **Add Exception Handling** - Global error handlers
5. **Write Unit Tests** - For services and controllers
6. **Integration Tests** - End-to-end API tests

---

## 📚 Useful Maven Commands

```bash
# Clean build
mvn clean

# Compile
mvn compile

# Run tests
mvn test

# Package (create JAR)
mvn package

# Skip tests
mvn install -DskipTests

# Run specific test
mvn test -Dtest=TestClassName

# Generate project info
mvn site
```

---

## 🔗 Compare with Node.js Backend

| Feature | Node.js | Java Spring Boot |
|---------|---------|------------------|
| **Port** | 5000 | 8080 |
| **Context Path** | /api | /api |
| **Hot Reload** | nodemon | DevTools |
| **Package Manager** | npm | Maven |
| **Start Command** | `npm run dev` | `mvn spring-boot:run` |

Both backends can run **simultaneously** and use the **same database**!

---

## ✅ Checklist

- [ ] Java 17+ installed
- [ ] Maven installed
- [ ] MySQL running
- [ ] Database `hotel_sus` exists
- [ ] Configuration updated
- [ ] Dependencies downloaded (`mvn install`)
- [ ] Application runs successfully
- [ ] API endpoints accessible
- [ ] No port conflicts

---

## 📞 Support

If you encounter issues:

1. Check the logs in terminal
2. Verify database connection
3. Ensure correct Java/Maven versions
4. Check port availability
5. Review `application.properties` configuration

---

**You're all set! The Java Spring Boot backend is now ready to use! 🎉**

