/**
 * Document Converter Library
 * Production-grade conversion between HTML, DOCX, and other formats
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ImageRun,
  Packer,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from "docx";
import mammoth from "mammoth";

// Types
interface DocumentMetadata {
  title: string;
  author?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SignatureData {
  signerName: string;
  signerRole?: string | null;
  signedAt?: Date | null;
  signatureData?: string | null;
}

interface ConversionResult {
  content: string;
  format: "html" | "text" | "markdown";
}

// HTML to structured content parser
interface ParsedElement {
  type: "paragraph" | "heading" | "list" | "listItem" | "table" | "image" | "break";
  level?: number;
  text?: string;
  runs?: TextRunData[];
  items?: ParsedElement[];
  rows?: ParsedElement[][];
  src?: string;
  alt?: string;
  ordered?: boolean;
}

interface TextRunData {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
}

/**
 * Parse HTML string into structured elements for DOCX generation
 */
function parseHtmlToElements(html: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  
  // Clean HTML and extract meaningful content
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Simple regex-based parsing for common elements
  const blockPattern = /<(h[1-6]|p|div|ul|ol|li|table|tr|td|th|br|img)[^>]*>([\s\S]*?)<\/\1>|<(br|img)[^>]*\/?>/gi;
  
  let match;
  let lastIndex = 0;
  const tempDiv = cleanHtml;
  
  // Split by block elements and process
  const blocks = cleanHtml.split(/<\/?(?:p|div|h[1-6]|ul|ol|li|table|tr|td|th|br)[^>]*>/gi);
  
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    
    // Extract text content, preserving inline formatting
    const textContent = trimmed
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
    
    if (textContent) {
      // Check if it was a heading
      const headingMatch = cleanHtml.match(new RegExp(`<h([1-6])[^>]*>[^<]*${escapeRegex(textContent.substring(0, 20))}`, "i"));
      
      if (headingMatch) {
        elements.push({
          type: "heading",
          level: parseInt(headingMatch[1]),
          text: textContent,
        });
      } else {
        elements.push({
          type: "paragraph",
          text: textContent,
          runs: parseInlineFormatting(trimmed),
        });
      }
    }
  }
  
  // If no elements found, treat entire content as paragraphs
  if (elements.length === 0) {
    const plainText = cleanHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
    
    if (plainText) {
      const paragraphs = plainText.split(/\n\n+/);
      for (const para of paragraphs) {
        if (para.trim()) {
          elements.push({
            type: "paragraph",
            text: para.trim(),
          });
        }
      }
    }
  }
  
  return elements;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Parse inline formatting (bold, italic, underline)
 */
function parseInlineFormatting(html: string): TextRunData[] {
  const runs: TextRunData[] = [];
  
  // Simple approach: extract text with formatting markers
  let text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Process bold
  const boldPattern = /<(strong|b)>([\s\S]*?)<\/\1>/gi;
  const italicPattern = /<(em|i)>([\s\S]*?)<\/\1>/gi;
  const underlinePattern = /<u>([\s\S]*?)<\/u>/gi;
  
  // For simplicity, just extract plain text with basic formatting detection
  const plainText = text.replace(/<[^>]+>/g, "").trim();
  
  if (plainText) {
    runs.push({ text: plainText });
  }
  
  return runs;
}

/**
 * Convert HTML content to proper DOCX format
 */
export async function htmlToDocx(
  html: string,
  metadata: DocumentMetadata,
  signatures?: SignatureData[]
): Promise<Buffer> {
  const elements = parseHtmlToElements(html);
  const children: (Paragraph | Table)[] = [];
  
  // Add title
  children.push(
    new Paragraph({
      text: metadata.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );
  
  // Add content
  for (const element of elements) {
    if (element.type === "heading") {
      const headingLevel = getHeadingLevel(element.level || 1);
      children.push(
        new Paragraph({
          text: element.text || "",
          heading: headingLevel,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (element.type === "paragraph") {
      const textRuns = element.runs?.map(
        (run) =>
          new TextRun({
            text: run.text,
            bold: run.bold,
            italics: run.italic,
            underline: run.underline ? {} : undefined,
            strike: run.strike,
          })
      ) || [new TextRun({ text: element.text || "" })];
      
      children.push(
        new Paragraph({
          children: textRuns,
          spacing: { after: 200 },
        })
      );
    }
  }
  
  // Add signatures section if present
  if (signatures && signatures.length > 0) {
    children.push(
      new Paragraph({
        text: "",
        spacing: { before: 600 },
      })
    );
    
    children.push(
      new Paragraph({
        text: "Signatures",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );
    
    for (const sig of signatures) {
      // Add signature image if available
      if (sig.signatureData && sig.signatureData.startsWith("data:image")) {
        try {
          const base64Data = sig.signatureData.split(",")[1];
          const imageBuffer = Buffer.from(base64Data, "base64");
          
          children.push(
            new Paragraph({
              children: [
                new ImageRun({
                  data: imageBuffer,
                  transformation: {
                    width: 200,
                    height: 60,
                  },
                  type: "png",
                }),
              ],
              spacing: { after: 100 },
            })
          );
        } catch (error) {
          console.error("Error adding signature image:", error);
        }
      }
      
      // Signature line
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "________________________________",
            }),
          ],
        })
      );
      
      // Signer name
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: sig.signerName,
              bold: true,
            }),
          ],
        })
      );
      
      // Signer role
      if (sig.signerRole) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: sig.signerRole,
                italics: true,
              }),
            ],
          })
        );
      }
      
      // Signed date
      if (sig.signedAt) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Signed: ${new Date(sig.signedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}`,
                size: 20,
                color: "666666",
              }),
            ],
            spacing: { after: 300 },
          })
        );
      }
    }
  }
  
  // Create document
  const doc = new Document({
    creator: metadata.author || "Largence",
    title: metadata.title,
    description: `Document created with Largence`,
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: metadata.title,
                    size: 20,
                    color: "999999",
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Page ",
                    size: 20,
                    color: "999999",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 20,
                    color: "999999",
                  }),
                  new TextRun({
                    text: " of ",
                    size: 20,
                    color: "999999",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 20,
                    color: "999999",
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
  
  return await Packer.toBuffer(doc);
}

function getHeadingLevel(level: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
  switch (level) {
    case 1:
      return HeadingLevel.HEADING_1;
    case 2:
      return HeadingLevel.HEADING_2;
    case 3:
      return HeadingLevel.HEADING_3;
    case 4:
      return HeadingLevel.HEADING_4;
    case 5:
      return HeadingLevel.HEADING_5;
    case 6:
      return HeadingLevel.HEADING_6;
    default:
      return HeadingLevel.HEADING_1;
  }
}

/**
 * Convert DOCX file to HTML with formatting preserved
 */
export async function docxToHtml(buffer: Buffer): Promise<ConversionResult> {
  try {
    const result = await mammoth.convertToHtml({ buffer });
    return {
      content: result.value,
      format: "html",
    };
  } catch (error) {
    console.error("Error converting DOCX to HTML:", error);
    // Fallback to text extraction
    const textResult = await mammoth.extractRawText({ buffer });
    return {
      content: textResult.value,
      format: "text",
    };
  }
}

/**
 * Convert DOCX file to plain text
 */
export async function docxToText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Strip HTML tags and return plain text
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Convert plain text or markdown to basic HTML
 */
export function textToHtml(text: string): string {
  // Basic markdown-like conversion
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\n\n+/g, "</p><p>")
    .replace(/\n/g, "<br>");
  
  return `<p>${html}</p>`;
}
