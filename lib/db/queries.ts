import { db } from "./index";
import { categories, items, banners, storeSettings, orders, orderItems } from "./schema";
import { eq, desc } from "drizzle-orm";
import type { MenuCategory } from "../menu-data";

// ── Read entire menu from DB ───────────────────────────────
export async function getMenu(): Promise<MenuCategory[]> {
    const cats = await db.select().from(categories).orderBy(categories.position);
    const allItems = await db.select().from(items).orderBy(items.position);

    return cats.map((cat) => ({
        id: cat.id,
        name: cat.name,
        items: allItems
            .filter((it) => it.categoryId === cat.id)
            .map((it) => ({
                id: it.id,
                name: it.name,
                description: it.description,
                price: it.price,
                image: it.image ?? "",
                available: it.available,
                isVeg: it.isVeg,
            })),
    }));
}

// ── Read Banners ──────────────────────────────────────────
export async function getBanners(): Promise<(string | null)[]> {
    const rows = await db.select().from(banners).orderBy(banners.id);
    const images = [null, null, null, null] as (string | null)[];
    rows.forEach((row) => {
        if (row.id >= 0 && row.id < 4) {
            images[row.id] = row.image;
        }
    });
    return images;
}

// ── Full replace (bulk admin save) ────────────────────────
export async function saveMenu(menu: MenuCategory[]): Promise<void> {
    await db.delete(items);
    await db.delete(categories);

    for (let ci = 0; ci < menu.length; ci++) {
        const cat = menu[ci];
        await db.insert(categories).values({
            id: cat.id,
            name: cat.name,
            position: ci,
        });
        for (let ii = 0; ii < cat.items.length; ii++) {
            const item = cat.items[ii];
            await db.insert(items).values({
                id: item.id,
                categoryId: cat.id,
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image ?? "",
                available: item.available,
                isVeg: item.isVeg,
                position: ii,
            });
        }
    }
}

// ── Toggle availability ───────────────────────────────────
export async function toggleAvailable(id: string) {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    if (item) {
        await db.update(items).set({ available: !item.available }).where(eq(items.id, id));
    }
}

// ── Delete a single item ──────────────────────────────────
export async function deleteItem(id: string) {
    await db.delete(items).where(eq(items.id, id));
}

// ── Delete a category (items cascade) ────────────────────
export async function deleteCategory(id: string) {
    await db.delete(categories).where(eq(categories.id, id));
}

// ── Store Settings ───────────────────────────────────────
export async function getStoreSetting(key: string): Promise<string | null> {
    const [setting] = await db
        .select()
        .from(storeSettings)
        .where(eq(storeSettings.key, key));
    return setting?.value ?? null;
}

export async function setStoreSetting(key: string, value: string): Promise<void> {
    const existing = await getStoreSetting(key);
    if (existing !== null) {
        await db.update(storeSettings).set({ value }).where(eq(storeSettings.key, key));
    } else {
        await db.insert(storeSettings).values({ key, value });
    }
}

// ── Orders ───────────────────────────────────────────────

type CreateOrderInput = {
    id: string;
    customerName: string;
    phone: string;
    orderType: string;
    address: string;
    totalPrice: number;
    items: { id: string; itemName: string; quantity: number; price: number }[];
};

export async function createOrder(data: CreateOrderInput): Promise<void> {
    await db.insert(orders).values({
        id: data.id,
        customerName: data.customerName,
        phone: data.phone,
        orderType: data.orderType,
        address: data.address,
        totalPrice: data.totalPrice,
        status: "pending",
    });
    if (data.items.length > 0) {
        await db.insert(orderItems).values(
            data.items.map((it) => ({
                id: it.id,
                orderId: data.id,
                itemName: it.itemName,
                quantity: it.quantity,
                price: it.price,
            }))
        );
    }
}

export async function getOrders() {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const allItems = await db.select().from(orderItems);
    return allOrders.map((o) => ({
        ...o,
        items: allItems.filter((it) => it.orderId === o.id),
    }));
}

export async function updateOrderStatus(id: string, status: "pending" | "done"): Promise<void> {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
}
