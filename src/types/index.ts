export type UserRole = "admin" | "staff" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export type TableStatus = "available" | "reserved" | "occupied" | "maintenance";

export interface Table {
  id: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  description?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReservationStatus = "pending" | "confirmed" | "seated" | "completed" | "cancelled";

export interface TableReservation {
  id: string;
  tableId: string;
  userId: string;
  reservationDate: string;
  reservationTime: string;
  duration: number;
  status: ReservationStatus;
  totalAmount: number;
  guests: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  tableNumber?: string;
  capacity?: number;
  location?: string;
}

export type FoodCategory = "appetizer" | "main" | "dessert" | "beverage";

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: FoodCategory;
  image: string;
  available: boolean;
  preparationTime: number;
}

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled";

export interface FoodOrder {
  id: string;
  userId: string;
  items: { foodItemId: string; quantity: number }[];
  status: OrderStatus;
  totalAmount: number;
  roomNumber?: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  avatar?: string;
  status: "active" | "inactive" | "on_leave";
  hireDate: string;
}

export interface DashboardStats {
  totalBookings: number;
  occupancyRate: number;
  totalRevenue: number;
  roomRevenue: number;
  foodRevenue: number;
  activeGuests: number;
  pendingCheckIns: number;
  pendingCheckOuts: number;
  monthlyBookings: { month: string; bookings: number; revenue: number }[];
  roomTypeDistribution: { type: string; count: number; percentage: number }[];
}
