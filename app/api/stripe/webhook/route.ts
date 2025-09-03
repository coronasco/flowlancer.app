import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: Request) {
    // Placeholder safe handler: don't parse JSON; read raw body if needed later
    try {
        const sig = req.headers.get("stripe-signature");
        if (!env.STRIPE_SECRET_KEY) {
            return NextResponse.json({ ok: true, data: { skipped: true } });
        }
        // TODO: verify signature using Stripe SDK if enabled
        return NextResponse.json({ ok: true, data: { received: true, signature: Boolean(sig) } });
    } catch {
        return NextResponse.json({ ok: false, error: { code: "WEBHOOK_ERROR", message: "Invalid webhook" } }, { status: 400 });
    }
}


