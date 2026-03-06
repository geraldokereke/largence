import OpenAI from "openai";
import { documentTypeConfigs, type DocumentTypeConfig } from "./document-types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

export interface DocumentGenerationParams {
  documentType: string;
  jurisdiction?: string;
  parties?: {
    party1?: string;
    party2?: string;
  };
  terms?: Record<string, any>;
  additionalInstructions?: string;
}

// Get the document type ID from the name
function getDocumentTypeId(documentTypeName: string): string {
  const normalizedName = documentTypeName.toLowerCase();
  for (const [id, config] of Object.entries(documentTypeConfigs)) {
    if (config.name.toLowerCase() === normalizedName || id === normalizedName) {
      return id;
    }
  }
  return normalizedName.replace(/\s+/g, "-");
}

export async function generateDocument(
  params: DocumentGenerationParams,
): Promise<string> {
  const { documentType, jurisdiction, parties, terms, additionalInstructions } =
    params;

  const typeId = getDocumentTypeId(documentType);
  const typeConfig = documentTypeConfigs[typeId];

  const systemPrompt = `You are an expert legal document generator specializing in all jurisdictions. 

CRITICAL INSTRUCTIONS:
1. Generate ONLY the legal document content in clean HTML format
2. DO NOT include any meta-commentary, explanations, or instructions like "This document represents..." or "Please fill in the placeholders..."
3. DO NOT include placeholder instructions or notes to the user
4. Use the actual party names and details provided - do not use generic placeholders like [Party Name] when real names are given
5. Generate a complete, ready-to-use legal document with all sections filled in appropriately
6. Use proper HTML structure: <h1> for title, <h2> for sections, <h3> for subsections, <p> for paragraphs
7. Include all standard legal clauses appropriate for the document type and jurisdiction
8. The document should be professional, legally sound, and immediately usable after generation`;

  const userPrompt = `Generate a ${documentType} for ${jurisdiction}.

PARTY INFORMATION:
- ${typeConfig?.parties.party1.label || "First Party"}: ${parties?.party1 || "Party A"}
- ${typeConfig?.parties.party2.label || "Second Party"}: ${parties?.party2 || "Party B"}

${terms ? `TERMS:\n${JSON.stringify(terms, null, 2)}\n` : ""}

${additionalInstructions ? `ADDITIONAL DETAILS:\n${additionalInstructions}\n` : ""}

${typeConfig ? `
DOCUMENT-SPECIFIC FOCUS:
${typeConfig.aiContext.specificInstructions}

Key provisions to include:
${typeConfig.aiContext.keyProvisions.map(p => `- ${p}`).join("\n")}
` : ""}

Generate the complete ${documentType} document now. Output ONLY the HTML document content with no introductory text, explanations, or closing remarks.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    let generatedContent = response.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated from OpenAI");
    }

    // Clean up any meta-commentary that might have slipped through
    generatedContent = cleanGeneratedContent(generatedContent);

    return generatedContent;
  } catch (error) {
    console.error("Error generating document:", error);
    throw new Error("Failed to generate document. Please try again.");
  }
}

// Remove any meta-commentary from generated content
function cleanGeneratedContent(content: string): string {
  // Remove common meta-commentary patterns
  const patternsToRemove = [
    /^[\s\S]*?(?=<h1|<H1|<!DOCTYPE|<html)/i, // Remove anything before the first HTML tag
    /This (?:HTML )?document (?:represents|is|contains)[\s\S]*?(?=<h1|<h2|<p)/gi,
    /Please (?:ensure|note|fill in|replace)[\s\S]*?(?=<h1|<h2|<p|$)/gi,
    /\[?(?:Note|Important|Instructions?)\]?:[\s\S]*?(?=<h1|<h2|<p|$)/gi,
    /---+\s*(?:End of document|Document ends)[\s\S]*$/gi,
    /```html?\s*/gi,
    /```\s*$/gi,
  ];

  let cleaned = content;
  for (const pattern of patternsToRemove) {
    cleaned = cleaned.replace(pattern, "");
  }

  return cleaned.trim();
}

export async function generateDocumentStream(
  params: DocumentGenerationParams,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const { documentType, jurisdiction, parties, terms, additionalInstructions } =
    params;

  const typeId = getDocumentTypeId(documentType);
  const typeConfig = documentTypeConfigs[typeId];

  const systemPrompt = `You are an expert legal document generator specializing in all jurisdictions.

CRITICAL INSTRUCTIONS:
1. Generate ONLY the legal document content in clean HTML format
2. DO NOT include any meta-commentary, explanations, or instructions
3. DO NOT write things like "This document represents..." or "Please fill in..."
4. DO NOT include placeholder instructions or notes to the user
5. Use the actual party names and details provided - do not use generic placeholders when real names are given
6. Generate a complete, ready-to-use legal document

Format requirements:
- Use <h1> for main title
- Use <h2> for major sections
- Use <h3> for subsections
- Use <p> for body text
- Use <strong> for defined terms
- Use <ul> or <ol> for lists

Start the document directly with the HTML content. No introductory text.`;

  const userPrompt = `Generate a ${documentType} for ${jurisdiction || "Nigeria"}.

PARTY INFORMATION:
- ${typeConfig?.parties.party1.label || "First Party"}: ${parties?.party1 || "Party A"}
- ${typeConfig?.parties.party2.label || "Second Party"}: ${parties?.party2 || "Party B"}

${terms ? `TERMS:\n${Object.entries(terms).map(([key, value]) => `- ${key}: ${value}`).join("\n")}` : ""}

${additionalInstructions ? `DETAILS:\n${additionalInstructions}` : ""}

${typeConfig ? `
FOCUS AREAS:
${typeConfig.aiContext.keyProvisions.map(p => `- ${p}`).join("\n")}
${typeConfig.aiContext.specificInstructions}
` : ""}

Output ONLY the HTML document. No explanations before or after.`;

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error("Error generating document stream:", error);
    throw new Error("Failed to generate document. Please try again.");
  }
}
