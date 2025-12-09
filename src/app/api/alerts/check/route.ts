import { NextRequest, NextResponse } from "next/server";
import { checkAndTriggerAlerts } from "@/lib/alertChecker";
import { sendEmailAlert } from "@/lib/emailService";
import { sendSlackAlert } from "@/lib/slackService";
import { listModels } from "@/lib/modelStore";
import { createNotification } from "@/lib/notificationStore";
import { getAllAdmins } from "@/lib/adminStore";

export async function POST(request: NextRequest) {
  try {
    const adminEmail = request.headers.get("x-user-email");
    if (!adminEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await checkAndTriggerAlerts();
    
    if (result.triggered === 0 || !result.alerts) {
      return NextResponse.json({ 
        triggered: 0,
        message: "No alerts to trigger" 
      });
    }

    // Get models for event context
    const models = await listModels(true);
    
    // Get all admins to create notifications for them
    const allAdmins = await getAllAdmins();
    
    const sentNotifications: Array<{ ruleId: string; channel: string; success: boolean }> = [];

    for (const { rule, event } of result.alerts) {
      const model = models.find((m) => m.id === event.modelId);
      const modelName = model?.name || "Unknown Model";
      
      const message = `🚨 Alert: ${rule.name}

Event: ${event.title}
Type: ${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
Date: ${new Date(event.startDate).toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})}
Model: ${modelName}
${event.clientName ? `Client: ${event.clientName}\n` : ""}${event.location ? `Location: ${event.location}\n` : ""}${event.startTime ? `Time: ${event.startTime}\n` : ""}${event.notes ? `Notes: ${event.notes}` : ""}`;

      // Create notification for all admins in the admin panel
      try {
        await createNotification({
          alertRuleId: rule.id,
          alertRuleName: rule.name,
          eventId: event.id,
          eventTitle: event.title,
          eventType: event.eventType,
          modelName: modelName,
          message: message,
        });
      } catch (error) {
        console.error("Failed to create notification:", error);
      }

      // Send email notifications
      if (rule.channels.includes("email") && rule.emailRecipients) {
        const recipients = rule.emailRecipients.split(",").map((e) => e.trim());
        for (const recipient of recipients) {
          try {
            await sendEmailAlert({
              to: recipient,
              subject: `Alert: ${rule.name} - ${event.title}`,
              message,
            });
            sentNotifications.push({ ruleId: rule.id, channel: "email", success: true });
          } catch (error) {
            console.error(`Failed to send email to ${recipient}:`, error);
            sentNotifications.push({ ruleId: rule.id, channel: "email", success: false });
          }
        }
      }

      // Send Slack notifications
      if (rule.channels.includes("slack") && rule.slackWebhookUrl) {
        try {
          await sendSlackAlert({
            webhookUrl: rule.slackWebhookUrl,
            message,
            title: rule.name,
          });
          sentNotifications.push({ ruleId: rule.id, channel: "slack", success: true });
        } catch (error) {
          console.error(`Failed to send Slack notification:`, error);
          sentNotifications.push({ ruleId: rule.id, channel: "slack", success: false });
        }
      }
    }

    return NextResponse.json({
      triggered: result.triggered,
      sent: sentNotifications.filter((n) => n.success).length,
      failed: sentNotifications.filter((n) => !n.success).length,
      notifications: sentNotifications,
    });
  } catch (error) {
    console.error("Error checking alerts:", error);
    return NextResponse.json({ error: "Failed to check alerts" }, { status: 500 });
  }
}

