import { NextResponse } from "next/server";
import {
  addAgencyPlacement,
  updateAgencyPlacement,
  deleteAgencyPlacement,
} from "@/lib/modelStore";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function resolveParams(context: RouteContext) {
  return context.params ? await context.params : { id: "" };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await resolveParams(context);
    if (!id) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    if (!body.city || !body.agencyName || !body.startDate) {
      return NextResponse.json(
        { error: "City, agency name, and start date are required" },
        { status: 400 }
      );
    }
    
    const model = await addAgencyPlacement(id, {
      city: body.city,
      agencyName: body.agencyName,
      startDate: body.startDate,
    });
    return NextResponse.json(model);
  } catch (error: any) {
    console.error("Error in POST /api/models/[id]/agency-placements:", error);
    return NextResponse.json(
      { error: error?.message ?? "Unable to add agency placement" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await resolveParams(context);
  const body = await request.json();
  
  try {
    const model = await updateAgencyPlacement(id, body.placementId, {
      city: body.city,
      agencyName: body.agencyName,
      startDate: body.startDate,
    });
    return NextResponse.json(model);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to update agency placement" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await resolveParams(context);
  const searchParams = new URL(request.url).searchParams;
  const placementId = searchParams.get("placementId");
  
  if (!placementId) {
    return NextResponse.json(
      { error: "placementId is required" },
      { status: 400 }
    );
  }
  
  try {
    const model = await deleteAgencyPlacement(id, placementId);
    return NextResponse.json(model);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unable to delete agency placement" },
      { status: 400 }
    );
  }
}

