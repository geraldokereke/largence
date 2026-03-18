import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog } from "@/lib/audit";
import { docxToHtml, textToHtml } from "@/lib/document-converter";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!orgId) {
      return NextResponse.json({ error: "Organization required" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = (formData.get("documentType") as string) || "OTHER";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10 MB." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const supported = ["pdf", "docx", "doc", "txt", "md", "html", "htm"];
    if (!supported.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type .${ext}. Supported: PDF, DOCX, DOC, TXT, MD, HTML` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let content = "";

    if (ext === "pdf") {
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = pdfParseModule.default ?? pdfParseModule;
      const data = await pdfParse(buffer);
      content = textToHtml(data.text);
    } else if (ext === "docx" || ext === "doc") {
      try {
        const result = await docxToHtml(buffer);
        content = result.content;
      } catch {
        content = `<p>This .${ext} file could not be fully parsed. Please save as .docx and try again.</p>`;
      }
    } else if (ext === "html" || ext === "htm") {
      content = buffer.toString("utf-8");
    } else {
      // txt, md
      content = textToHtml(buffer.toString("utf-8"));
    }

    const title = file.name.replace(/\.(pdf|docx?|txt|md|html?)$/i, "");

    const document = await prisma.document.create({
      data: {
        title,
        content,
        documentType,
        status: "DRAFT",
        userId,
        organizationId: orgId,
        visibility: "PRIVATE",
      },
    });

    await createAuditLog({
      action: "DOCUMENT_CREATED",
      actionLabel: "Uploaded document from computer",
      entityType: "Document",
      entityId: document.id,
      entityName: title,
      userId,
      organizationId: orgId,
      metadata: {
        source: "local_upload",
        originalFileName: file.name,
        fileSize: file.size,
        fileType: ext,
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        status: document.status,
      },
    });
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
