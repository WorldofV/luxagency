import { NextResponse } from "next/server";

import { deleteImage } from "@/lib/modelStore";

type RouteContext = {
  params: Promise<{
    imageId: string;
  }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const params = await context.params;
  const result = await deleteImage(params.imageId);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result.model);
}


