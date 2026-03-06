import { NextResponse } from "next/server";
import { getStoreSetting, setStoreSetting } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    if (!key) return NextResponse.json({ error: "Key is required" }, { status: 400 });

    try {
        const val = await getStoreSetting(key);
        return NextResponse.json({ value: val });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { key, value } = await req.json();
        if (!key || typeof value !== "string") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }
        await setStoreSetting(key, value);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
