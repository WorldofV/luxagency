import { NextRequest, NextResponse } from "next/server";

import { getActivities, getActivityStats, logActivity } from "@/lib/activityStore";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const adminEmail = searchParams.get("adminEmail") || undefined;
  const activityType = searchParams.get("activityType") as any || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  if (searchParams.get("stats") === "true") {
    const stats = await getActivityStats();
    return NextResponse.json(stats);
  }

  const activities = await getActivities({
    adminEmail,
    activityType,
    startDate,
    endDate,
  });

  return NextResponse.json({ activities });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminEmail, activityType, description, metadata } = body;

    if (!adminEmail || !activityType || !description) {
      return NextResponse.json(
        { error: "adminEmail, activityType, and description are required" },
        { status: 400 }
      );
    }

    const activity = await logActivity(adminEmail, activityType, description, metadata);
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}
