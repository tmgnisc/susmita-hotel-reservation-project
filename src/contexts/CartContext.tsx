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

export interface CartTableItem {
  id: string;
  tableNumber: string;
  capacity: number;
  location?: string;
  reservationDate?: string;
  reservationTime?: string;
  duration?: number;
  guests?: number;
}

export interface CartItem {
  type: "food" | "table";
  foodItem?: CartFoodItem;
  tableItem?: CartTableItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addFoodItem: (item: CartFoodItem) => void;
  addTableItem: (item: CartTableItem, reservationDate: string, reservationTime: string, duration: number, guests: number) => void;
  updateQuantity: (itemId: string, type: "food" | "table", delta: number) => void;
  removeItem: (itemId: string, type: "food" | "table") => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getFoodItems: () => CartItem[];
  getTableItems: () => CartItem[];
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

  const addTableItem = (
    item: CartTableItem,
    reservationDate: string,
    reservationTime: string,
    duration: number,
    guests: number
  ) => {
    setItems((prev) => {
      // Remove existing table reservations (only one table reservation at a time)
      const filtered = prev.filter((i) => i.type !== "table");
      return [
        ...filtered,
        {
          type: "table",
          tableItem: { ...item, reservationDate, reservationTime, duration, guests },
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (
    itemId: string,
    type: "food" | "table",
    delta: number
  ) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.type === type) {
            if (type === "food" && item.foodItem?.id === itemId) {
              return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            // Table reservations don't have quantity changes
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string, type: "food" | "table") => {
    setItems((prev) =>
      prev.filter((item) => {
        if (item.type === type) {
          if (type === "food") {
            return item.foodItem?.id !== itemId;
          }
          if (type === "table") {
            return item.tableItem?.id !== itemId;
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
      // Table reservations are free (only food orders are charged)
      return sum;
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getFoodItems = () => {
    return items.filter((item) => item.type === "food");
  };

  const getTableItems = () => {
    return items.filter((item) => item.type === "table");
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addFoodItem,
        addTableItem,
        updateQuantity,
        removeItem,
        clearCart,
        getTotal,
        getItemCount,
        getFoodItems,
        getTableItems,
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



