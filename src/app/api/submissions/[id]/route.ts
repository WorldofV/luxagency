import { NextResponse } from "next/server";

import {
  deleteSubmission,
  getSubmission,
  updateSubmissionStatus,
} from "@/lib/submissionStore";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(_: Request, { params }: RouteContext) {
  const submission = await getSubmission(params.id);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(submission);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const payload = await request.json();
  if (!payload.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }
  const updated = await updateSubmissionStatus(params.id, payload.status);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const removed = await deleteSubmission(params.id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

