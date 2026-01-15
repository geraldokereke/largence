import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    const template = await prisma.template.findFirst({
      where: {
        id,
        isPublished: true,
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        documentType: true,
        jurisdiction: true,
        content: true,
        tags: true,
        usageCount: true,
        rating: true,
        reviewCount: true,
        likeCount: true,
        authorName: true,
        authorAvatar: true,
        keyFeatures: true,
        includedClauses: true,
        suitableFor: true,
        publishedAt: true,
        createdAt: true,
        likes: sessionId
          ? {
              where: { sessionId },
              select: { id: true },
            }
          : false,
        ratings: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            rating: true,
            review: true,
            userName: true,
            createdAt: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Increment usage count (view)
    await prisma.template.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json({
      ...template,
      hasLiked: sessionId ? (template as any).likes?.length > 0 : false,
      likes: undefined,
    });
  } catch (error) {
    console.error("Failed to fetch template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}