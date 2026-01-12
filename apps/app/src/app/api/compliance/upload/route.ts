import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { runComplianceChecks } from "@largence/lib/compliance-rules";
import prisma from "@largence/lib/prisma";
import { canPerformAction, recordUsage } from "@/lib/stripe";
import { createAuditLog, getUserInitials } from "@/lib/audit";

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization required. Please select an organization." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF, DOCX, or TXT file." },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Extract text content from file
    let content = "";
    
    if (file.type === "text/plain") {
      content = await file.text();
    } else if (file.type === "application/pdf") {
      // For PDF files, use pdf-parse
      const buffer = Buffer.from(await file.arrayBuffer());
      try {
        // Dynamically import pdf-parse v2.x (PDFParse is a named export)
        const { PDFParse } = await import("pdf-parse");
        
        // Create parser with buffer data
        const parser = new PDFParse({ data: buffer });
        
        // Parse PDF and get text
        const textResult = await parser.getText();
        content = textResult.pages.map((page) => page.text).join("\n\n") || "";
        
        // Clean up
        await parser.destroy();
        
        // If we got very little text, it might be a scanned PDF
        if (content.trim().length < 50) {
          console.warn("PDF appears to have very little extractable text - may be scanned/image-based");
        }
      } catch (error) {
        console.error("PDF parsing error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        // Provide specific error messages based on common issues
        if (errorMessage.includes("encrypted") || errorMessage.includes("password")) {
          return NextResponse.json(
            { error: "This PDF appears to be password-protected. Please upload an unprotected PDF or convert to TXT format." },
            { status: 400 }
          );
        }
        
        if (errorMessage.includes("Invalid") || errorMessage.includes("corrupt")) {
          return NextResponse.json(
            { error: "This PDF appears to be corrupted or invalid. Please try re-exporting the PDF or convert to TXT format." },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { error: "Failed to parse PDF file. This may be a scanned document or image-based PDF. Please convert to a text-based format and try again." },
          { status: 400 }
        );
      }
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // For DOCX files, use mammoth
      const buffer = Buffer.from(await file.arrayBuffer());
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        content = result.value;
      } catch (error) {
        console.error("DOCX parsing error:", error);
        return NextResponse.json(
          { error: "Failed to parse DOCX file. Please ensure it contains readable text or try uploading a TXT file." },
          { status: 400 }
        );
      }
    }

    if (!content || content.trim().length < 100) {
      return NextResponse.json(
        { error: "Could not extract sufficient content from file. Please ensure the file contains readable text." },
        { status: 400 }
      );
    }

    // Determine document type based on content
    const documentType = detectDocumentType(content);

    // Check usage limits before running compliance check
    const usageCheck = await canPerformAction(orgId, "compliance");
    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.reason,
          requiresUpgrade: true,
          currentPlan: usageCheck.subscription?.plan || "FREE",
        },
        { status: 402 }
      );
    }

    // Create a document record for the uploaded file
    const document = await prisma.document.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        content: content,
        documentType: documentType,
        userId: userId,
        organizationId: orgId,
        status: "DRAFT",
        jurisdiction: "Nigeria",
      },
    });

    // Create compliance check record
    const complianceCheck = await prisma.complianceCheck.create({
      data: {
        documentId: document.id,
        status: "IN_PROGRESS",
        issues: [],
        warnings: [],
        suggestions: [],
        rulesChecked: [],
        jurisdiction: "Nigeria",
        documentType: documentType,
      },
    });

    // Run compliance checks using the existing rule-based system
    const results = runComplianceChecks(content, {
      title: document.title,
      documentType: documentType,
      jurisdiction: "Nigeria",
    });

    // Update compliance check with results
    const updatedCheck = await prisma.complianceCheck.update({
      where: { id: complianceCheck.id },
      data: {
        status: "COMPLETED",
        overallScore: results.score,
        issues: JSON.parse(JSON.stringify(results.issues)),
        warnings: JSON.parse(JSON.stringify(results.warnings)),
        suggestions: JSON.parse(JSON.stringify(results.suggestions)),
        completedAt: new Date(),
      },
      include: {
        document: {
          select: {
            title: true,
          },
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        organizationId: orgId,
        type: "COMPLIANCE_COMPLETED",
        title: "Compliance Check Complete",
        message: `Compliance check for "${document.title}" completed with a score of ${results.score}/100. ${results.issues.length} critical issues found.`,
        documentId: document.id,
        complianceId: updatedCheck.id,
        actionUrl: `/compliance/${updatedCheck.id}`,
      },
    });

    // Record usage after successful compliance check
    await recordUsage(orgId, "COMPLIANCE_CHECK", updatedCheck.id);

    // Log audit event for compliance check
    const user = await currentUser();
    await createAuditLog({
      userId,
      organizationId: orgId,
      action: "COMPLIANCE_CHECK_COMPLETED",
      actionLabel: `Ran compliance check on uploaded file (Score: ${results.score}/100)`,
      entityType: "Compliance",
      entityId: updatedCheck.id,
      entityName: document.title,
      metadata: {
        documentId: document.id,
        score: results.score,
        issuesCount: results.issues.length,
        warningsCount: results.warnings.length,
        suggestionsCount: results.suggestions.length,
        jurisdiction: "Nigeria",
        documentType: documentType,
        source: "FILE_UPLOAD",
      },
      userName: user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username ||
          "User"
        : "User",
      userAvatar: getUserInitials(user?.firstName, user?.lastName),
    });

    return NextResponse.json({ 
      success: true,
      complianceCheck: updatedCheck 
    });
  } catch (error) {
    console.error("Compliance upload error:", error);
    return NextResponse.json(
      { error: "Failed to process compliance check" },
      { status: 500 }
    );
  }
}

function detectDocumentType(content: string): string {
  const lowerContent = content.toLowerCase();
  
  // Check for contract-related keywords
  if (
    lowerContent.includes("agreement") ||
    lowerContent.includes("contract") ||
    lowerContent.includes("parties agree") ||
    lowerContent.includes("hereby agree")
  ) {
    if (lowerContent.includes("employment") || lowerContent.includes("employee")) {
      return "Employment Contract";
    }
    if (lowerContent.includes("service") || lowerContent.includes("consulting")) {
      return "Service Agreement";
    }
    if (lowerContent.includes("non-disclosure") || lowerContent.includes("confidentiality")) {
      return "NDA";
    }
    if (lowerContent.includes("lease") || lowerContent.includes("tenant")) {
      return "Lease Agreement";
    }
    return "Contract";
  }
  
  // Check for policy-related keywords
  if (
    lowerContent.includes("privacy policy") ||
    lowerContent.includes("data protection") ||
    lowerContent.includes("personal data")
  ) {
    return "Privacy Policy";
  }
  
  if (lowerContent.includes("terms of service") || lowerContent.includes("terms and conditions")) {
    return "Terms of Service";
  }
  
  // Default
  return "Legal Document";
}
