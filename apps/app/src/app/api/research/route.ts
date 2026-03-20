import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { performLegalResearch } from "@largence/lib/openai";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { query, jurisdiction, docTypes, legalTopics } = body;

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "A research query is required." },
        { status: 400 },
      );
    }

    const result = await performLegalResearch({
      query: query.trim(),
      jurisdiction,
      docTypes,
      legalTopics,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Legal research error:", error);
    return NextResponse.json(
      { error: error.message ?? "Research failed. Please try again." },
      { status: 500 },
    );
  }
}
