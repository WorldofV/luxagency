import { NextResponse } from "next/server";

import {
  addModelImage,
  reorderImages,
} from "@/lib/modelStore";
import { saveUploadedFile } from "@/lib/uploads";

export const runtime = "nodejs";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
  const formData = await request.formData();
  const file = formData.get("file");
  const caption = formData.get("caption")?.toString();
  const orderValue = formData.get("order")?.toString();
  const order = orderValue ? Number(orderValue) : undefined;

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "File is required" },
      { status: 400 }
    );
  }

  const saved = await saveUploadedFile(file);
  const image = await addModelImage(params.id, {
    url: saved.url,
    caption,
    order,
  });

  return NextResponse.json(image, { status: 201 });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const payload = await request.json();
  if (!Array.isArray(payload?.images)) {
    return NextResponse.json(
      { error: "images array is required" },
      { status: 400 }
    );
  }

  const model = await reorderImages(
    params.id,
    payload.images.map((image: any) => ({
      id: image.id,
      order: Number(image.order),
    }))
  );

  return NextResponse.json(model);
}


