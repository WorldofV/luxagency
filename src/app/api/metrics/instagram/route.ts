import { NextResponse } from "next/server";

import { getMetrics, incrementInstagramClicks } from "@/lib/metricsStore";

export async function GET() {
  const metrics = await getMetrics();
  return NextResponse.json({ count: metrics.instagramClicks });
}

export async function POST() {
  const count = await incrementInstagramClicks();
  return NextResponse.json({ count });
}

