import { promises as fs } from "fs";
import path from "path";

type Metrics = {
  instagramClicksFooter: number;
  instagramClicksSubmission: number;
};

const METRICS_PATH = path.join(process.cwd(), "data/metrics.json");

async function readMetrics(): Promise<Metrics> {
  try {
    const raw = await fs.readFile(METRICS_PATH, "utf-8");
    const data = JSON.parse(raw);
    // Migration: handle old format with single instagramClicks field
    if ("instagramClicks" in data && !("instagramClicksFooter" in data)) {
      return {
        instagramClicksFooter: data.instagramClicks || 0,
        instagramClicksSubmission: 0,
      };
    }
    return {
      instagramClicksFooter: data.instagramClicksFooter || 0,
      instagramClicksSubmission: data.instagramClicksSubmission || 0,
    };
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return { instagramClicksFooter: 0, instagramClicksSubmission: 0 };
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

export async function incrementInstagramClicks(source: "footer" | "submission") {
  const metrics = await readMetrics();
  if (source === "footer") {
    metrics.instagramClicksFooter += 1;
  } else {
    metrics.instagramClicksSubmission += 1;
  }
  await writeMetrics(metrics);
  return metrics;
}

