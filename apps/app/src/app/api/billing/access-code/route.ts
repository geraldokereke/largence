import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  redeemAccessCode,
  checkAccessCodeAiLimit,
} from "@/lib/access-codes";

// POST /api/billing/access-code - Redeem an access code
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Access code is required" },
        { status: 400 }
      );
    }

    const result = await redeemAccessCode(orgId, code.trim());

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Access code "${result.codeName}" redeemed successfully! You now have full access with AI requests limited to 10 per day.`,
      codeName: result.codeName,
      description: result.description,
    });
  } catch (error: any) {
    console.error("Error redeeming access code:", error);
    return NextResponse.json(
      { error: error.message || "Failed to redeem access code" },
      { status: 500 }
    );
  }
}

// GET /api/billing/access-code - Check access code status and AI usage
export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await checkAccessCodeAiLimit(orgId);

    if (!status) {
      return NextResponse.json({ hasAccessCode: false });
    }

    return NextResponse.json(status);
  } catch (error: any) {
    console.error("Error checking access code status:", error);
    return NextResponse.json(
      { error: "Failed to check access code status" },
      { status: 500 }
    );
  }
}
