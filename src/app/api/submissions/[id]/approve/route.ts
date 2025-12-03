import { NextResponse } from "next/server";

import { addModelImage, createModel } from "@/lib/modelStore";
import { getSubmission, updateSubmissionStatus } from "@/lib/submissionStore";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const divisionFromGender = (gender?: string) => {
  if (!gender) return "Women";
  const normalized = gender.toLowerCase();
  if (normalized.includes("male")) return "Men";
  if (normalized.includes("non") || normalized.includes("binary")) return "Non Binary";
  return "Women";
};

export async function POST(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const submission = await getSubmission(id);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const model = await createModel({
    name: `${submission.firstName} ${submission.lastName}`.trim(),
    division: divisionFromGender(submission.gender),
    city: submission.currentCity,
    height: submission.height,
    bust: submission.chest,
    waist: submission.waist,
    hips: submission.hips,
    shoes: submission.shoes,
    eyes: submission.eyes,
    hair: submission.hair,
  });

  for (const image of submission.images) {
    await addModelImage(model.id, {
      url: image.url,
      order: image.order,
    });
  }

  await updateSubmissionStatus(submission.id, "approved");

  return NextResponse.json({ success: true, modelId: model.id });
}

