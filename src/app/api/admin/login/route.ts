import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, getAdminByEmail } from "@/lib/adminStore";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Verify admin exists
    const admin = await getAdminByEmail(email);
    if (!admin) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Verify password
    const isValid = await verifyAdminPassword(email, password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Return success (client will handle storing session)
    return NextResponse.json({
      success: true,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
