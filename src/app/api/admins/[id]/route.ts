import { NextRequest, NextResponse } from "next/server";
import { updateAdmin, deleteAdmin, isSuperAdmin } from "@/lib/adminStore";

// Get user email from request headers (you'll need to implement proper auth)
function getUserEmail(request: NextRequest): string | null {
  // For now, we'll use a header. In production, use proper session/auth
  return request.headers.get("x-user-email") || null;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userEmail = getUserEmail(request);
    
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const isSuper = await isSuperAdmin(userEmail);
    if (!isSuper) {
      return NextResponse.json({ error: "Forbidden: Super admin access required" }, { status: 403 });
    }
    
    const { id } = await params;
    const body = await request.json();
    const { email, password, role } = body;
    
    const updates: { email?: string; password?: string; role?: "admin" | "super_admin" } = {};
    if (email !== undefined) updates.email = email;
    if (password !== undefined) {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      updates.password = password;
    }
    if (role !== undefined) updates.role = role;
    
    const admin = await updateAdmin(id, updates);
    // Don't return password hash
    const { passwordHash, ...adminWithoutPassword } = admin;
    return NextResponse.json(adminWithoutPassword);
  } catch (error: any) {
    console.error("Error updating admin:", error);
    return NextResponse.json({ error: error.message || "Failed to update admin" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userEmail = getUserEmail(request);
    
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const isSuper = await isSuperAdmin(userEmail);
    if (!isSuper) {
      return NextResponse.json({ error: "Forbidden: Super admin access required" }, { status: 403 });
    }
    
    const { id } = await params;
    await deleteAdmin(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting admin:", error);
    return NextResponse.json({ error: error.message || "Failed to delete admin" }, { status: 500 });
  }
}
