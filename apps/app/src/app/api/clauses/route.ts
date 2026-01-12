import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const favorite = searchParams.get("favorite");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {
      organizationId: orgId,
    };

    if (category) {
      where.category = category;
    }

    if (favorite === "true") {
      where.isFavorite = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const [clauses, total, categories] = await Promise.all([
      prisma.clause.findMany({
        where,
        orderBy: [{ isFavorite: "desc" }, { usageCount: "desc" }, { updatedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.clause.count({ where }),
      prisma.clause.groupBy({
        by: ["category"],
        where: { organizationId: orgId },
        _count: { category: true },
      }),
    ]);

    // Add title alias for client compatibility
    const clausesWithTitle = clauses.map((clause) => ({
      ...clause,
      title: clause.name,
    }));

    return NextResponse.json({
      clauses: clausesWithTitle,
      categories: categories.map((c) => ({
        name: c.category,
        count: c._count.category,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching clauses:", error);
    return NextResponse.json(
      { error: "Failed to fetch clauses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      title, // Accept both name and title for compatibility
      description,
      content,
      category,
      subcategory,
      tags,
      jurisdiction,
      documentTypes,
    } = body;

    const clauseName = name || title; // Use name if provided, otherwise fall back to title

    if (!clauseName || !content || !category) {
      return NextResponse.json(
        { error: "Name (or title), content, and category are required" },
        { status: 400 }
      );
    }

    const clause = await prisma.clause.create({
      data: {
        userId,
        organizationId: orgId,
        name: clauseName,
        description,
        content,
        category,
        subcategory,
        tags: tags || [],
        jurisdiction,
        documentTypes: documentTypes || [],
      },
    });

    // Return with title alias for client compatibility
    return NextResponse.json({
      ...clause,
      title: clause.name, // Add title alias
    });
  } catch (error) {
    console.error("Error creating clause:", error);
    return NextResponse.json(
      { error: "Failed to create clause" },
      { status: 500 }
    );
  }
}
