import { NextResponse } from "next/server";

import {
  createSubmission,
  listSubmissions,
  saveSubmissionImages,
} from "@/lib/submissionStore";
import { saveUploadedFile } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET() {
  const submissions = await listSubmissions();
  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const images: {
    id: string;
    url: string;
    order: number;
    createdAt: string;
  }[] = [];

  const files = formData.getAll("images").filter((entry) => entry instanceof File) as File[];

  const submission = await createSubmission({
    firstName: formData.get("firstName")?.toString() || "",
    lastName: formData.get("lastName")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    birthday: formData.get("birthday")?.toString() || undefined,
    gender: formData.get("gender")?.toString() || undefined,
    nationality: formData.get("nationality")?.toString() || undefined,
    citizenship: formData.get("citizenship")?.toString() || undefined,
    languages: formData.get("languages")?.toString() || undefined,
    currentCity: formData.get("currentCity")?.toString() || undefined,
    phonePrefix: formData.get("phonePrefix")?.toString() || undefined,
    phone: formData.get("phone")?.toString() || undefined,
    instagram: formData.get("instagram")?.toString() || undefined,
    height: formData.get("height")?.toString() || undefined,
    chest: formData.get("chest")?.toString() || undefined,
    waist: formData.get("waist")?.toString() || undefined,
    hips: formData.get("hips")?.toString() || undefined,
    shoes: formData.get("shoes")?.toString() || undefined,
    eyes: formData.get("eyes")?.toString() || undefined,
    hair: formData.get("hair")?.toString() || undefined,
    experience: formData.get("experience")?.toString() || undefined,
    travelAvailability: formData.get("travelAvailability")?.toString() || undefined,
    source: formData.get("source")?.toString() || undefined,
    notes: formData.get("notes")?.toString() || undefined,
  });

  if (files.length) {
    let order = 0;
    for (const file of files) {
      const saved = await saveUploadedFile(file);
      images.push({
        id: crypto.randomUUID(),
        url: saved.url,
        order: order += 10,
        createdAt: new Date().toISOString(),
      });
    }
    await saveSubmissionImages(submission.id, images);
  }

  return NextResponse.json({ success: true });
}

