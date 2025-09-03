import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
    const present = {
        NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
        SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        SUPABASE_SERVICE_KEY: Boolean(process.env.SUPABASE_SERVICE_KEY),
        FEED_TABLE: process.env.FEED_TABLE || "feed_posts",
        NODE_ENV: process.env.NODE_ENV,
    };
    return NextResponse.json({ ok: true, data: present });
}


