"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function NewDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creating, setCreating] = useState(true);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const matterId = searchParams.get("matterId");

    const createDocument = async () => {
      try {
        const response = await fetch("/api/documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Untitled Document",
            content: "",
            documentType: "Other",
            jurisdiction: "General",
            status: "DRAFT",
            ...(matterId ? { matterId } : {}),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Return to matter after creation if we came from one
          const redirect = matterId
            ? `/documents/${data.document.id}?returnTo=/matters/${matterId}`
            : `/documents/${data.document.id}`;
          router.replace(redirect);
        } else {
          toast.error("Failed to create document", {
            description: "Please try again.",
          });
          router.push(matterId ? `/matters/${matterId}` : "/documents");
        }
      } catch (error) {
        console.error("Error creating document:", error);
        toast.error("Error creating document", {
          description: "An unexpected error occurred.",
        });
        router.push(matterId ? `/matters/${matterId}` : "/documents");
      } finally {
        setCreating(false);
      }
    };

    createDocument();
  }, [router, searchParams]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Creating your document...</p>
      </div>
    </div>
  );
}
