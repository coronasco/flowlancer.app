import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { verifyIdToken } from "@/lib/auth/firebase-admin";
import { adminSdk } from "@/lib/auth/firebase-admin";

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Validation schema for updating contact messages
const UpdateMessageSchema = z.object({
  messageId: z.string().uuid(),
  status: z.enum(["new", "in_progress", "resolved"]).optional(),
  adminNotes: z.string().optional(),
});

// GET - Fetch all contact messages (admin only)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { ok: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken?.uid) {
      return NextResponse.json(
        { ok: false, error: { message: "Invalid token" } },
        { status: 401 }
      );
    }

    // Check if user is admin using Firebase Firestore
    const firestore = adminSdk.firestore();
    const userDoc = await firestore.collection("customers").doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const isAdmin = userData?.isAdmin === true;
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    // Fetch all contact messages from Supabase
    const { data: messages, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { ok: false, error: { message: "Failed to fetch messages" } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: { messages: messages || [] }
    });

  } catch (error) {
    console.error("Contact messages fetch error:", error);
    return NextResponse.json(
      { ok: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}

// PATCH - Update contact message status/notes (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { ok: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken?.uid) {
      return NextResponse.json(
        { ok: false, error: { message: "Invalid token" } },
        { status: 401 }
      );
    }

    // Check if user is admin using Firebase Firestore
    const firestore = adminSdk.firestore();
    const userDoc = await firestore.collection("customers").doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const isAdmin = userData?.isAdmin === true;
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: { message: "Admin access required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateMessageSchema.parse(body);

    // Build update object
    const updateData: Record<string, string> = {};
    if (validatedData.status) {
      updateData.status = validatedData.status;
    }
    if (validatedData.adminNotes !== undefined) {
      updateData.admin_notes = validatedData.adminNotes;
    }

    // Update the message in Supabase
    const { data, error } = await supabase
      .from("contact_messages")
      .update(updateData)
      .eq("id", validatedData.messageId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { ok: false, error: { message: "Failed to update message" } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: { message: data }
    });

  } catch (error) {
    console.error("Contact message update error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            message: "Invalid request data",
            details: error.issues
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}
