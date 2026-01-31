import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// POST /api/billing/student/verify - Submit student verification request
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentEmail, institutionName, proofUrl } = body;

    // Validate student email (must be .edu or known institution domain)
    const validStudentDomains = [
      ".edu",
      ".edu.ng", // Nigeria
      ".edu.gh", // Ghana
      ".ac.uk", // UK
      ".edu.au", // Australia
      ".edu.za", // South Africa
      ".edu.in", // India
      ".edu.br", // Brazil
      ".edu.mx", // Mexico
      ".ac.za", // South Africa
      ".ac.ke", // Kenya
    ];

    const isValidStudentEmail = validStudentDomains.some((domain) =>
      studentEmail.toLowerCase().endsWith(domain)
    );

    if (!isValidStudentEmail) {
      return NextResponse.json(
        {
          error: "Please provide a valid student email address (.edu, .edu.ng, .ac.uk, etc.)",
        },
        { status: 400 }
      );
    }

    // Get current user info
    const user = await currentUser();

    // Update subscription with student verification request
    await prisma.subscription.update({
      where: { organizationId: orgId },
      data: {
        studentEmail,
        isStudentVerified: false, // Will be verified manually or via email confirmation
      },
    });

    // In a production app, you would:
    // 1. Send a verification email to the student email
    // 2. Create a verification record in the database
    // 3. Set up a webhook to handle email verification
    // For now, we'll auto-verify for demo purposes

    // TODO: Implement proper verification flow
    // For demo, auto-verify after checking email domain
    await prisma.subscription.update({
      where: { organizationId: orgId },
      data: {
        isStudentVerified: true,
        studentVerifiedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student status verified! You can now subscribe to the Student plan.",
      verified: true,
    });
  } catch (error: any) {
    console.error("Error verifying student status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify student status" },
      { status: 500 }
    );
  }
}

// GET /api/billing/student/verify - Check student verification status
export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: orgId },
      select: {
        isStudentVerified: true,
        studentEmail: true,
        studentVerifiedAt: true,
      },
    });

    return NextResponse.json({
      isVerified: subscription?.isStudentVerified || false,
      studentEmail: subscription?.studentEmail || null,
      verifiedAt: subscription?.studentVerifiedAt || null,
    });
  } catch (error: any) {
    console.error("Error checking student status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check student status" },
      { status: 500 }
    );
  }
}
