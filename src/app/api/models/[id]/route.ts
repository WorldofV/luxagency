import { NextResponse } from "next/server";

import {
  deleteModel,
  getModelById,
  updateModel,
} from "@/lib/modelStore";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function resolveParams(context: RouteContext) {
  return context.params ? await context.params : { id: "" };
}

export async function GET(_: Request, context: RouteContext) {
  const { id } = await resolveParams(context);
  const model = await getModelById(id);
  if (!model) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(model);
}

export async function PATCH(request: Request, context: RouteContext) {
  const updates = await request.json();
  try {
    const { id } = await resolveParams(context);
    const updated = await updateModel(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to update model" },
      { status: 400 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await resolveParams(context);
  const deleted = await deleteModel(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}


