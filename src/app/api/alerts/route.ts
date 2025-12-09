import { NextRequest, NextResponse } from "next/server";
import {
  createAlertRule,
  getAlertRules,
} from "@/lib/alertStore";

export async function GET(request: NextRequest) {
  try {
    const rules = await getAlertRules();
    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Error fetching alert rules:", error);
    return NextResponse.json({ error: "Failed to fetch alert rules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received alert rule creation request:", body);
    
    const {
      name,
      enabled,
      eventType,
      timing,
      value,
      unit,
      channels: channelsInput,
      emailRecipients,
      slackWebhookUrl,
    } = body;

    const adminEmail = request.headers.get("x-user-email");
    console.log("Admin email:", adminEmail);
    
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!name || !eventType || !timing) {
      return NextResponse.json(
        { error: "name, eventType, and timing are required" },
        { status: 400 }
      );
    }

    // Channels can be empty (notifications will still appear in admin panel)
    const channels = channelsInput || [];

    // Value and unit are only required if timing is not "on"
    if (timing !== "on" && (value === undefined || !unit)) {
      return NextResponse.json(
        { error: "value and unit are required when timing is not 'on'" },
        { status: 400 }
      );
    }

    if (channels.includes("email") && !emailRecipients) {
      return NextResponse.json(
        { error: "emailRecipients is required when email channel is selected" },
        { status: 400 }
      );
    }

    if (channels.includes("slack") && !slackWebhookUrl) {
      return NextResponse.json(
        { error: "slackWebhookUrl is required when slack channel is selected" },
        { status: 400 }
      );
    }

    const ruleData = {
      name,
      enabled: enabled !== false,
      trigger: {
        eventType,
        timing,
        value: timing === "on" ? 0 : value || 0,
        unit: timing === "on" ? "days" : unit || "days",
      },
      channels,
      emailRecipients: channels.includes("email") ? emailRecipients : undefined,
      slackWebhookUrl: channels.includes("slack") ? slackWebhookUrl : undefined,
      createdBy: adminEmail,
    };
    
    console.log("Creating alert rule with data:", ruleData);
    
    const rule = await createAlertRule(ruleData);
    console.log("Alert rule created successfully:", rule);

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("Error creating alert rule:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: "Failed to create alert rule",
      details: errorMessage 
    }, { status: 500 });
  }
}

