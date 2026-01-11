import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";

// GET - Fetch all templates (user's own + published public templates)
export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const onlyMine = searchParams.get("mine") === "true";
    const onlyPublished = searchParams.get("published") === "true";
    const onlyCommunity = searchParams.get("community") === "true";

    // Community templates - all published public templates (including user's own for visibility)
    if (onlyCommunity) {
      const communityTemplates = await prisma.template.findMany({
        where: {
          isPublished: true,
          isPublic: true,
        },
        orderBy: [
          { usageCount: "desc" },
          { rating: "desc" },
          { publishedAt: "desc" },
        ],
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          documentType: true,
          jurisdiction: true,
          usageCount: true,
          rating: true,
          reviewCount: true,
          likeCount: true,
          tags: true,
          authorName: true,
          publishedAt: true,
        },
      });

      return NextResponse.json({ templates: communityTemplates });
    }

    // Build where clause for user's own templates
    if (onlyMine) {
      const myTemplates = await prisma.template.findMany({
        where: {
          OR: [
            { userId },
            ...(orgId ? [{ organizationId: orgId }] : []),
          ],
        },
        orderBy: [
          { updatedAt: "desc" },
        ],
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          documentType: true,
          jurisdiction: true,
          content: true,
          isPublished: true,
          isPublic: true,
          usageCount: true,
          rating: true,
          reviewCount: true,
          likeCount: true,
          tags: true,
          version: true,
          userId: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const templatesWithOwnership = myTemplates.map((template: any) => ({
        ...template,
        isOwner: true,
      }));

      return NextResponse.json({ templates: templatesWithOwnership });
    }

    // Default: user's templates + published public templates
    const whereClause: any = {
      OR: [
        // User's own templates
        { userId },
        // Organization templates
        ...(orgId ? [{ organizationId: orgId }] : []),
        // Published public templates
        { isPublished: true, isPublic: true },
      ],
    };

    if (category && category !== "all") {
      whereClause.category = category;
    }

    if (onlyPublished) {
      whereClause.isPublished = true;
    }

    const templates = await prisma.template.findMany({
      where: whereClause,
      orderBy: [
        { isPublished: "desc" },
        { usageCount: "desc" },
        { updatedAt: "desc" },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        documentType: true,
        jurisdiction: true,
        isPublished: true,
        isPublic: true,
        usageCount: true,
        rating: true,
        reviewCount: true,
        likeCount: true,
        tags: true,
        version: true,
        userId: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Mark which templates belong to the current user
    const templatesWithOwnership = templates.map((template: any) => ({
      ...template,
      isOwner: template.userId === userId || template.organizationId === orgId,
    }));

    return NextResponse.json({ templates: templatesWithOwnership });
  } catch (error: any) {
    console.error("Fetch templates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create a new template from a document
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's name for author attribution
    const user = await currentUser();
    const authorName = user?.firstName && user?.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Anonymous";

    const body = await request.json();
    const {
      name,
      description,
      category,
      documentType,
      jurisdiction,
      content,
      tags,
      isPublic,
      publishToDirectory,
    } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: "Name and content are required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        userId,
        organizationId: orgId || null,
        name,
        description: description || "",
        category: category || "Other",
        documentType: documentType || "Other",
        jurisdiction: jurisdiction || null,
        content,
        tags: tags || [],
        isPublic: isPublic || false,
        isPublished: publishToDirectory || false,
        publishedAt: publishToDirectory ? new Date() : null,
        authorName: publishToDirectory ? authorName : null,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    console.error("Create template error:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
