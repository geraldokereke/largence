import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { diffWords, diffLines } from "diff";
import prisma from "@largence/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, orgId } = await auth();
    const { id: documentId } = await params;
    const { searchParams } = new URL(request.url);
    const versionId1 = searchParams.get("v1");
    const versionId2 = searchParams.get("v2");
    const mode = searchParams.get("mode") || "words"; // words or lines

    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify document ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        organizationId: orgId,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Get the two versions to compare
    let content1: string;
    let content2: string;
    let version1Label: string;
    let version2Label: string;

    if (versionId1 && versionId2) {
      // Compare two specific versions
      const [v1, v2] = await Promise.all([
        prisma.documentVersion.findFirst({
          where: { id: versionId1, documentId },
        }),
        prisma.documentVersion.findFirst({
          where: { id: versionId2, documentId },
        }),
      ]);

      if (!v1 || !v2) {
        return NextResponse.json(
          { error: "Version not found" },
          { status: 404 }
        );
      }

      content1 = v1.content;
      content2 = v2.content;
      version1Label = `Version ${v1.version}`;
      version2Label = `Version ${v2.version}`;
    } else if (versionId1) {
      // Compare specific version with current
      const version = await prisma.documentVersion.findFirst({
        where: { id: versionId1, documentId },
      });

      if (!version) {
        return NextResponse.json(
          { error: "Version not found" },
          { status: 404 }
        );
      }

      content1 = version.content;
      content2 = document.content;
      version1Label = `Version ${version.version}`;
      version2Label = "Current";
    } else {
      // Compare latest version with current
      const latestVersion = await prisma.documentVersion.findFirst({
        where: { documentId },
        orderBy: { version: "desc" },
      });

      if (!latestVersion) {
        return NextResponse.json(
          { error: "No versions to compare" },
          { status: 400 }
        );
      }

      content1 = latestVersion.content;
      content2 = document.content;
      version1Label = `Version ${latestVersion.version}`;
      version2Label = "Current";
    }

    // Strip HTML for plain text comparison
    const text1 = stripHtml(content1);
    const text2 = stripHtml(content2);

    // Generate diff
    const diff = mode === "lines" 
      ? diffLines(text1, text2)
      : diffWords(text1, text2);

    // Calculate statistics
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    diff.forEach((part) => {
      const count = part.count || part.value.split(/\s+/).filter(Boolean).length;
      if (part.added) {
        additions += count;
      } else if (part.removed) {
        deletions += count;
      } else {
        unchanged += count;
      }
    });

    // Generate HTML diff for rendering
    const htmlDiff = generateHtmlDiff(diff);

    return NextResponse.json({
      diff,
      htmlDiff,
      statistics: {
        additions,
        deletions,
        unchanged,
        total: additions + deletions + unchanged,
      },
      versions: {
        from: version1Label,
        to: version2Label,
      },
    });
  } catch (error) {
    console.error("Error generating diff:", error);
    return NextResponse.json(
      { error: "Failed to generate comparison" },
      { status: 500 }
    );
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
  count?: number;
}

function generateHtmlDiff(diff: DiffPart[]): string {
  return diff
    .map((part) => {
      const escapedValue = part.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");

      if (part.added) {
        return `<ins class="diff-added">${escapedValue}</ins>`;
      }
      if (part.removed) {
        return `<del class="diff-removed">${escapedValue}</del>`;
      }
      return `<span class="diff-unchanged">${escapedValue}</span>`;
    })
    .join("");
}
