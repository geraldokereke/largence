import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key" });

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { analysis, matterName, clientName, matterType, practiceArea } = body as {
      analysis: Record<string, unknown>;
      matterName?: string;
      clientName?: string;
      matterType?: string;
      practiceArea?: string;
    };

    if (!analysis) {
      return NextResponse.json({ error: "Analysis data required" }, { status: 400 });
    }

    const today = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const systemPrompt = `You are a senior legal associate at a leading law firm drafting an internal briefing memo for partner review. The memo must be structured, concise, and decision-ready — enabling the supervising partner to validate the analysis efficiently and decide how to proceed.

Requirements:
- Professional internal memo format
- Specific and evidence-based — reference exact documents, dates, and clause numbers
- Risk-rated: assign HIGH / MEDIUM / LOW to each identified issue
- Reduce senior rewrite time: the memo should be largely usable as-is after review

Output clean HTML using: <h2> for section headings, <h3> for sub-headings, <p> for paragraphs, <ul>/<li> for bullet lists, <ol>/<li> for numbered lists, <strong> for emphasis, <table>/<tr>/<th>/<td> for structured tables. Do not use markdown.

Structure the memo with these exact sections:
1. MEMORANDUM HEADER — standard internal memo header (To, From, Date, Re, Matter Reference)
2. EXECUTIVE SUMMARY — 3-5 sentences: key facts, overall risk level, immediate action required
3. BACKGROUND & FACTS — chronological narrative of material facts drawn from the documents
4. LEGAL ISSUES — numbered list of specific legal questions to be determined
5. RELEVANT LEGAL PRINCIPLES — applicable statutory provisions and legal principles for each issue
6. RISK ASSESSMENT — HTML table with columns: Issue | Risk Level | Analysis | Action Required
7. POTENTIAL DEFENCES & ARGUMENTS — bullet points with legal basis for each
8. RECOMMENDED NEXT STEPS — numbered list with suggested owner and timeframe
9. MATTERS REQUIRING SENIOR INPUT — flagged items that need supervising partner decision before proceeding`;

    const userPrompt = `Draft an internal briefing memo for this matter:

DATE: ${today}
MATTER: ${matterName || "Unnamed Matter"}
CLIENT: ${clientName || "Unknown Client"}
MATTER TYPE: ${matterType || "General"}
PRACTICE AREA: ${practiceArea || "General"}

BUNDLE ANALYSIS FINDINGS:
${JSON.stringify(analysis, null, 2)}

Draft the complete internal memo now. Output HTML only — no preamble, no markdown fences.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 4000,
    });

    let memoHtml = completion.choices[0]?.message?.content ?? "";

    // Strip any markdown code fences if present
    memoHtml = memoHtml.replace(/^```html?\s*/i, "").replace(/```\s*$/i, "").trim();

    return NextResponse.json({ success: true, memoHtml });
  } catch (error) {
    console.error("Memo generation error:", error);
    return NextResponse.json({ error: "Memo generation failed. Please try again." }, { status: 500 });
  }
}
