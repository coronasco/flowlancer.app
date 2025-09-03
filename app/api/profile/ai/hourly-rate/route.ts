import { NextResponse } from "next/server";
import { withAuth, handleError } from "@/app/api/_helpers/route";
import { z } from "zod";

const HourlyRateRequestSchema = z.object({
  role: z.string().min(1),
  skills: z.array(z.string()).min(1),
  experienceYears: z.number().min(0),
  location: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = HourlyRateRequestSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_INPUT", message: "Invalid request data" } },
        { status: 400 }
      );
    }

    return withAuth(async () => {
      const { role, skills, experienceYears, location } = parsed.data;
      
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        throw new Error("OpenAI API key not configured");
      }

      const prompt = `You are an expert freelance pricing consultant. Based on the profile below, recommend hourly rates in USD for remote freelance work.

Profile:
- Role: ${role}
- Experience: ${experienceYears} years
- Skills: ${skills.join(', ')}
- Location: ${location || 'Not specified'}

Provide 3 rate tiers:
1. Basic: For new freelancers or simple projects
2. Standard: For experienced freelancers with proven track record  
3. Expert: For senior experts handling complex projects

Consider current market rates, skill demand, and experience level. Return ONLY valid JSON with this exact structure:
{
  "basic": number,
  "standard": number, 
  "rush": number,
  "reasoning": "detailed explanation of the rates"
}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.3,
          messages: [
            { 
              role: "system", 
              content: "You are a freelance pricing expert. Respond ONLY with valid JSON containing basic, standard, rush rates and reasoning." 
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      try {
        const result = JSON.parse(content);
        return {
          basic: Math.round(result.basic || 50),
          standard: Math.round(result.standard || 75),
          rush: Math.round(result.rush || 100),
          reasoning: result.reasoning || "AI-generated rate recommendation based on your profile.",
          currency: 'USD'
        };
      } catch {
        // Fallback if JSON parsing fails
        const baseRate = 50 + (experienceYears * 5) + (skills.length * 2);
        return {
          basic: Math.round(baseRate * 0.8),
          standard: Math.round(baseRate),
          rush: Math.round(baseRate * 1.4),
          reasoning: `Based on ${experienceYears} years of experience as a ${role} with ${skills.length} skills, here are market-competitive rates.`,
          currency: 'USD'
        };
      }
    })(req);
  } catch (e) {
    return handleError(e);
  }
}
