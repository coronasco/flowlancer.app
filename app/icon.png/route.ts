import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
    const filePath = join(process.cwd(), "public", "favicon.ico");
    const buf = readFileSync(filePath);
    return new NextResponse(buf, { headers: { "Content-Type": "image/x-icon", "Cache-Control": "public, max-age=86400, immutable" } });
}


