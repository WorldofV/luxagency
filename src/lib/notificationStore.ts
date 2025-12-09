import { promises as fs } from "fs";
import path from "path";

export type Notification = {
  id: string;
  alertRuleId: string;
  alertRuleName: string;
  eventId: string;
  eventTitle: string;
  eventType: string;
  modelName: string;
  message: string;
  read: boolean;
  createdAt: string;
  readBy?: string[]; // Array of admin emails who have read this notification
};

type StoreShape = {
  notifications: Notification[];
};

const STORE_PATH = path.join(process.cwd(), "data/notification-store.json");

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as StoreShape;
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return { notifications: [] };
    }
    throw error;
  }
}

async function writeStore(store: StoreShape) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function createNotification(notification: Omit<Notification, "id" | "createdAt" | "read" | "readBy">): Promise<Notification> {
  const store = await readStore();
  const newNotification: Notification = {
    ...notification,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
    readBy: [],
  };
  store.notifications.push(newNotification);
  await writeStore(store);
  return newNotification;
}

export async function getNotifications(adminEmail?: string): Promise<Notification[]> {
  const store = await readStore();
  let notifications = [...store.notifications];
  
  // Sort by createdAt descending (newest first)
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return notifications;
}

export async function getUnreadNotifications(adminEmail?: string): Promise<Notification[]> {
  const store = await readStore();
  let notifications = store.notifications.filter((n) => {
    if (!adminEmail) return !n.read;
    return !n.readBy?.includes(adminEmail);
  });
  
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return notifications;
}

export async function markNotificationAsRead(notificationId: string, adminEmail: string): Promise<boolean> {
  const store = await readStore();
  const notification = store.notifications.find((n) => n.id === notificationId);
  if (!notification) return false;

  if (!notification.readBy) {
    notification.readBy = [];
  }
  
  if (!notification.readBy.includes(adminEmail)) {
    notification.readBy.push(adminEmail);
  }
  
  // Mark as read if all admins have read it (optional - or keep unread until manually dismissed)
  // For now, we'll keep it unread until manually dismissed
  
  await writeStore(store);
  return true;
}

export async function markAllNotificationsAsRead(adminEmail: string): Promise<number> {
  const store = await readStore();
  let count = 0;
  
  for (const notification of store.notifications) {
    if (!notification.readBy) {
      notification.readBy = [];
    }
    if (!notification.readBy.includes(adminEmail)) {
      notification.readBy.push(adminEmail);
      count++;
    }
  }
  
  await writeStore(store);
  return count;
}

export async function deleteNotification(notificationId: string): Promise<boolean> {
  const store = await readStore();
  const index = store.notifications.findIndex((n) => n.id === notificationId);
  if (index === -1) return false;

  store.notifications.splice(index, 1);
  await writeStore(store);
  return true;
}

export async function deleteAllNotifications(): Promise<number> {
  const store = await readStore();
  const count = store.notifications.length;
  store.notifications = [];
  await writeStore(store);
  return count;
}

