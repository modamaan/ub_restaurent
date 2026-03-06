import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders } from "@/lib/db/queries";

function genId() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

// POST /api/orders – create a new order
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { customerName, phone, orderType, address, items, totalPrice } = body;

        if (!customerName || !phone || !orderType || !items?.length) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const orderId = genId();
        await createOrder({
            id: orderId,
            customerName,
            phone,
            orderType,
            address: address ?? "",
            totalPrice: totalPrice ?? 0,
            items: items.map((it: { name: string; quantity: number; price: number }) => ({
                id: genId(),
                itemName: it.name,
                quantity: it.quantity,
                price: it.price,
            })),
        });

        return NextResponse.json({ id: orderId });
    } catch (err) {
        console.error("[POST /api/orders]", err);
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
}

// GET /api/orders – get all orders for admin
export async function GET() {
    try {
        const data = await getOrders();
        return NextResponse.json(data);
    } catch (err) {
        console.error("[GET /api/orders]", err);
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}
