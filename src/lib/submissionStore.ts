import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const STORE_PATH = path.join(process.cwd(), "data/model-submissions.json");

type SubmissionStatus = "pending" | "approved" | "deleted";

export type SubmissionRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: SubmissionStatus;
  firstName: string;
  lastName: string;
  email: string;
  birthday?: string;
  gender?: string;
  nationality?: string;
  citizenship?: string;
  languages?: string;
  currentCity?: string;
  phone?: string;
  instagram?: string;
  height?: string;
  chest?: string;
  waist?: string;
  hips?: string;
  shoes?: string;
  eyes?: string;
  hair?: string;
  experience?: string;
  travelAvailability?: string;
  source?: string;
  notes?: string;
  images: Array<{
    id: string;
    url: string;
    caption?: string;
    order: number;
    createdAt: string;
  }>;
};

type StoreShape = {
  submissions: SubmissionRecord[];
};

async function readStore(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as StoreShape;
  } catch (error: any) {
    if (error?.code === "ENOENT") return { submissions: [] };
    throw error;
  }
}

async function writeStore(store: StoreShape) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function listSubmissions(status?: SubmissionStatus) {
  const store = await readStore();
  return store.submissions
    .filter((submission) => (status ? submission.status === status : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

type SubmissionInput = Omit<SubmissionRecord, "id" | "createdAt" | "updatedAt" | "status" | "images"> & {
  images?: SubmissionRecord["images"];
};

export async function createSubmission(input: SubmissionInput) {
  const store = await readStore();
  const now = new Date().toISOString();

  const submission: SubmissionRecord = {
    id: randomUUID(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
    ...input,
    images: input.images ?? [],
  };

  store.submissions.push(submission);
  await writeStore(store);
  return submission;
}

export async function getSubmission(id: string) {
  const store = await readStore();
  const normalized = id.trim().toLowerCase();
  return (
    store.submissions.find((submission) => submission.id.toLowerCase() === normalized) ?? null
  );
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  const store = await readStore();
  const normalized = id.trim().toLowerCase();
  const submission = store.submissions.find((record) => record.id.toLowerCase() === normalized);
  if (!submission) return null;
  submission.status = status;
  submission.updatedAt = new Date().toISOString();
  await writeStore(store);
  return submission;
}

export async function deleteSubmission(id: string) {
  const store = await readStore();
  const normalized = id.trim().toLowerCase();
  const index = store.submissions.findIndex((record) => record.id.toLowerCase() === normalized);
  if (index === -1) return null;
  const [removed] = store.submissions.splice(index, 1);

  await writeStore(store);

  await Promise.all(
    removed.images.map(async (image) => {
      if (!image.url.startsWith("/uploads/")) return;
      const relative = image.url.replace(/^\/+/, "");
      const absolute = path.join(process.cwd(), "public", relative);
      try {
        await fs.unlink(absolute);
      } catch (error: any) {
        if (error?.code !== "ENOENT") {
          console.warn("Unable to delete file", absolute);
        }
      }
    })
  );

  return removed;
}

export async function saveSubmissionImages(
  id: string,
  images: SubmissionRecord["images"]
) {
  const store = await readStore();
  const normalized = id.trim().toLowerCase();
  const submission = store.submissions.find((record) => record.id.toLowerCase() === normalized);
  if (!submission) throw new Error("Submission not found");
  submission.images.push(...images);
  submission.images.sort((a, b) => a.order - b.order);
  submission.updatedAt = new Date().toISOString();
  await writeStore(store);
  return submission;
}

