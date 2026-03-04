"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { MenuItem } from "@/lib/menu-data";

export interface CartItem {
    item: MenuItem;
    quantity: number;
}

interface CartState {
    items: CartItem[];
}

type CartAction =
    | { type: "ADD_ITEM"; item: MenuItem }
    | { type: "REMOVE_ITEM"; id: string }
    | { type: "INCREASE"; id: string }
    | { type: "DECREASE"; id: string }
    | { type: "CLEAR" };

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case "ADD_ITEM": {
            const existing = state.items.find((ci) => ci.item.id === action.item.id);
            if (existing) {
                return {
                    items: state.items.map((ci) =>
                        ci.item.id === action.item.id
                            ? { ...ci, quantity: ci.quantity + 1 }
                            : ci
                    ),
                };
            }
            return { items: [...state.items, { item: action.item, quantity: 1 }] };
        }
        case "REMOVE_ITEM":
            return { items: state.items.filter((ci) => ci.item.id !== action.id) };
        case "INCREASE":
            return {
                items: state.items.map((ci) =>
                    ci.item.id === action.id ? { ...ci, quantity: ci.quantity + 1 } : ci
                ),
            };
        case "DECREASE":
            return {
                items: state.items
                    .map((ci) =>
                        ci.item.id === action.id
                            ? { ...ci, quantity: ci.quantity - 1 }
                            : ci
                    )
                    .filter((ci) => ci.quantity > 0),
            };
        case "CLEAR":
            return { items: [] };
        default:
            return state;
    }
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: MenuItem) => void;
    removeItem: (id: string) => void;
    increase: (id: string) => void;
    decrease: (id: string) => void;
    clear: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    // Restore cart from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("ub_cart");
            if (saved) {
                const parsed: CartItem[] = JSON.parse(saved);
                parsed.forEach((ci) => {
                    for (let i = 0; i < ci.quantity; i++) {
                        dispatch({ type: "ADD_ITEM", item: ci.item });
                    }
                });
            }
        } catch { }
    }, []);

    // Persist cart to localStorage on every change
    useEffect(() => {
        localStorage.setItem("ub_cart", JSON.stringify(state.items));
    }, [state.items]);

    const totalItems = state.items.reduce((sum, ci) => sum + ci.quantity, 0);
    const totalPrice = state.items.reduce(
        (sum, ci) => sum + ci.item.price * ci.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                items: state.items,
                addItem: (item) => dispatch({ type: "ADD_ITEM", item }),
                removeItem: (id) => dispatch({ type: "REMOVE_ITEM", id }),
                increase: (id) => dispatch({ type: "INCREASE", id }),
                decrease: (id) => dispatch({ type: "DECREASE", id }),
                clear: () => dispatch({ type: "CLEAR" }),
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside CartProvider");
    return ctx;
}
