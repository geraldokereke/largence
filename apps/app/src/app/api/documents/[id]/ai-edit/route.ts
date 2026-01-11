import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt, content, action } = body;

    if (!prompt || !content) {
      return NextResponse.json(
        { error: "Prompt and content are required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert legal document assistant. Your role is to help users edit and improve their legal documents.
You will receive the current document content and a user request. Apply the requested changes while:
1. Maintaining the document's professional legal tone
2. Preserving the HTML formatting structure
3. Keeping any existing clause numbering and section structure
4. Only modifying the relevant parts as requested
5. Ensuring legal terminology remains accurate

When making edits:
- If asked to add content, integrate it naturally into the existing document
- If asked to modify, only change what's specifically requested
- If asked to improve or enhance, focus on clarity and legal precision
- If asked to remove content, do so cleanly without leaving gaps

Return ONLY the modified document content in HTML format. Do not include any explanations or commentary outside the document.`;

    const userPrompt = `Current document content:
${content}

User request: ${prompt}

Please apply the requested changes and return the complete modified document.`;

    // Create a streaming response
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

          for await (const chunk of openaiStream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (error) {
          console.error("OpenAI streaming error:", error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Failed to process request" })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("AI edit error:", error);
    return NextResponse.json(
      { error: "Failed to process AI edit request" },
      { status: 500 }
    );
  }
}
