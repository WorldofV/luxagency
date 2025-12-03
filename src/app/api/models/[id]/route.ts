import { NextResponse } from "next/server";

import {
  deleteModel,
  getModelById,
  updateModel,
} from "@/lib/modelStore";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_: Request, { params }: RouteContext) {
  const model = await getModelById(params.id);
  if (!model) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(model);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const updates = await request.json();
  try {
    const updated = await updateModel(params.id, updates);
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

export async function DELETE(_: Request, { params }: RouteContext) {
  const deleted = await deleteModel(params.id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}


