import OpenAI from "openai";
import { documentTypeConfigs } from "./document-types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

// ─── Legal Research ──────────────────────────────────────────────────────────

export interface LegalResearchParams {
  query: string;
  jurisdiction?: string;
  docTypes?: string[];
  legalTopics?: string[];
}

export interface LegalResearchResult {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  jurisdiction: string;
  date?: string;
  snippet: string;
  type: "case" | "statute" | "regulation" | "article" | "treaty" | "other";
  citation?: string;
}

export interface LegalResearchResponse {
  query: string;
  summary: string;
  results: LegalResearchResult[];
  searchedSources: string[];
}

const JURISDICTION_SOURCES: Record<string, { label: string; sources: string[] }> = {
  all: {
    label: "Global",
    sources: [
      "courtlistener.com", "scholar.google.com", "case.law", "govinfo.gov",
      "oyez.org", "justia.com", "legislation.gov.uk", "bailii.org",
      "eur-lex.europa.eu", "hudoc.echr.coe.int", "worldlii.org",
      "icj-cij.org", "wto.org",
    ],
  },
  us: {
    label: "United States",
    sources: [
      "courtlistener.com", "scholar.google.com", "case.law",
      "govinfo.gov", "oyez.org", "justia.com", "pacer.uscourts.gov",
      "courtlistener.com/recap", "public.law",
    ],
  },
  uk: {
    label: "United Kingdom",
    sources: [
      "legislation.gov.uk", "supremecourt.uk", "bailii.org",
      "westlaw.co.uk", "public.law",
    ],
  },
  eu: {
    label: "European Union",
    sources: [
      "eur-lex.europa.eu", "hudoc.echr.coe.int", "n-lex.europa.eu",
      "legifrance.gouv.fr", "beck-online.beck.de",
    ],
  },
  canada: {
    label: "Canada",
    sources: ["canlii.org", "lexisnexis.ca", "commonlii.org"],
  },
  australia: {
    label: "Australia",
    sources: ["austlii.edu.au", "jade.io", "nzlii.org", "commonlii.org"],
  },
  africa: {
    label: "Africa",
    sources: [
      "africanlii.org", "nigerialii.org", "saflii.org",
      "kenyalaw.org", "vlex.com.ng",
    ],
  },
  asia: {
    label: "Asia",
    sources: [
      "asianlii.org", "japaneselawtranslation.go.jp",
      "lawnet.sg", "advocatekhoj.com",
    ],
  },
  latam: {
    label: "Latin America",
    sources: ["vlex.com.br", "microjuris.com", "vlex.com.co"],
  },
  international: {
    label: "International",
    sources: [
      "icj-cij.org", "hudoc.echr.coe.int", "wto.org", "icc-cpi.int",
      "pca-cpa.org", "documents.un.org", "treaties.un.org",
      "worldlii.org", "commonlii.org",
    ],
  },
  academic: {
    label: "Academic & Journals",
    sources: [
      "ssrn.com", "lawarxiv.info", "philarchive.org",
      "doaj.org", "core.ac.uk",
    ],
  },
};

export async function performLegalResearch(
  params: LegalResearchParams,
): Promise<LegalResearchResponse> {
  const { query, jurisdiction = "all", docTypes = [], legalTopics = [] } = params;

  const jurisdictionData = JURISDICTION_SOURCES[jurisdiction] ?? JURISDICTION_SOURCES.all;
  const sources = jurisdictionData.sources;

  const filtersText = [
    docTypes.length ? `Document types: ${docTypes.join(", ")}` : "",
    legalTopics.length ? `Legal topics: ${legalTopics.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const systemPrompt = `You are Largence, an expert AI legal research assistant used by professional lawyers and legal practitioners.

Your role is to conduct thorough legal research and return well-structured, accurate results from authoritative legal databases and sources.

When responding, always:
1. Provide a concise executive summary of the research findings
2. List specific cases, statutes, regulations, or articles relevant to the query
3. Include the source database, jurisdiction, and citation where available
4. Format your response as a valid JSON object matching this exact structure:

{
  "summary": "A 2-4 sentence executive summary of the key findings",
  "results": [
    {
      "id": "unique-id",
      "title": "Full case/statute/article title",
      "source": "Source database name (e.g., CourtListener, EUR-Lex)",
      "sourceUrl": "Full URL to the source if known",
      "jurisdiction": "Jurisdiction (e.g., US Federal, UK Supreme Court, EU)",
      "date": "Year or date if known",
      "snippet": "2-3 sentence description of the relevant holding, provision, or content",
      "type": "case|statute|regulation|article|treaty|other",
      "citation": "Official citation string if applicable"
    }
  ],
  "searchedSources": ["list", "of", "source", "domains", "searched"]
}

Focus your research on these authoritative legal databases: ${sources.join(", ")}.
Always populate sourceUrl with the real URL of the document on the listed database where possible.
Aim to return 6–10 highly relevant results.`;

  const userPrompt = `Research query: ${query}
Jurisdiction: ${jurisdictionData.label}
${filtersText}

Search the legal databases and return comprehensive results in the specified JSON format.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const rawText = completion.choices[0]?.message?.content ?? "";
  const jsonText = rawText;

  let parsed: { summary: string; results: LegalResearchResult[]; searchedSources: string[] };
  try {
    parsed = JSON.parse(jsonText.trim());
  } catch {
    // Fallback: return summary as plain text with no structured results
    parsed = {
      summary: rawText.slice(0, 800),
      results: [],
      searchedSources: sources,
    };
  }

  return {
    query,
    summary: parsed.summary ?? "",
    results: (parsed.results ?? []).map((r, i) => ({ ...r, id: r.id ?? `result-${i}` })),
    searchedSources: parsed.searchedSources ?? sources,
  };
}

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
