import OpenAI from "openai";

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

export async function generateDocument(
  params: DocumentGenerationParams,
): Promise<string> {
  const { documentType, jurisdiction, parties, terms, additionalInstructions } =
    params;

  const systemPrompt = `You are an expert legal document generator specializing in African jurisdictions. 
Your task is to generate professional, legally sound documents that comply with local regulations.
Format the output in clean HTML with proper headings, sections, and paragraphs.
Use <h1> for the document title, <h2> for sections, <h3> for subsections, and <p> for paragraphs.
Include standard legal clauses appropriate for the document type and jurisdiction.`;

  const userPrompt = `Generate a comprehensive ${params.documentType} for ${params.jurisdiction} with the following requirements:

PARTIES INVOLVED:
- First Party: ${params.parties?.party1 || "Party A"}
- Second Party: ${params.parties?.party2 || "Party B"}

${params.terms ? `TERMS AND CONDITIONS:\n${JSON.stringify(params.terms, null, 2)}\n` : ""}

${params.additionalInstructions ? `SPECIFIC REQUIREMENTS:\n${params.additionalInstructions}\n` : ""}

Please generate a complete, legally binding document that:
1. Includes a clear title and preamble
2. Defines all parties with their full details
3. States the purpose and scope of the agreement
4. Includes all standard clauses for this document type in ${params.jurisdiction}
5. Has properly numbered sections and subsections
6. Includes payment/compensation terms if applicable
7. Covers confidentiality, termination, and dispute resolution
8. Has signature blocks for all parties
9. Uses proper legal terminology and formatting
10. Complies with ${params.jurisdiction} legal requirements

Generate the complete document now in clean HTML format.`;

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

    const generatedContent = response.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated from OpenAI");
    }

    return generatedContent;
  } catch (error) {
    console.error("Error generating document:", error);
    throw new Error("Failed to generate document. Please try again.");
  }
}

export async function generateDocumentStream(
  params: DocumentGenerationParams,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const { documentType, jurisdiction, parties, terms, additionalInstructions } =
    params;

  const systemPrompt = `You are an expert legal document generator specializing in creating comprehensive, legally sound documents for African jurisdictions and international business.

Your documents must:
- Be professionally formatted with clear HTML structure (use <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <em> tags)
- Include all standard clauses and provisions for the document type
- Be jurisdiction-specific and compliant with local laws
- Use formal legal language appropriate for the document type
- Include proper definitions section where applicable
- Have numbered clauses and sub-clauses
- Include signature blocks for all parties
- Be comprehensive yet clear and understandable
- Include dispute resolution mechanisms
- Address termination and breach conditions
- Cover confidentiality and data protection where relevant
- Include force majeure clauses where appropriate

Format requirements:
- Use <h1> for main title
- Use <h2> for major sections
- Use <h3> for subsections
- Use <p> for body text with proper spacing
- Use <strong> for emphasis and defined terms
- Use <ul> or <ol> for lists
- Ensure proper paragraph spacing and readability

Generate a complete, ready-to-use legal document.`;

  const userPrompt = `Generate a ${documentType} document with the following details:

${jurisdiction ? `Jurisdiction: ${jurisdiction}` : ""}
${parties?.party1 ? `Party 1: ${parties.party1}` : ""}
${parties?.party2 ? `Party 2: ${parties.party2}` : ""}

${
  terms
    ? `Terms:\n${Object.entries(terms)
        .map(([key, value]) => `- ${key}: ${value}`)
        .join("\n")}`
    : ""
}

${additionalInstructions ? `Additional Instructions:\n${additionalInstructions}` : ""}

Generate a complete, professional ${documentType}.`;

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
