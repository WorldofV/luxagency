import { promises as fs } from "fs";
import path from "path";

export type ActivityType =
  | "model_created"
  | "model_updated"
  | "model_deleted"
  | "model_hidden"
  | "model_unhidden"
  | "image_uploaded"
  | "image_deleted"
  | "images_reordered"
  | "package_created"
  | "package_updated"
  | "package_deleted"
  | "package_link_copied"
  | "submission_approved"
  | "submission_deleted"
  | "admin_created"
  | "admin_updated"
  | "admin_deleted"
  | "calendar_event_created"
  | "calendar_event_updated"
  | "calendar_event_deleted";

export type ActivityRecord = {
  id: string;
  timestamp: string;
  adminEmail: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>;
};

type StoreShape = {
  activities: ActivityRecord[];
};

const STORE_PATH = path.join(process.cwd(), "data/activity-store.json");

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as StoreShape;
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return { activities: [] };
    }
    throw error;
  }
}

async function writeStore(store: StoreShape) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function logActivity(
  adminEmail: string,
  activityType: ActivityType,
  description: string,
  metadata?: Record<string, any>
): Promise<ActivityRecord> {
  const store = await readStore();
  const activity: ActivityRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    adminEmail,
    activityType,
    description,
    metadata,
  };
  store.activities.push(activity);
  await writeStore(store);
  return activity;
}

export async function getActivities(
  filters?: {
    adminEmail?: string;
    activityType?: ActivityType;
    startDate?: string;
    endDate?: string;
  }
): Promise<ActivityRecord[]> {
  const store = await readStore();
  let activities = [...store.activities];

  if (filters) {
    if (filters.adminEmail) {
      activities = activities.filter((a) => a.adminEmail === filters.adminEmail);
    }
    if (filters.activityType) {
      activities = activities.filter((a) => a.activityType === filters.activityType);
    }
    if (filters.startDate) {
      activities = activities.filter((a) => a.timestamp >= filters.startDate!);
    }
    if (filters.endDate) {
      activities = activities.filter((a) => a.timestamp <= filters.endDate!);
    }
  }

  return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getActivityStats() {
  const activities = await getActivities();
  const now = Date.now();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

  const stats = {
    total: activities.length,
    last24Hours: activities.filter((a) => a.timestamp >= oneDayAgo).length,
    lastWeek: activities.filter((a) => a.timestamp >= oneWeekAgo).length,
    lastMonth: activities.filter((a) => a.timestamp >= oneMonthAgo).length,
    byType: {} as Record<ActivityType, number>,
    byAdmin: {} as Record<string, number>,
    recent: activities.slice(0, 50),
  };

  activities.forEach((activity) => {
    stats.byType[activity.activityType] = (stats.byType[activity.activityType] || 0) + 1;
    stats.byAdmin[activity.adminEmail] = (stats.byAdmin[activity.adminEmail] || 0) + 1;
  });

  return stats;
}
