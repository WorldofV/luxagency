import { NextResponse } from "next/server";
import {
  createPackage,
  listPackages,
  type PackageRecord,
} from "@/lib/packageStore";

export async function GET() {
  const packages = await listPackages();
  return NextResponse.json({ packages });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<PackageRecord> & {
    modelIds?: string[];
  };

  if (!payload.modelIds || payload.modelIds.length === 0) {
    return NextResponse.json(
      { error: "At least one model ID is required" },
      { status: 400 }
    );
  }

  try {
    const packageRecord = await createPackage({
      modelIds: payload.modelIds,
      clientName: payload.clientName,
      clientEmail: payload.clientEmail,
      notes: payload.notes,
      slug: payload.slug,
    });

    return NextResponse.json(packageRecord, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to create package" },
      { status: 400 }
    );
  }
}



