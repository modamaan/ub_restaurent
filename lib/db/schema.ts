import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    position: integer("position").notNull().default(0),
});

export const items = pgTable("items", {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
        .notNull()
        .references(() => categories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    price: integer("price").notNull().default(0),
    image: text("image").notNull().default(""),
    available: boolean("available").notNull().default(true),
    isVeg: boolean("is_veg").notNull().default(true),
    position: integer("position").notNull().default(0),
});

export const banners = pgTable("banners", {
    id: integer("id").primaryKey(), // We will use 0, 1, 2, 3 for the 4 slots
    image: text("image").notNull(),
});

export const storeSettings = pgTable("store_settings", {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
});

export const orders = pgTable("orders", {
    id: text("id").primaryKey(),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    orderType: text("order_type").notNull(), // "pickup" | "delivery"
    address: text("address").notNull().default(""),
    totalPrice: integer("total_price").notNull().default(0),
    status: text("status").notNull().default("pending"), // "pending" | "done"
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
    id: text("id").primaryKey(),
    orderId: text("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    itemName: text("item_name").notNull(),
    quantity: integer("quantity").notNull().default(1),
    price: integer("price").notNull().default(0),
});

export type Category = typeof categories.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Banner = typeof banners.$inferSelect;
export type StoreSetting = typeof storeSettings.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
