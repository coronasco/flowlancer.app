import { NextResponse } from "next/server";
import { withAuth, handleError, withRateLimit } from "@/app/api/_helpers/route";
import { z } from "zod";

const RequestSchema = z.object({
    name: z.string().optional(),
    role: z.string(),
    location: z.string(),
    bio: z.string().min(10),
    experienceYears: z.number().int().min(0),
    skills: z.array(z.string()).min(1),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = RequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ ok: false, error: { code: "BAD_REQUEST", message: "Invalid profile data" } }, { status: 400 });
        }
        const input = parsed.data;
        const key = process.env.OPENAI_API_KEY;
        if (!key) {
            return NextResponse.json({ ok: false, error: { code: "NO_OPENAI_KEY", message: "OpenAI key missing" } }, { status: 500 });
        }
        return withAuth(async () =>
            withRateLimit(`ai:rate:${input.role}:${input.location}`, async () => {
                const prompt = `You are an expert freelance pricing assistant. Consider the user's profile and propose a fair hourly rate in USD for US/EU-based remote work, considering market rates and experience. Return STRICT JSON with keys: rateUsd (number), reasoning (string).\n\nProfile:\n- Name: ${input.name || ""}\n- Role: ${input.role}\n- Location: ${input.location}\n- Experience (years): ${input.experienceYears}\n- Skills: ${input.skills.join(", ")}\n- Bio: ${input.bio}`;

                const resp = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${key}`,
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        temperature: 0.2,
                        messages: [
                            { role: "system", content: "Respond ONLY with strict JSON: { \"rateUsd\": number, \"reasoning\": string }" },
                            { role: "user", content: prompt },
                        ],
                    }),
                });

                if (!resp.ok) {
                    const text = await resp.text();
                    throw new Error(`OpenAI error: ${resp.status} ${text}`);
                }
                const data = await resp.json();
                const content: string | undefined = data?.choices?.[0]?.message?.content;
                let rateUsd = 0;
                let reasoning = "";
                try {
                    if (content) {
                        const json = JSON.parse(content);
                        rateUsd = Number(json.rateUsd) || 0;
                        reasoning = typeof json.reasoning === "string" ? json.reasoning : "";
                    }
                } catch {
                    if (content) {
                        const m = content.match(/\d+\.?\d*/);
                        rateUsd = m ? Number(m[0]) : 0;
                        reasoning = content.slice(0, 300);
                    }
                }
                if (!rateUsd || rateUsd < 5) rateUsd = 25; // minimal sane fallback
                return { rateUsd, reasoning };
            })()
        )(req);
    } catch (e) {
        return handleError(e);
    }
}


