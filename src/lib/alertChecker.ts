import { getEvents } from "./calendarStore";
import { getAlertRules } from "./alertStore";
import type { CalendarEvent } from "./calendarStore";
import type { AlertRule } from "./alertStore";

export async function checkAndTriggerAlerts() {
  const rules = await getAlertRules();
  const enabledRules = rules.filter((r) => r.enabled);
  
  if (enabledRules.length === 0) {
    return { triggered: 0 };
  }

  // Get all events from the next 30 days to check
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + 30);
  
  const events = await getEvents({
    startDate: now.toISOString().split("T")[0],
    endDate: futureDate.toISOString().split("T")[0],
  });

  const triggeredAlerts: Array<{ rule: AlertRule; event: CalendarEvent }> = [];

  for (const rule of enabledRules) {
    const matchingEvents = events.filter((event) => {
      // Check if event type matches
      if (event.eventType !== rule.trigger.eventType) {
        return false;
      }

      // Calculate the trigger time based on the rule
      const eventDate = new Date(event.startDate);
      eventDate.setHours(0, 0, 0, 0);
      
      let triggerTime: Date;
      if (rule.trigger.unit === "days") {
        triggerTime = new Date(eventDate);
        if (rule.trigger.timing === "before") {
          triggerTime.setDate(triggerTime.getDate() - rule.trigger.value);
        } else if (rule.trigger.timing === "after") {
          triggerTime.setDate(triggerTime.getDate() + rule.trigger.value);
        } else {
          // "on" - trigger on the day
          triggerTime = eventDate;
        }
      } else {
        // hours
        triggerTime = new Date(eventDate);
        if (rule.trigger.timing === "before") {
          triggerTime.setHours(triggerTime.getHours() - rule.trigger.value);
        } else if (rule.trigger.timing === "after") {
          triggerTime.setHours(triggerTime.getHours() + rule.trigger.value);
        } else {
          // "on" - trigger on the day at midnight
          triggerTime = eventDate;
        }
      }

      // Check if we're within the trigger window (within 1 hour for hours, within 1 day for days)
      const timeDiff = Math.abs(now.getTime() - triggerTime.getTime());
      const threshold = rule.trigger.unit === "days" 
        ? 24 * 60 * 60 * 1000 // 1 day in milliseconds
        : 60 * 60 * 1000; // 1 hour in milliseconds

      // Only trigger if we're past the trigger time (or very close to it)
      return now >= triggerTime && timeDiff <= threshold;
    });

    for (const event of matchingEvents) {
      triggeredAlerts.push({ rule, event });
    }
  }

  return {
    triggered: triggeredAlerts.length,
    alerts: triggeredAlerts,
  };
}

export function formatAlertMessage(rule: AlertRule, event: CalendarEvent, modelName?: string): string {
  const eventType = event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1);
  const date = new Date(event.startDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let message = `🚨 Alert: ${rule.name}\n\n`;
  message += `Event: ${event.title}\n`;
  message += `Type: ${eventType}\n`;
  message += `Date: ${date}\n`;
  
  if (modelName) {
    message += `Model: ${modelName}\n`;
  }
  
  if (event.clientName) {
    message += `Client: ${event.clientName}\n`;
  }
  
  if (event.location) {
    message += `Location: ${event.location}\n`;
  }
  
  if (event.startTime) {
    message += `Time: ${event.startTime}\n`;
  }
  
  if (event.notes) {
    message += `Notes: ${event.notes}\n`;
  }

  return message;
}

