import { NextRequest, NextResponse } from "next/server";

import { getMetrics, incrementInstagramClicks } from "@/lib/metricsStore";

export async function GET() {
  const metrics = await getMetrics();
  return NextResponse.json({
    footer: metrics.instagramClicksFooter,
    submission: metrics.instagramClicksSubmission,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const source = body.source === "submission" ? "submission" : "footer";
  const metrics = await incrementInstagramClicks(source);
  return NextResponse.json({
    footer: metrics.instagramClicksFooter,
    submission: metrics.instagramClicksSubmission,
  });
}

