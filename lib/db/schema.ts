import { pgTable, text, integer, boolean } from "drizzle-orm/pg-core";

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

export type Category = typeof categories.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Banner = typeof banners.$inferSelect;
