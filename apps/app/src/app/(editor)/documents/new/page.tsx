"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function NewDocumentPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(true);

  useEffect(() => {
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
          }),
        });

        if (response.ok) {
          const data = await response.json();
          router.replace(`/documents/${data.document.id}`);
        } else {
          toast.error("Failed to create document", {
            description: "Please try again.",
          });
          router.push("/documents");
        }
      } catch (error) {
        console.error("Error creating document:", error);
        toast.error("Error creating document", {
          description: "An unexpected error occurred.",
        });
        router.push("/documents");
      } finally {
        setCreating(false);
      }
    };

    createDocument();
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Creating your document...</p>
      </div>
    </div>
  );
}
