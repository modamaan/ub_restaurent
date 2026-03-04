import { NextResponse } from "next/server";
import { getMenu, saveMenu } from "@/lib/db/queries";

export async function GET() {
    try {
        const menu = await getMenu();
        return NextResponse.json(menu);
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await saveMenu(body);
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
    }
}
