import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!url || !serviceKey) {
        return NextResponse.json({ ok: false, error: { message: "Missing Supabase env" } }, { status: 500 });
    }
    try {
        const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
        const table = process.env.FEED_TABLE || "feed_posts";
        const { searchParams } = new URL(req.url);
        const body = await req.json().catch(() => ({}));
        const email = body.user_email || searchParams.get("email") || req.headers.get("x-user-email") || "debug@example.com";
        const text = body.text || `DEBUG SEED at ${new Date().toISOString()}`;
        const { data, error } = await supabase
            .from(table)
            .insert({ user_email: email, text })
            .select("id, user_email, text, created_at")
            .single();
        if (error) {
            return NextResponse.json({ ok: false, error: { message: error.message, details: error.details } }, { status: 500 });
        }
        return NextResponse.json({ ok: true, data: { row: data } });
    } catch (e) {
        return NextResponse.json({ ok: false, error: { message: (e as Error).message } }, { status: 500 });
    }
}


