import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { htmlToDocx } from "@/lib/document-converter";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id: documentId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "pdf";

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: orgId,
      },
      include: {
        signatures: {
          where: { status: "SIGNED" },
          select: {
            signerName: true,
            signerRole: true,
            signedAt: true,
            signatureData: true,
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (format === "pdf") {
      return generatePDF(document);
    } else if (format === "docx") {
      return await generateDocx(document);
    } else if (format === "html") {
      return generateHTML(document);
    } else {
      return NextResponse.json(
        { error: "Unsupported format. Use: pdf, docx, or html" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error exporting document:", error);
    return NextResponse.json(
      { error: "Failed to export document" },
      { status: 500 }
    );
  }
}

interface DocumentWithSignatures {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  signatures: {
    signerName: string;
    signerRole: string | null;
    signedAt: Date | null;
    signatureData: string | null;
  }[];
}

async function generatePDF(document: DocumentWithSignatures) {
  // Generate a print-ready HTML document that can be converted to PDF
  // In a production app, you'd use a library like puppeteer, playwright, or a service like Browserless
  // For now, we'll return HTML that can be printed to PDF
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(document.title)}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
    }
    h1 {
      font-size: 18pt;
      text-align: center;
      margin-bottom: 1.5em;
      border-bottom: 2px solid #000;
      padding-bottom: 0.5em;
    }
    .content {
      text-align: justify;
    }
    .content p {
      margin-bottom: 1em;
      text-indent: 2em;
    }
    .content p:first-child {
      text-indent: 0;
    }
    .signatures {
      margin-top: 3em;
      page-break-inside: avoid;
    }
    .signatures h2 {
      font-size: 14pt;
      margin-bottom: 1em;
      border-bottom: 1px solid #ccc;
      padding-bottom: 0.5em;
    }
    .signature-block {
      display: inline-block;
      width: 45%;
      margin-right: 5%;
      margin-bottom: 2em;
      vertical-align: top;
    }
    .signature-block:nth-child(even) {
      margin-right: 0;
    }
    .signature-image {
      max-width: 200px;
      max-height: 60px;
      margin-bottom: 0.5em;
    }
    .signature-line {
      border-bottom: 1px solid #000;
      margin-bottom: 0.3em;
      min-height: 60px;
    }
    .signature-name {
      font-weight: bold;
    }
    .signature-role {
      font-style: italic;
      color: #666;
    }
    .signature-date {
      font-size: 10pt;
      color: #666;
    }
    .footer {
      margin-top: 3em;
      padding-top: 1em;
      border-top: 1px solid #ccc;
      font-size: 10pt;
      color: #666;
      text-align: center;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(document.title)}</h1>
  
  <div class="content">
    ${document.content}
  </div>
  
  ${document.signatures.length > 0 ? `
  <div class="signatures">
    <h2>Signatures</h2>
    ${document.signatures.map(sig => `
      <div class="signature-block">
        <div class="signature-line">
          ${sig.signatureData ? `<img src="${sig.signatureData}" class="signature-image" alt="Signature" />` : ''}
        </div>
        <div class="signature-name">${escapeHtml(sig.signerName)}</div>
        ${sig.signerRole ? `<div class="signature-role">${escapeHtml(sig.signerRole)}</div>` : ''}
        ${sig.signedAt ? `<div class="signature-date">Signed: ${new Date(sig.signedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  <div class="footer">
    Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
  </div>
</body>
</html>
`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(document.title)}.html"`,
    },
  });
}

async function generateDocx(document: DocumentWithSignatures) {
  try {
    // Use the document-converter library for proper DOCX generation
    const docxBuffer = await htmlToDocx(
      document.content,
      {
        title: document.title,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      },
      document.signatures.map(sig => ({
        signerName: sig.signerName,
        signerRole: sig.signerRole,
        signedAt: sig.signedAt,
        signatureData: sig.signatureData,
      }))
    );

    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${sanitizeFilename(document.title)}.docx"`,
      },
    });
  } catch (error) {
    console.error("Error generating DOCX:", error);
    // Fallback to basic HTML-based .doc if DOCX generation fails
    return generateFallbackDoc(document);
  }
}

function generateFallbackDoc(document: DocumentWithSignatures) {
  const html = `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.5;
    }
    h1 {
      font-size: 18pt;
      text-align: center;
      margin-bottom: 24pt;
    }
    p {
      margin-bottom: 12pt;
    }
    .signatures {
      margin-top: 36pt;
    }
    .signature-block {
      margin-bottom: 24pt;
    }
    .signature-line {
      border-bottom: 1pt solid black;
      margin-bottom: 6pt;
      height: 48pt;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(document.title)}</h1>
  
  ${document.content}
  
  ${document.signatures.length > 0 ? `
  <div class="signatures">
    <h2>Signatures</h2>
    ${document.signatures.map(sig => `
      <div class="signature-block">
        <div class="signature-line">
          ${sig.signatureData ? `<img src="${sig.signatureData}" style="max-width: 200px; max-height: 48px;" />` : ''}
        </div>
        <p><strong>${escapeHtml(sig.signerName)}</strong></p>
        ${sig.signerRole ? `<p><em>${escapeHtml(sig.signerRole)}</em></p>` : ''}
        ${sig.signedAt ? `<p>Signed: ${new Date(sig.signedAt).toLocaleDateString()}</p>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}
</body>
</html>
`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "application/vnd.ms-word",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(document.title)}.doc"`,
    },
  });
}

async function generateHTML(document: DocumentWithSignatures) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(document.title)}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 1rem;
    }
    .meta {
      color: #6b7280;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }
    .signatures {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
    .signature-block {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.5rem;
    }
    .signature-image {
      max-width: 200px;
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(document.title)}</h1>
  <div class="meta">
    Last updated: ${new Date(document.updatedAt).toLocaleDateString()}
  </div>
  
  <div class="content">
    ${document.content}
  </div>
  
  ${document.signatures.length > 0 ? `
  <div class="signatures">
    <h2>Signatures</h2>
    ${document.signatures.map(sig => `
      <div class="signature-block">
        ${sig.signatureData ? `<img src="${sig.signatureData}" class="signature-image" alt="Signature" />` : ''}
        <div><strong>${escapeHtml(sig.signerName)}</strong></div>
        ${sig.signerRole ? `<div>${escapeHtml(sig.signerRole)}</div>` : ''}
        ${sig.signedAt ? `<div>Signed: ${new Date(sig.signedAt).toLocaleDateString()}</div>` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}
</body>
</html>
`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="${sanitizeFilename(document.title)}.html"`,
    },
  });
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9]/gi, '_').substring(0, 100);
}
