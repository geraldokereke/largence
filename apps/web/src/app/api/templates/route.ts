import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "popular"; // popular, newest, rating, usage
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sessionId = searchParams.get("sessionId"); // For tracking likes

    // Build where clause for published templates
    const where: any = {
      isPublished: true,
      isPublic: true,
    };

    if (category && category !== "all") {
      where.category = {
        equals: category,
        mode: "insensitive",
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { jurisdiction: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = {};
    switch (sort) {
      case "newest":
        orderBy = { publishedAt: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "usage":
        orderBy = { usageCount: "desc" };
        break;
      case "likes":
        orderBy = { likeCount: "desc" };
        break;
      default: // popular - combination of usage and rating
        orderBy = [{ usageCount: "desc" }, { rating: "desc" }];
    }

    // Get total count
    const total = await prisma.template.count({ where });

    // Get templates with pagination
    const templates = await prisma.template.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        documentType: true,
        jurisdiction: true,
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
        // Check if current session/user has liked
        likes: sessionId
          ? {
              where: { sessionId },
              select: { id: true },
            }
          : false,
      },
    });

    // Transform templates to include hasLiked flag
    const transformedTemplates = templates.map((template) => ({
      ...template,
      hasLiked: sessionId
        ? (template as any).likes?.length > 0
        : false,
      likes: undefined, // Remove likes array from response
    }));

    // Get categories for filtering
    const categoriesResult = await prisma.template.groupBy({
      by: ["category"],
      where: {
        isPublished: true,
        isPublic: true,
      },
      _count: true,
    });

    const categories = categoriesResult.map((c) => ({
      name: c.category,
      count: c._count,
    }));

    return NextResponse.json({
      templates: transformedTemplates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      categories,
    });
  } catch (error) {
    console.error("Failed to fetch public templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
