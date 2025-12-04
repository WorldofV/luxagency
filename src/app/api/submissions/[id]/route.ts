import { NextResponse } from "next/server";

import {
  deleteSubmission,
  getSubmission,
  updateSubmission,
  updateSubmissionStatus,
} from "@/lib/submissionStore";

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
  const submission = await getSubmission(id);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(submission);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await resolveParams(context);
  const payload = await request.json();
  const updates: Record<string, unknown> = {};
  if (typeof payload.status === "string") {
    updates.status = payload.status;
  }
  if (typeof payload.gender === "string") {
    updates.gender = payload.gender;
  }
  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  const updated = await updateSubmission(id, updates);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await resolveParams(context);
  const removed = await deleteSubmission(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

