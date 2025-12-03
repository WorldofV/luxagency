import { NextResponse } from "next/server";

import { deleteImage } from "@/lib/modelStore";

type RouteContext = {
  params: {
    imageId: string;
  };
};

export async function DELETE(_: Request, { params }: RouteContext) {
  const removed = await deleteImage(params.imageId);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}


