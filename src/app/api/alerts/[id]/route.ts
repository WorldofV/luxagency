import { NextRequest, NextResponse } from "next/server";
import {
  getAlertRuleById,
  updateAlertRule,
  deleteAlertRule,
} from "@/lib/alertStore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const rule = await getAlertRuleById(id);
    if (!rule) {
      return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
    }
    return NextResponse.json({ rule });
  } catch (error) {
    console.error("Error fetching alert rule:", error);
    return NextResponse.json({ error: "Failed to fetch alert rule" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const {
      name,
      enabled,
      eventType,
      timing,
      value,
      unit,
      channels,
      emailRecipients,
      slackWebhookUrl,
    } = body;

    const adminEmail = request.headers.get("x-user-email");
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (enabled !== undefined) updates.enabled = enabled;
    if (eventType || timing || value !== undefined || unit || channels) {
      updates.trigger = {
        eventType: eventType || undefined,
        timing: timing || undefined,
        value: value !== undefined ? value : undefined,
        unit: unit || undefined,
      };
    }
    if (channels) {
      updates.channels = channels;
      if (channels.includes("email")) {
        updates.emailRecipients = emailRecipients;
      } else {
        updates.emailRecipients = undefined;
      }
      if (channels.includes("slack")) {
        updates.slackWebhookUrl = slackWebhookUrl;
      } else {
        updates.slackWebhookUrl = undefined;
      }
    }

    const rule = await updateAlertRule(id, updates);
    if (!rule) {
      return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("Error updating alert rule:", error);
    return NextResponse.json({ error: "Failed to update alert rule" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const deleted = await deleteAlertRule(id);
    if (!deleted) {
      return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting alert rule:", error);
    return NextResponse.json({ error: "Failed to delete alert rule" }, { status: 500 });
  }
}

