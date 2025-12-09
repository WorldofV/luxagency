import { promises as fs } from "fs";
import path from "path";

export type EventType = "option" | "out" | "job" | "contract" | "casting" | "fitting" | "travel" | "availability";

export type AvailabilityStatus = "available" | "not_available" | "tentative";

export type OptionPriority = "1st" | "2nd" | "3rd" | "4th" | "5th";

export type CalendarEvent = {
  id: string;
  modelId: string;
  eventType: EventType;
  title: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string (optional for single-day events)
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  clientName?: string;
  location?: string;
  callTime?: string; // HH:mm format
  duration?: string; // e.g., "2 hours", "Full day"
  notes?: string;
  availabilityStatus?: AvailabilityStatus; // For availability events
  optionExpiry?: string; // ISO date string for options
  optionPriority?: OptionPriority;
  optionClient?: string; // Client holding the option
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Admin email
};

type StoreShape = {
  events: CalendarEvent[];
};

const STORE_PATH = path.join(process.cwd(), "data/calendar-store.json");

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as StoreShape;
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return { events: [] };
    }
    throw error;
  }
}

async function writeStore(store: StoreShape) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function createEvent(event: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt">): Promise<CalendarEvent> {
  const store = await readStore();
  const newEvent: CalendarEvent = {
    ...event,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.events.push(newEvent);
  await writeStore(store);
  return newEvent;
}

export async function getEvents(filters?: {
  modelId?: string;
  startDate?: string;
  endDate?: string;
  eventType?: EventType;
}): Promise<CalendarEvent[]> {
  const store = await readStore();
  let events = [...store.events];

  if (filters) {
    if (filters.modelId) {
      events = events.filter((e) => e.modelId === filters.modelId);
    }
    if (filters.startDate && filters.endDate) {
      // Check for date overlap: event overlaps if it starts before filter end and ends after filter start
      events = events.filter((e) => {
        const eventStart = e.startDate;
        const eventEnd = e.endDate || e.startDate;
        return eventStart <= filters.endDate! && eventEnd >= filters.startDate!;
      });
    } else {
      if (filters.startDate) {
        events = events.filter((e) => {
          const eventEnd = e.endDate || e.startDate;
          return eventEnd >= filters.startDate!;
        });
      }
      if (filters.endDate) {
        events = events.filter((e) => {
          return e.startDate <= filters.endDate!;
        });
      }
    }
    if (filters.eventType) {
      events = events.filter((e) => e.eventType === filters.eventType);
    }
  }

  return events.sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    if (dateA !== dateB) return dateA - dateB;
    // If same date, sort by start time
    const timeA = a.startTime ? a.startTime : "00:00";
    const timeB = b.startTime ? b.startTime : "00:00";
    return timeA.localeCompare(timeB);
  });
}

export async function getEventById(id: string): Promise<CalendarEvent | null> {
  const store = await readStore();
  return store.events.find((e) => e.id === id) || null;
}

export async function updateEvent(id: string, updates: Partial<Omit<CalendarEvent, "id" | "createdAt">>): Promise<CalendarEvent | null> {
  const store = await readStore();
  const index = store.events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  store.events[index] = {
    ...store.events[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(store);
  return store.events[index];
}

export async function deleteEvent(id: string): Promise<boolean> {
  const store = await readStore();
  const index = store.events.findIndex((e) => e.id === id);
  if (index === -1) return false;

  store.events.splice(index, 1);
  await writeStore(store);
  return true;
}

export async function checkConflicts(
  modelId: string,
  startDate: string,
  endDateOrStartDate: string,
  startTime?: string,
  endTime?: string,
  excludeEventId?: string
): Promise<CalendarEvent[]> {
  const events = await getEvents({ modelId });
  const conflicts: CalendarEvent[] = [];

  const checkDate = new Date(startDate);
  const checkEndDate = new Date(endDateOrStartDate || startDate);

  for (const event of events) {
    if (excludeEventId && event.id === excludeEventId) continue;

    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate || event.startDate);

    // Check if dates overlap
    if (checkDate <= eventEnd && checkEndDate >= eventStart) {
      // If times are specified, check for time conflicts
      if (startTime && endTime && event.startTime && event.endTime) {
        const checkStartTime = startTime.split(":").map(Number);
        const checkEndTime = endTime.split(":").map(Number);
        const eventStartTime = event.startTime.split(":").map(Number);
        const eventEndTime = event.endTime.split(":").map(Number);

        const checkStartMinutes = checkStartTime[0] * 60 + checkStartTime[1];
        const checkEndMinutes = checkEndTime[0] * 60 + checkEndTime[1];
        const eventStartMinutes = eventStartTime[0] * 60 + eventStartTime[1];
        const eventEndMinutes = eventEndTime[0] * 60 + eventEndTime[1];

        // If same day, check time overlap
        if (checkDate.toDateString() === eventStart.toDateString()) {
          if (checkStartMinutes < eventEndMinutes && checkEndMinutes > eventStartMinutes) {
            conflicts.push(event);
          }
        } else {
          // Different days but dates overlap, it's a conflict
          conflicts.push(event);
        }
      } else {
        // Date overlap without specific times is a conflict
        conflicts.push(event);
      }
    }
  }

  return conflicts;
}

export async function getExpiredOptions(): Promise<CalendarEvent[]> {
  const store = await readStore();
  const now = new Date();
  return store.events.filter(
    (e) => e.eventType === "option" && e.optionExpiry && new Date(e.optionExpiry) < now
  );
}

export async function getUpcomingOptions(daysAhead: number = 7): Promise<CalendarEvent[]> {
  const store = await readStore();
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return store.events.filter(
    (e) =>
      e.eventType === "option" &&
      e.optionExpiry &&
      new Date(e.optionExpiry) >= now &&
      new Date(e.optionExpiry) <= futureDate
  );
}
