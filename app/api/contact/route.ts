import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation schema for contact form
const ContactMessageSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  subject: z.enum([
    "general",
    "support", 
    "billing",
    "feature",
    "partnership",
    "other"
  ]),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = ContactMessageSchema.parse(body);
    
    // Insert the contact message into Supabase
    const { data, error } = await supabase
      .from("contact_messages")
      .insert({
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        status: "new"
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { ok: false, error: { message: "Failed to save message" } },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      ok: true,
      data: {
        id: data.id,
        message: "Your message has been sent successfully! We'll get back to you within 24 hours."
      }
    });

  } catch (error) {
    console.error("Contact form error:", error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            message: "Invalid form data",
            details: error.issues
          }
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { ok: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
