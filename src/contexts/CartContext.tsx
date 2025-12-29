import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartFoodItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
  preparationTime?: number;
}

export interface CartRoomItem {
  id: string;
  name: string;
  price: number;
  images?: string[];
  type: string;
  capacity: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}

export interface CartItem {
  type: "food" | "room";
  foodItem?: CartFoodItem;
  roomItem?: CartRoomItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addFoodItem: (item: CartFoodItem) => void;
  addRoomItem: (item: CartRoomItem, checkIn: string, checkOut: string, guests: number) => void;
  updateQuantity: (itemId: string, type: "food" | "room", delta: number) => void;
  removeItem: (itemId: string, type: "food" | "room") => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getFoodItems: () => CartItem[];
  getRoomItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "hotel_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Save to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addFoodItem = (item: CartFoodItem) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.type === "food" && i.foodItem?.id === item.id
      );
      if (existing) {
        return prev.map((i) =>
          i.type === "food" && i.foodItem?.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { type: "food", foodItem: item, quantity: 1 }];
    });
  };

  const addRoomItem = (
    item: CartRoomItem,
    checkIn: string,
    checkOut: string,
    guests: number
  ) => {
    setItems((prev) => {
      // Remove existing room bookings (only one room booking at a time)
      const filtered = prev.filter((i) => i.type !== "room");
      return [
        ...filtered,
        {
          type: "room",
          roomItem: { ...item, checkIn, checkOut, guests },
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (
    itemId: string,
    type: "food" | "room",
    delta: number
  ) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.type === type) {
            if (type === "food" && item.foodItem?.id === itemId) {
              return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            if (type === "room" && item.roomItem?.id === itemId) {
              return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string, type: "food" | "room") => {
    setItems((prev) =>
      prev.filter((item) => {
        if (item.type === type) {
          if (type === "food") {
            return item.foodItem?.id !== itemId;
          }
          if (type === "room") {
            return item.roomItem?.id !== itemId;
          }
        }
        return true;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => {
      if (item.type === "food" && item.foodItem) {
        return sum + item.foodItem.price * item.quantity;
      }
      if (item.type === "room" && item.roomItem) {
        // Calculate nights
        if (item.roomItem.checkIn && item.roomItem.checkOut) {
          const checkIn = new Date(item.roomItem.checkIn);
          const checkOut = new Date(item.roomItem.checkOut);
          const nights = Math.ceil(
            (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + item.roomItem.price * nights * item.quantity;
        }
        return sum + item.roomItem.price * item.quantity;
      }
      return sum;
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getFoodItems = () => {
    return items.filter((item) => item.type === "food");
  };

  const getRoomItems = () => {
    return items.filter((item) => item.type === "room");
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addFoodItem,
        addRoomItem,
        updateQuantity,
        removeItem,
        clearCart,
        getTotal,
        getItemCount,
        getFoodItems,
        getRoomItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

