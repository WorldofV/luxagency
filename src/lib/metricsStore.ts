import { promises as fs } from "fs";
import path from "path";

type Metrics = {
  instagramClicks: number;
};

const METRICS_PATH = path.join(process.cwd(), "data/metrics.json");

async function readMetrics(): Promise<Metrics> {
  try {
    const raw = await fs.readFile(METRICS_PATH, "utf-8");
    return JSON.parse(raw) as Metrics;
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return { instagramClicks: 0 };
    }
    throw error;
  }
}

async function writeMetrics(metrics: Metrics) {
  await fs.mkdir(path.dirname(METRICS_PATH), { recursive: true });
  await fs.writeFile(METRICS_PATH, JSON.stringify(metrics, null, 2), "utf-8");
}

export async function getMetrics() {
  return readMetrics();
}

export async function incrementInstagramClicks() {
  const metrics = await readMetrics();
  metrics.instagramClicks += 1;
  await writeMetrics(metrics);
  return metrics.instagramClicks;
}

