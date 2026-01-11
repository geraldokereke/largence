import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Submit a rating for a template
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sessionId, rating, review, userName } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
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

    // Check if already rated by this session
    const existingRating = await prisma.templateRating.findFirst({
      where: {
        templateId: id,
        sessionId,
      },
    });

    if (existingRating) {
      // Update existing rating
      await prisma.templateRating.update({
        where: { id: existingRating.id },
        data: {
          rating,
          review: review || null,
          userName: userName || null,
        },
      });
    } else {
      // Create new rating
      await prisma.templateRating.create({
        data: {
          templateId: id,
          sessionId,
          rating,
          review: review || null,
          userName: userName || null,
        },
      });

      // Increment review count
      await prisma.template.update({
        where: { id },
        data: { reviewCount: { increment: 1 } },
      });
    }

    // Recalculate average rating
    const ratingsAgg = await prisma.templateRating.aggregate({
      where: { templateId: id },
      _avg: { rating: true },
      _count: true,
    });

    const newAvgRating = ratingsAgg._avg.rating || 0;

    await prisma.template.update({
      where: { id },
      data: {
        rating: Math.round(newAvgRating * 10) / 10, // Round to 1 decimal
        reviewCount: ratingsAgg._count,
      },
    });

    return NextResponse.json({
      success: true,
      rating: newAvgRating,
      reviewCount: ratingsAgg._count,
    });
  } catch (error) {
    console.error("Failed to submit rating:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}

// Get ratings for a template
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const ratings = await prisma.templateRating.findMany({
      where: { templateId: id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        rating: true,
        review: true,
        userName: true,
        createdAt: true,
      },
    });

    const total = await prisma.templateRating.count({
      where: { templateId: id },
    });

    return NextResponse.json({
      ratings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}
