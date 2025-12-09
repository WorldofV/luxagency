import { NextRequest, NextResponse } from "next/server";
import {
  getNotifications,
  getUnreadNotifications,
  markAllNotificationsAsRead,
  deleteAllNotifications,
} from "@/lib/notificationStore";

export async function GET(request: NextRequest) {
  try {
    const adminEmail = request.headers.get("x-user-email");
    const unreadOnly = request.nextUrl.searchParams.get("unread") === "true";
    
    const notifications = unreadOnly
      ? await getUnreadNotifications(adminEmail || undefined)
      : await getNotifications(adminEmail || undefined);
    
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminEmail = request.headers.get("x-user-email");
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await deleteAllNotifications();
    return NextResponse.json({ deleted: count });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return NextResponse.json({ error: "Failed to delete notifications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminEmail = request.headers.get("x-user-email");
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (body.action === "markAllRead") {
      const count = await markAllNotificationsAsRead(adminEmail);
      return NextResponse.json({ marked: count });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

