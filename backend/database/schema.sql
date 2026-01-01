-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff', 'user') NOT NULL DEFAULT 'user',
  avatar TEXT,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Tables Table
CREATE TABLE IF NOT EXISTS tables (
  id VARCHAR(36) PRIMARY KEY,
  table_number VARCHAR(20) UNIQUE NOT NULL,
  capacity INT NOT NULL,
  status ENUM('available', 'reserved', 'occupied', 'maintenance') NOT NULL DEFAULT 'available',
  description TEXT,
  location VARCHAR(255) COMMENT 'e.g., "Window", "Patio", "Main Hall"',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_table_number (table_number),
  INDEX idx_capacity (capacity)
);

-- Table Reservations Table
CREATE TABLE IF NOT EXISTS table_reservations (
  id VARCHAR(36) PRIMARY KEY,
  table_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration INT DEFAULT 120 COMMENT 'Duration in minutes',
  status ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  guests INT NOT NULL,
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_user_id (user_id),
  INDEX idx_table_id (table_id),
  INDEX idx_status (status),
  INDEX idx_reservation_date (reservation_date),
  INDEX idx_reservation_time (reservation_time)
);

-- Food Items Table
CREATE TABLE IF NOT EXISTS food_items (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category ENUM('appetizer', 'main', 'dessert', 'beverage') NOT NULL,
  image TEXT,
  available BOOLEAN DEFAULT TRUE,
  preparation_time INT DEFAULT 0 COMMENT 'Preparation time in minutes',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_available (available)
);

-- Food Orders Table
CREATE TABLE IF NOT EXISTS food_orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'preparing', 'ready', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  room_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- Food Order Items Table (Many-to-Many relationship)
CREATE TABLE IF NOT EXISTS food_order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  food_item_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL COMMENT 'Price at time of order',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES food_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE RESTRICT,
  INDEX idx_order_id (order_id),
  INDEX idx_food_item_id (food_item_id)
);

-- Staff Members Table (can be linked to users or standalone)
CREATE TABLE IF NOT EXISTS staff_members (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar TEXT,
  status ENUM('active', 'inactive', 'on_leave') NOT NULL DEFAULT 'active',
  hire_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_department (department)
);

-- Payments Table (for Stripe integration)
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  reservation_id VARCHAR(36),
  order_id VARCHAR(36),
  user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES table_reservations(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES food_orders(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_stripe_payment_intent_id (stripe_payment_intent_id)
);

