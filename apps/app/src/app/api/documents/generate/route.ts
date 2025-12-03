import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateDocument } from "@largence/lib/openai";
import prisma from "@largence/lib/prisma";
import { canPerformAction, recordUsage } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return NextResponse.json(
        {
          error:
            "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.",
        },
        { status: 500 },
      );
    }

    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is not configured");
      return NextResponse.json(
        {
          error:
            "Database is not configured. Please set DATABASE_URL in your environment variables.",
        },
        { status: 500 },
      );
    }

    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json(
        {
          error:
            "Organization required. Please create or join an organization first.",
        },
        { status: 403 },
      );
    }

    // Check usage limits before generating
    const usageCheck = await canPerformAction(orgId, "document");
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.reason,
          requiresUpgrade: true,
          currentPlan: usageCheck.subscription?.plan || "FREE",
        },
        { status: 402 }, // Payment Required
      );
    }

    const body = await request.json();
    const { documentType, jurisdiction, parties, additionalInstructions } =
      body;

    if (
      !documentType ||
      !jurisdiction ||
      !parties?.party1 ||
      !parties?.party2
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const content = await generateDocument({
      documentType,
      jurisdiction,
      parties,
      terms: {},
      additionalInstructions,
    });

    // Generate title
    const title = `${documentType} - ${parties.party1} & ${parties.party2}`;

    // Save to database
    const document = await prisma.document.create({
      data: {
        title,
        content,
        documentType,
        jurisdiction,
        category: "Legal Document",
        status: "DRAFT",
        userId,
        organizationId: orgId,
        aiPrompt: additionalInstructions || "",
        aiModel: "gpt-4o-mini",
        generatedAt: new Date(),
      },
    });

    // Record usage after successful generation
    await recordUsage(orgId, "DOCUMENT_GENERATED", document.id);

    return NextResponse.json({
      success: true,
      documentId: document.id,
      document: {
        id: document.id,
        title: document.title,
        content: document.content,
        status: document.status,
        createdAt: document.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Document generation error:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to generate document";
    if (error.message?.includes("OPENAI_API_KEY")) {
      errorMessage = "OpenAI API is not configured properly";
    } else if (
      error.message?.includes("prisma") ||
      error.message?.includes("database")
    ) {
      errorMessage =
        "Database connection failed. Please ensure your database is set up and migrations are run.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
