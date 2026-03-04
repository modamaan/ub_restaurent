import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file || !file.size) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename
        const ext = file.name.split(".").pop() ?? "jpg";
        const safeName = file.name
            .replace(/\.[^.]+$/, "")
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();
        const fileName = `${safeName}_${Date.now()}.${ext}`;

        const result = await imagekit.upload({
            file: buffer,
            fileName,
            folder: "/menu-items",
            useUniqueFileName: false,
        });

        return NextResponse.json({ url: result.url });
    } catch (err) {
        console.error("ImageKit upload error:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
