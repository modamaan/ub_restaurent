import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/db/queries";

// PATCH /api/orders/[id] – toggle order status (pending <-> done)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status } = await req.json();
        if (status !== "pending" && status !== "done") {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }
        await updateOrderStatus(id, status);
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[PATCH /api/orders/[id]]", err);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
