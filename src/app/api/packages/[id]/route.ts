import { NextResponse } from "next/server";
import {
  deletePackage,
  getPackageById,
  updatePackage,
  type PackageRecord,
} from "@/lib/packageStore";

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
  const packageRecord = await getPackageById(id);
  if (!packageRecord) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(packageRecord);
}

export async function PATCH(request: Request, context: RouteContext) {
  const updates = (await request.json()) as Partial<PackageRecord>;
  try {
    const { id } = await resolveParams(context);
    const updated = await updatePackage(id, {
      modelIds: updates.modelIds,
      clientName: updates.clientName,
      clientEmail: updates.clientEmail,
      notes: updates.notes,
    });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to update package" },
      { status: 400 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await resolveParams(context);
  const deleted = await deletePackage(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}




