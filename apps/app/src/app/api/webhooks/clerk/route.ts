import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { sendTemplatedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  // Get the webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Handle the webhook event
  const eventType = event.type;

  try {
    switch (eventType) {
      case "user.created": {
        const { email_addresses, first_name, last_name } = event.data;
        const primaryEmail = email_addresses?.find(
          (e) => e.id === event.data.primary_email_address_id
        );

        if (primaryEmail?.email_address) {
          const name = [first_name, last_name].filter(Boolean).join(" ") || "there";
          
          await sendTemplatedEmail("welcome", primaryEmail.email_address, {
            name: name,
            email: primaryEmail.email_address,
          });

          console.log(`Welcome email sent to ${primaryEmail.email_address}`);
        }
        break;
      }

      case "user.updated": {
        // Handle user updates if needed
        break;
      }

      case "user.deleted": {
        // Handle user deletion if needed
        break;
      }

      case "organization.created": {
        // Could send a team welcome email
        break;
      }

      case "organizationMembership.created": {
        // New team member added
        const { organization, public_user_data } = event.data;
        
        if (public_user_data?.identifier) {
          const orgName = (organization as { name?: string })?.name || "your new team";
          
          await sendTemplatedEmail("teamInvite", public_user_data.identifier, {
            organizationName: orgName,
            inviterName: "Team Admin",
            inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/workspace`,
            role: "member",
          });

          console.log(`Team invite email sent to ${public_user_data.identifier}`);
        }
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
