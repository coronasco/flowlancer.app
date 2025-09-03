// import { NextResponse } from "next/server";
import { withAuth, handleError } from "@/app/api/_helpers/route";
import { compat } from "@/server/compat/flowlancer";
import { ProfileUpdateSchema } from "@/lib/schemas/profile";

export async function GET(req: Request) {
    try {
        return withAuth(async (_req, { userId }) => {
            const profile = await compat.getUserProfile(userId);
            return { profile };
        })(req);
    } catch (e) {
        return handleError(e);
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const parsed = ProfileUpdateSchema.safeParse(body);
        if (!parsed.success) {
            return handleError(new Error("Invalid profile data"));
        }
        return withAuth(async (_req, { userId }) => {
            const updated = await compat.updateUserProfile(userId, parsed.data);
            return { profile: updated };
        })(req);
    } catch (e) {
        return handleError(e);
    }
}


