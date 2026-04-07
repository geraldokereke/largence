import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";
import prisma from "@largence/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key" });

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateContent(text: string, maxChars = 8000): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n\n[Document truncated for analysis — full text on file]";
}

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { documentIds, matterContext } = body as {
      documentIds: string[];
      matterContext?: {
        matterName?: string;
        clientName?: string;
        matterType?: string;
        practiceArea?: string;
      };
    };

    if (!documentIds || documentIds.length === 0) {
      return NextResponse.json({ error: "No documents provided" }, { status: 400 });
    }

    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds },
        ...(orgId ? { organizationId: orgId } : { userId }),
      },
      select: { id: true, title: true, content: true, documentType: true },
    });

    if (documents.length === 0) {
      return NextResponse.json({ error: "No accessible documents found" }, { status: 404 });
    }

    const bundleText = documents
      .map((doc, i) => {
        const cleanContent = truncateContent(stripHtml(doc.content || ""));
        return `=== DOCUMENT ${i + 1}: ${doc.title} (${doc.documentType || "Legal Document"}) ===\n\n${cleanContent}\n`;
      })
      .join("\n\n");

    const contextLine = matterContext
      ? `Matter: ${matterContext.matterName || "Unnamed"} | Client: ${matterContext.clientName || "Unknown"} | Type: ${matterContext.matterType || "General"} | Practice Area: ${matterContext.practiceArea || "General"}`
      : "";

    const systemPrompt = `You are an expert legal analyst at a leading law firm. Analyse this document bundle and produce a decision-ready, structured analysis for senior lawyer review.

Your analysis must be:
- Specific and actionable — reference exact clauses, dates, and terms from the source documents
- Legally grounded — apply relevant legal principles to the specific facts presented
- Risk-prioritised — surface the most legally significant risks, not surface-level observations
- Senior-ready — the output should reduce senior review time, not add to it

${contextLine ? `Context: ${contextLine}` : ""}

Return a valid JSON object with this exact structure (no markdown, no explanation — JSON only):
{
  "seniorSummary": "2-4 sentence executive summary of key facts, risks, and recommended immediate action. Written for a senior partner who has 60 seconds. Be specific about parties, dates, and the nature of the dispute.",
  "overallRiskLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "defects": [
    {
      "id": "d1",
      "severity": "CRITICAL|HIGH|MEDIUM",
      "title": "Short title of defect",
      "description": "Specific description citing the relevant clause/section and why it constitutes a defect under applicable law",
      "sourceDocument": "Name of document containing this defect",
      "recommendation": "Specific action required to address this defect"
    }
  ],
  "keyClauses": [
    {
      "id": "c1",
      "type": "Clause category (e.g. Notice Requirements, Repair Obligations, Rent Terms, Break Clause, Termination, etc.)",
      "content": "Exact or near-exact clause text from the document",
      "sourceDocument": "Document name",
      "significance": "Why this clause is legally significant and how it affects the matter outcome"
    }
  ],
  "inconsistencies": [
    {
      "id": "i1",
      "severity": "HIGH|MEDIUM|LOW",
      "description": "Specific factual or legal inconsistency identified across documents, with exact references",
      "documentsInvolved": ["Document name 1", "Document name 2"],
      "implication": "Legal or factual implication of this inconsistency for the matter"
    }
  ],
  "urgentIssues": [
    {
      "id": "u1",
      "title": "Issue requiring immediate senior attention",
      "description": "Why this requires urgent senior input — specific facts and legal basis",
      "timeframe": "Immediate|Within 7 days|Within 14 days|Within 30 days",
      "recommendedAction": "Specific recommended action with clear ownership"
    }
  ],
  "confidenceScore": 85
}

Populate all arrays thoroughly. Aim for completeness — omission of a key risk will be penalised in the evaluation.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyse this document bundle:\n\n${bundleText}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    let analysis;
    try {
      analysis = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI analysis output" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      analysis,
      documentsAnalysed: documents.map((d) => ({ id: d.id, title: d.title })),
    });
  } catch (error) {
    console.error("Bundle analysis error:", error);
    return NextResponse.json({ error: "Bundle analysis failed. Please try again." }, { status: 500 });
  }
}
