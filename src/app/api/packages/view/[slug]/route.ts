import { NextResponse } from "next/server";
import {
  getPackageBySlug,
  markPackageAsOpenedBySlug,
} from "@/lib/packageStore";
import { getModelById, type ModelRecord } from "@/lib/modelStore";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

async function resolveParams(context: RouteContext) {
  return context.params ? await context.params : { slug: "" };
}

export async function GET(_: Request, context: RouteContext) {
  const { slug } = await resolveParams(context);
  const packageRecord = await getPackageBySlug(slug);
  
  if (!packageRecord) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  // Mark package as opened (only if not already opened)
  await markPackageAsOpenedBySlug(slug);

  // Fetch full model details for each model in the package
  const models: ModelRecord[] = [];
  for (const modelId of packageRecord.modelIds) {
    const model = await getModelById(modelId);
    if (model) {
      models.push(model);
    }
  }

  return NextResponse.json({
    ...packageRecord,
    models, // Include full model details
  });
}

