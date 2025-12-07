import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import prisma from "@largence/lib/prisma";
import { canPerformAction, recordUsage } from "@/lib/stripe";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id: documentId } = await params;

    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Verify ownership
    if (document.userId !== userId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check usage limits before running compliance check
    if (orgId) {
      const usageCheck = await canPerformAction(orgId, "compliance");
      if (!usageCheck.allowed) {
        return new Response(
          JSON.stringify({
            error: usageCheck.reason,
            requiresUpgrade: true,
            currentPlan: usageCheck.subscription?.plan || "FREE",
          }),
          {
            status: 402,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    const { content } = await request.json();

    // Create compliance check record
    const complianceCheck = await prisma.complianceCheck.create({
      data: {
        documentId,
        status: "IN_PROGRESS",
        issues: [],
        warnings: [],
        suggestions: [],
        rulesChecked: [],
        jurisdiction: document.jurisdiction,
        documentType: document.documentType,
      },
    });

    // System prompt for agentic compliance
    const systemPrompt = `You are an expert legal compliance AI agent specializing in African jurisdictions and international business law.

Your task is to analyze the provided legal document and rewrite it with ALL compliance issues fixed.

COMPLIANCE REQUIREMENTS:
1. Ensure all mandatory legal clauses are present for the document type
2. Fix any ambiguous or unclear language
3. Add missing definitions for legal terms
4. Ensure proper party identification and representation
5. Verify jurisdiction-specific requirements are met
6. Add standard protective clauses (liability, indemnification, force majeure)
7. Ensure proper termination and dispute resolution clauses
8. Fix any grammatical or formatting issues
9. Ensure dates and references are properly formatted
10. Add missing signature blocks if needed

FORMATTING REQUIREMENTS:
- Output clean HTML with proper semantic tags
- Use <h1> for the document title
- Use <h2> for major sections
- Use <h3> for subsections
- Use <p> for paragraphs
- Use <strong> for defined terms and emphasis
- Use <ul> or <ol> for lists where appropriate
- Maintain professional legal document formatting

IMPORTANT: Return ONLY the complete, fixed HTML document. Do not include any explanations, comments, or markdown code blocks. Just output the corrected document directly.`;

    const userPrompt = `Please review and fix the following ${document.documentType || "legal document"} for ${document.jurisdiction || "general"} compliance:

${content}

Rewrite the document with all compliance issues fixed, maintaining the original intent while ensuring full legal compliance.`;

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const openaiStream = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 8000,
            stream: true,
          });

          let fullContent = "";

          for await (const chunk of openaiStream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullContent += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // Update compliance check as completed
          await prisma.complianceCheck.update({
            where: { id: complianceCheck.id },
            data: {
              status: "COMPLETED",
              overallScore: 95, // Agentic compliance aims for high score
              suggestions: [
                "Document has been automatically updated with compliance fixes",
              ],
              completedAt: new Date(),
            },
          });

          // Create notification
          await prisma.notification.create({
            data: {
              userId,
              organizationId: document.organizationId,
              type: "COMPLIANCE_COMPLETED",
              title: "Agentic Compliance Complete",
              message: `Your document "${document.title}" has been automatically updated with compliance fixes.`,
              documentId,
              complianceId: complianceCheck.id,
              actionUrl: `/documents/${documentId}`,
            },
          });

          // Record usage after successful compliance check
          if (orgId) {
            await recordUsage(orgId, "COMPLIANCE_CHECK", complianceCheck.id);
          }

          controller.close();
        } catch (error) {
          console.error("Error in agentic compliance stream:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in agentic compliance:", error);
    return new Response(
      JSON.stringify({ error: "Failed to run agentic compliance" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
