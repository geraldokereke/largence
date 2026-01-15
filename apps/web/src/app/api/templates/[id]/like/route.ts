import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Toggle like on a template
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Check if template exists and is public
    const template = await prisma.template.findFirst({
      where: {
        id,
        isPublished: true,
        isPublic: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.templateLike.findFirst({
      where: {
        templateId: id,
        sessionId,
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.templateLike.delete({
        where: { id: existingLike.id },
      });

      // Decrement like count
      await prisma.template.update({
        where: { id },
        data: { likeCount: { decrement: 1 } },
      });

      return NextResponse.json({
        liked: false,
        likeCount: template.likeCount - 1,
      });
    } else {
      // Like - add new like
      await prisma.templateLike.create({
        data: {
          templateId: id,
          sessionId,
        },
      });

      // Increment like count
      await prisma.template.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      });

      return NextResponse.json({
        liked: true,
        likeCount: template.likeCount + 1,
      });
    }
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return NextResponse.json(
      { error: "Failed to update like" },
      { status: 500 }
    );
  }
}