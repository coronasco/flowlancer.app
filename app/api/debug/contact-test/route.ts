import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyIdToken, adminSdk } from "@/lib/auth/firebase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({
        debug: "No authorization header or invalid format",
        hasAuth: false
      });
    }

    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken?.uid) {
      return NextResponse.json({
        debug: "Invalid token",
        hasValidToken: false
      });
    }

    // Check admin status
    const firestore = adminSdk.firestore();
    const userDoc = await firestore.collection("customers").doc(decodedToken.uid).get();
    const userData = userDoc.data();
    const isAdmin = userData?.admin === true;

    // Test Supabase connection
    const { data: messages, error } = await supabase
      .from("contact_messages")
      .select("*")
      .limit(5);

    return NextResponse.json({
      debug: "Debug info",
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        isAdmin: isAdmin,
        userData: userData
      },
      supabase: {
        hasError: !!error,
        error: error?.message,
        messageCount: messages?.length || 0,
        messages: messages || []
      },
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID
      }
    });

  } catch (error) {
    return NextResponse.json({
      debug: "Error occurred",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
