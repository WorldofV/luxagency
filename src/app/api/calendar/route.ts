import { NextRequest, NextResponse } from "next/server";
import {
  createEvent,
  getEvents,
  getExpiredOptions,
  getUpcomingOptions,
  checkConflicts,
} from "@/lib/calendarStore";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const modelId = searchParams.get("modelId") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const eventType = searchParams.get("eventType") as any || undefined;
  const expiredOptions = searchParams.get("expiredOptions") === "true";
  const upcomingOptions = searchParams.get("upcomingOptions");
  const checkConflictsParam = searchParams.get("checkConflicts") === "true";

  try {
    if (expiredOptions) {
      const options = await getExpiredOptions();
      return NextResponse.json({ events: options });
    }

    if (upcomingOptions) {
      const days = parseInt(upcomingOptions) || 7;
      const options = await getUpcomingOptions(days);
      return NextResponse.json({ events: options });
    }

    if (checkConflictsParam && modelId && startDate) {
      const endDateOrStart = searchParams.get("endDate") || startDate;
      const startTime = searchParams.get("startTime") || undefined;
      const endTime = searchParams.get("endTime") || undefined;
      const excludeEventId = searchParams.get("excludeEventId") || undefined;

      const conflicts = await checkConflicts(modelId, startDate, endDateOrStart, startTime, endTime, excludeEventId);
      return NextResponse.json({ conflicts });
    }

    const events = await getEvents({
      modelId,
      startDate,
      endDate,
      eventType,
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      modelId,
      eventType,
      title,
      startDate,
      endDate,
      startTime,
      endTime,
      clientName,
      location,
      callTime,
      duration,
      notes,
      availabilityStatus,
      optionExpiry,
      optionPriority,
      optionClient,
    } = body;

    const adminEmail = request.headers.get("x-user-email");
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!modelId || !eventType || !title || !startDate) {
      return NextResponse.json(
        { error: "modelId, eventType, title, and startDate are required" },
        { status: 400 }
      );
    }

    // Check for conflicts
    const conflicts = await checkConflicts(modelId, startDate, endDate || startDate, startTime, endTime);
    const hasConflicts = conflicts.length > 0;

    const event = await createEvent({
      modelId,
      eventType,
      title,
      startDate,
      endDate,
      startTime,
      endTime,
      clientName,
      location,
      callTime,
      duration,
      notes,
      availabilityStatus,
      optionExpiry,
      optionPriority,
      optionClient,
      createdBy: adminEmail,
    });

    return NextResponse.json({ event, hasConflicts, conflicts }, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
