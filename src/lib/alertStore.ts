import { promises as fs } from "fs";
import path from "path";

export type AlertChannel = "email" | "slack";

export type EventType = "option" | "out" | "job" | "contract" | "casting" | "travel" | "availability";

export type AlertTrigger = {
  eventType: EventType;
  // Trigger timing: "before" (X days/hours before), "on" (on the day), "after" (X days/hours after)
  timing: "before" | "on" | "after";
  // Value for timing (e.g., 7 days before, 2 hours before)
  value: number;
  // Unit: "days" or "hours"
  unit: "days" | "hours";
};

export type AlertRule = {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AlertTrigger;
  channels: AlertChannel[];
  // Email recipients (comma-separated)
  emailRecipients?: string;
  // Slack webhook URL
  slackWebhookUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string; // Admin email
};

type StoreShape = {
  rules: AlertRule[];
};

const STORE_PATH = path.join(process.cwd(), "data/alert-store.json");

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as StoreShape;
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return { rules: [] };
    }
    throw error;
  }
}

async function writeStore(store: StoreShape) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function createAlertRule(
  rule: Omit<AlertRule, "id" | "createdAt" | "updatedAt">
): Promise<AlertRule> {
  const store = await readStore();
  const newRule: AlertRule = {
    ...rule,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.rules.push(newRule);
  await writeStore(store);
  return newRule;
}

export async function getAlertRules(): Promise<AlertRule[]> {
  const store = await readStore();
  return store.rules;
}

export async function getAlertRuleById(id: string): Promise<AlertRule | null> {
  const store = await readStore();
  return store.rules.find((r) => r.id === id) || null;
}

export async function updateAlertRule(
  id: string,
  updates: Partial<Omit<AlertRule, "id" | "createdAt">>
): Promise<AlertRule | null> {
  const store = await readStore();
  const index = store.rules.findIndex((r) => r.id === id);
  if (index === -1) return null;

  store.rules[index] = {
    ...store.rules[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(store);
  return store.rules[index];
}

export async function deleteAlertRule(id: string): Promise<boolean> {
  const store = await readStore();
  const index = store.rules.findIndex((r) => r.id === id);
  if (index === -1) return false;

  store.rules.splice(index, 1);
  await writeStore(store);
  return true;
}

