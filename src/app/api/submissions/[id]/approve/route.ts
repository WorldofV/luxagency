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
  const normalized = gender.trim().toLowerCase();

  const explicitMap: Record<string, string> = {
    women: "Women",
    woman: "Women",
    female: "Women",
    men: "Men",
    man: "Men",
    male: "Men",
    girls: "Girls",
    girl: "Girls",
    boys: "Boys",
    boy: "Boys",
    "non binary": "Non Binary",
    "non-binary": "Non Binary",
    "nonbinary": "Non Binary",
  };

  const match = Object.keys(explicitMap).find((key) => normalized.includes(key));
  if (match) {
    return explicitMap[match];
  }

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
    firstName: submission.firstName,
    lastName: submission.lastName,
    division: divisionFromGender(submission.gender),
    city: submission.currentCity,
    nationality: submission.nationality,
    citizenship: submission.citizenship,
    languages: submission.languages,
    email: submission.email,
    phonePrefix: submission.phonePrefix,
    phone: submission.phone,
    height: submission.height,
    bust: submission.chest,
    waist: submission.waist,
    hips: submission.hips,
    shoes: submission.shoes,
    eyes: submission.eyes,
    hair: submission.hair,
    instagram: submission.instagram,
    tiktok: submission.tiktok,
    birthday: submission.birthday,
    experience: submission.experience,
    travelAvailability: submission.travelAvailability,
    source: submission.source,
    notes: submission.notes,
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

