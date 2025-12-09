import { NextRequest, NextResponse } from "next/server";
import { getEventById, updateEvent, deleteEvent, checkConflicts } from "@/lib/calendarStore";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = params instanceof Promise ? await params : params;
    const event = await getEventById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = params instanceof Promise ? await params : params;
    const body = await request.json();
    console.log("PATCH /api/calendar/[id] - id:", id, "body:", body);
    
    const event = await getEventById(id);
    if (!event) {
      console.error("Event not found:", id);
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check for conflicts if dates/times are being updated
    let hasConflicts = false;
    let conflicts: any[] = [];
    if (body.startDate || body.endDate || body.startTime || body.endTime) {
      const startDate = body.startDate || event.startDate;
      const endDate = body.endDate || event.endDate || event.startDate;
      const startTime = body.startTime || event.startTime;
      const endTime = body.endTime || event.endTime;

      conflicts = await checkConflicts(event.modelId, startDate, endDate, startTime, endTime, id);
      hasConflicts = conflicts.length > 0;
    }

    const updated = await updateEvent(id, body);
    if (!updated) {
      console.error("Failed to update event:", id);
      return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }

    console.log("Event updated successfully:", updated.id);
    return NextResponse.json({ event: updated, hasConflicts, conflicts });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = params instanceof Promise ? await params : params;
    const deleted = await deleteEvent(id);
    if (!deleted) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
