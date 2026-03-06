import { getOrders } from "@/lib/db/queries";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            let lastOrderIds = new Set<string>();
            let active = true;

            const send = (event: string, data: unknown) => {
                try {
                    controller.enqueue(
                        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
                    );
                } catch {
                    active = false;
                }
            };

            // Send initial snapshot
            try {
                const initialOrders = await getOrders();
                lastOrderIds = new Set(initialOrders.map((o) => o.id));
                send("snapshot", initialOrders);
            } catch {
                controller.close();
                return;
            }

            // Poll DB every 3 seconds and push diffs
            const interval = setInterval(async () => {
                if (!active) {
                    clearInterval(interval);
                    return;
                }
                try {
                    const current = await getOrders();
                    const currentIds = new Set(current.map((o) => o.id));

                    // Detect new orders
                    const newOrders = current.filter((o) => !lastOrderIds.has(o.id));
                    if (newOrders.length > 0) {
                        send("new_orders", newOrders);
                    }

                    // Send full refresh every time so status changes propagate too
                    // (lightweight since orders list is small for a restaurant)
                    send("snapshot", current);
                    lastOrderIds = currentIds;
                } catch {
                    // DB error – skip this tick
                }
            }, 3000);

            // Heartbeat every 25s to keep connection alive through proxies
            const heartbeat = setInterval(() => {
                if (!active) { clearInterval(heartbeat); return; }
                try {
                    controller.enqueue(encoder.encode(": heartbeat\n\n"));
                } catch {
                    active = false;
                    clearInterval(heartbeat);
                    clearInterval(interval);
                }
            }, 25000);

            // Cleanup when client disconnects
            return () => {
                active = false;
                clearInterval(interval);
                clearInterval(heartbeat);
            };
        },
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no", // disable Nginx buffering
        },
    });
}
