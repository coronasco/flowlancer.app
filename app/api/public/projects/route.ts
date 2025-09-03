import { NextResponse } from "next/server";
import { handleError } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const email = (searchParams.get("email") || "").toLowerCase();
        if (!email) return NextResponse.json({ ok: true, data: { projects: [] } });
        const projects = await compat.listProjects(email);
        return NextResponse.json({ ok: true, data: { projects } });
    } catch (e) {
        return handleError(e);
    }
}


