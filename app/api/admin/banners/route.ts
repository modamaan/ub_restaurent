import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const rows = await db.select().from(banners).orderBy(banners.id);
        const images = [null, null, null, null] as (string | null)[];
        rows.forEach((row: { id: number; image: string }) => {
            if (row.id >= 0 && row.id < 4) {
                images[row.id] = row.image;
            }
        });
        return NextResponse.json(images);
    } catch (error) {
        console.error("GET banners error:", error);
        return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { images } = body as { images: (string | null)[] }; // Array of 4 items

        if (!Array.isArray(images) || images.length !== 4) {
            return NextResponse.json({ error: "Must provide exactly 4 slots (URLs or null)" }, { status: 400 });
        }

        // Clear existing banners
        await db.delete(banners);

        // Insert new selected slots
        for (let i = 0; i < 4; i++) {
            if (images[i]) {
                await db.insert(banners).values({
                    id: i,
                    image: images[i] as string,
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST banners error:", error);
        return NextResponse.json({ error: "Failed to save banners" }, { status: 500 });
    }
}
