import { NextResponse } from "next/server";
import { compat } from "@/server/compat/flowlancer";
import { handleError } from "@/app/api/_helpers/route";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await ctx.params;
        // Slug can be either email or publicSlug format
        const profile = await compat.getUserProfile(slug.toLowerCase());
        
        if (!profile) {
            return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Profile not found" } }, { status: 404 });
        }
        
        return NextResponse.json({ ok: true, data: { profile } });
    } catch (e) {
        return handleError(e);
    }
}


