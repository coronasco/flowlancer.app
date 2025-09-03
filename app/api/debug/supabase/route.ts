import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

export async function GET() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    if (!url || !serviceKey) {
        return NextResponse.json({ ok: true, data: { canConnect: false, reason: "missing-env" } });
    }
    try {
        const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
        const table = process.env.FEED_TABLE || "feed_posts";
        const { error } = await supabase.from(table).select("id").limit(1);
        if (error) {
            return NextResponse.json({ ok: true, data: { canConnect: true, tableAccessible: false, table, error: error.message } });
        }
        return NextResponse.json({ ok: true, data: { canConnect: true, tableAccessible: true, table } });
    } catch (e) {
        return NextResponse.json({ ok: true, data: { canConnect: false, reason: (e as Error).message } });
    }
}


