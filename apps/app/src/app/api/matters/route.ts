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
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {
      organizationId: orgId,
    };

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { clientName: { contains: search, mode: "insensitive" } },
        { matterNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [matters, total] = await Promise.all([
      prisma.matter.findMany({
        where,
        include: {
          _count: {
            select: { documents: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.matter.count({ where }),
    ]);

    return NextResponse.json({
      matters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching matters:", error);
    return NextResponse.json(
      { error: "Failed to fetch matters" },
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
      description,
      matterNumber,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      matterType,
      practiceArea,
      dueDate,
      billingType,
      hourlyRate,
      flatFee,
      retainerAmount,
      notes,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Matter name is required" },
        { status: 400 }
      );
    }

    const matter = await prisma.matter.create({
      data: {
        userId,
        organizationId: orgId,
        name,
        description,
        matterNumber,
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        matterType,
        practiceArea,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        billingType: billingType || "HOURLY",
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        flatFee: flatFee ? parseFloat(flatFee) : undefined,
        retainerAmount: retainerAmount ? parseFloat(retainerAmount) : undefined,
        notes,
      },
      include: {
        _count: {
          select: { documents: true },
        },
      },
    });

    return NextResponse.json(matter);
  } catch (error) {
    console.error("Error creating matter:", error);
    return NextResponse.json(
      { error: "Failed to create matter" },
      { status: 500 }
    );
  }
}
