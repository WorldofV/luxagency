import { NextRequest, NextResponse } from "next/server";
import { getAllAdmins, createAdmin, isSuperAdmin } from "@/lib/adminStore";

// Get user email from request headers (you'll need to implement proper auth)
function getUserEmail(request: NextRequest): string | null {
  // For now, we'll use a header. In production, use proper session/auth
  return request.headers.get("x-user-email") || null;
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = getUserEmail(request);
    
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const isSuper = await isSuperAdmin(userEmail);
    if (!isSuper) {
      return NextResponse.json({ error: "Forbidden: Super admin access required" }, { status: 403 });
    }
    
    const admins = await getAllAdmins();
    return NextResponse.json(admins);
  } catch (error: any) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userEmail = getUserEmail(request);
    
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const isSuper = await isSuperAdmin(userEmail);
    if (!isSuper) {
      return NextResponse.json({ error: "Forbidden: Super admin access required" }, { status: 403 });
    }
    
    const body = await request.json();
    const { email, password, role } = body;
    
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password is required and must be at least 6 characters" }, { status: 400 });
    }
    
    const admin = await createAdmin(email, password, role || "admin");
    return NextResponse.json(admin, { status: 201 });
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return NextResponse.json({ error: error.message || "Failed to create admin" }, { status: 500 });
  }
}
