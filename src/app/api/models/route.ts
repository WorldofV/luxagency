import { NextResponse } from "next/server";

import {
  createModel,
  listModels,
  type ModelRecord,
} from "@/lib/modelStore";

export async function GET() {
  const models = await listModels();
  return NextResponse.json({ models });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<ModelRecord>;

  if (!payload.name || !payload.division) {
    return NextResponse.json(
      { error: "Name and division are required" },
      { status: 400 }
    );
  }

  try {
    const model = await createModel({
      name: payload.name,
      division: payload.division,
      slug: payload.slug,
      city: payload.city,
      citizenship: payload.citizenship,
      instagram: payload.instagram,
      modelsComUrl: payload.modelsComUrl,
      email: payload.email,
      phonePrefix: payload.phonePrefix,
      phone: payload.phone,
      whatsapp: payload.whatsapp,
      birthday: payload.birthday,
      height: payload.height,
      bust: payload.bust,
      waist: payload.waist,
      hips: payload.hips,
      shoes: payload.shoes,
      eyes: payload.eyes,
      hair: payload.hair,
    });

    return NextResponse.json(model, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to create model" },
      { status: 400 }
    );
  }
}


