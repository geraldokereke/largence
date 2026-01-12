import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@largence/lib/prisma";
import { createAuditLog } from "@/lib/audit";

interface DocuSignTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface DocuSignEnvelopeResponse {
  envelopeId: string;
  uri: string;
  statusDateTime: string;
  status: string;
}

// DocuSign environment URLs
const DOCUSIGN_URLS = {
  demo: {
    auth: "https://account-d.docusign.com",
    api: "https://demo.docusign.net/restapi",
  },
  production: {
    auth: "https://account.docusign.com",
    api: "https://www.docusign.net/restapi",
  },
};

function getDocuSignUrls() {
  const env = (process.env.DOCUSIGN_ENVIRONMENT || "demo") as "demo" | "production";
  return DOCUSIGN_URLS[env];
}

async function refreshDocuSignToken(integration: {
  id: string;
  refreshToken: string | null;
}): Promise<string | null> {
  if (!integration.refreshToken) {
    return null;
  }

  const urls = getDocuSignUrls();

  try {
    const credentials = Buffer.from(
      `${process.env.DOCUSIGN_CLIENT_ID}:${process.env.DOCUSIGN_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(`${urls.auth}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: integration.refreshToken,
      }),
    });

    if (!response.ok) {
      console.error("Failed to refresh DocuSign token:", await response.text());
      return null;
    }

    const data: DocuSignTokenResponse = await response.json();

    // Update the stored tokens
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
    });

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing DocuSign token:", error);
    return null;
  }
}

async function getValidAccessToken(integration: {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
}): Promise<string | null> {
  // Check if token is expired or about to expire (5 min buffer)
  const isExpired =
    integration.tokenExpiresAt &&
    new Date(integration.tokenExpiresAt).getTime() < Date.now() + 5 * 60 * 1000;

  if (isExpired) {
    return refreshDocuSignToken(integration);
  }

  return integration.accessToken;
}

// Send document for e-signature
export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 400 }
      );
    }

    const { documentId, signers, subject, message } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID required" },
        { status: 400 }
      );
    }

    if (!signers || !Array.isArray(signers) || signers.length === 0) {
      return NextResponse.json(
        { error: "At least one signer is required" },
        { status: 400 }
      );
    }

    // Validate signers
    for (const signer of signers) {
      if (!signer.email || !signer.name) {
        return NextResponse.json(
          { error: "Each signer must have an email and name" },
          { status: 400 }
        );
      }
    }

    // Get DocuSign integration
    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "DOCUSIGN",
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json(
        { error: "DocuSign not connected" },
        { status: 400 }
      );
    }

    const accessToken = await getValidAccessToken(integration);
    if (!accessToken) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { status: "ERROR" },
      });
      return NextResponse.json(
        { error: "DocuSign authorization expired. Please reconnect." },
        { status: 401 }
      );
    }

    // Get account ID from settings
    const settings = integration.settings as { accountId?: string; baseUri?: string } | null;
    const accountId = settings?.accountId;
    const baseUri = settings?.baseUri;

    if (!accountId || !baseUri) {
      return NextResponse.json(
        { error: "DocuSign account not properly configured. Please reconnect." },
        { status: 400 }
      );
    }

    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: documentId, organizationId: orgId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Prepare document content as base64
    // For now, we'll send as a text document
    const documentContent = document.content || "";
    const documentBase64 = Buffer.from(documentContent).toString("base64");
    const fileName = `${document.title.replace(/[/\\?%*:|"<>]/g, "-")}.txt`;

    // Build DocuSign envelope request
    // Create signer objects with signature tabs
    const docuSignSigners = signers.map((signer: { email: string; name: string }, index: number) => ({
      email: signer.email,
      name: signer.name,
      recipientId: String(index + 1),
      routingOrder: String(index + 1),
      tabs: {
        signHereTabs: [
          {
            documentId: "1",
            pageNumber: "1",
            xPosition: "100",
            yPosition: "700",
          },
        ],
        dateSignedTabs: [
          {
            documentId: "1",
            pageNumber: "1",
            xPosition: "300",
            yPosition: "700",
          },
        ],
      },
    }));

    const envelopeDefinition = {
      emailSubject: subject || `Please sign: ${document.title}`,
      emailBlurb: message || `Please review and sign this document: ${document.title}`,
      documents: [
        {
          documentId: "1",
          name: fileName,
          fileExtension: "txt",
          documentBase64,
        },
      ],
      recipients: {
        signers: docuSignSigners,
      },
      status: "sent", // "sent" to send immediately, "created" to save as draft
    };

    // Create envelope in DocuSign
    const envelopeResponse = await fetch(
      `${baseUri}/restapi/v2.1/accounts/${accountId}/envelopes`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(envelopeDefinition),
      }
    );

    if (!envelopeResponse.ok) {
      const errorData = await envelopeResponse.json();
      console.error("DocuSign envelope error:", errorData);
      return NextResponse.json(
        { error: "Failed to create signature request" },
        { status: 500 }
      );
    }

    const envelope: DocuSignEnvelopeResponse = await envelopeResponse.json();

    // Update integration sync stats
    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        syncedItemsCount: { increment: 1 },
      },
    });

    // Create audit log
    await createAuditLog({
      action: "DOCUMENT_SHARED",
      actionLabel: "Sent document for e-signature via DocuSign",
      entityType: "Document",
      entityId: document.id,
      entityName: document.title,
      userId,
      organizationId: orgId,
      metadata: {
        envelopeId: envelope.envelopeId,
        signers: signers.map((s: { email: string; name: string }) => ({ email: s.email, name: s.name })),
        status: envelope.status,
        provider: "DocuSign",
      },
    });

    return NextResponse.json({
      success: true,
      envelope: {
        id: envelope.envelopeId,
        status: envelope.status,
        sentAt: envelope.statusDateTime,
      },
      message: `Signature request sent to ${signers.length} recipient(s)`,
    });
  } catch (error) {
    console.error("DocuSign sync error:", error);
    return NextResponse.json(
      { error: "Failed to send signature request" },
      { status: 500 }
    );
  }
}

// Get envelope status
export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!orgId) {
      return NextResponse.json(
        { error: "Organization required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const envelopeId = searchParams.get("envelopeId");

    // Get DocuSign integration
    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: orgId,
          provider: "DOCUSIGN",
        },
      },
    });

    if (!integration || integration.status !== "CONNECTED") {
      return NextResponse.json(
        { error: "DocuSign not connected" },
        { status: 400 }
      );
    }

    const accessToken = await getValidAccessToken(integration);
    if (!accessToken) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { status: "ERROR" },
      });
      return NextResponse.json(
        { error: "DocuSign authorization expired. Please reconnect." },
        { status: 401 }
      );
    }

    const settings = integration.settings as { accountId?: string; baseUri?: string } | null;
    const accountId = settings?.accountId;
    const baseUri = settings?.baseUri;

    if (!accountId || !baseUri) {
      return NextResponse.json(
        { error: "DocuSign account not properly configured" },
        { status: 400 }
      );
    }

    if (envelopeId) {
      // Get specific envelope status
      const statusResponse = await fetch(
        `${baseUri}/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!statusResponse.ok) {
        return NextResponse.json(
          { error: "Failed to get envelope status" },
          { status: 500 }
        );
      }

      const envelopeData = await statusResponse.json();
      return NextResponse.json({ envelope: envelopeData });
    } else {
      // List recent envelopes
      const listResponse = await fetch(
        `${baseUri}/restapi/v2.1/accounts/${accountId}/envelopes?from_date=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!listResponse.ok) {
        return NextResponse.json(
          { error: "Failed to list envelopes" },
          { status: 500 }
        );
      }

      const envelopesData = await listResponse.json();
      return NextResponse.json({
        envelopes: envelopesData.envelopes || [],
        totalCount: envelopesData.totalSetSize,
      });
    }
  } catch (error) {
    console.error("DocuSign status error:", error);
    return NextResponse.json(
      { error: "Failed to get DocuSign status" },
      { status: 500 }
    );
  }
}
