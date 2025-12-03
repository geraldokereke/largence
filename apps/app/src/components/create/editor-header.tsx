"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@largence/components/ui/button";
import { Clock, Download, Share2, Save, X } from "lucide-react";

interface EditorHeaderProps {
  documentName: string;
  documentType: string;
  jurisdiction: string;
}

export function EditorHeader({
  documentName,
  documentType,
  jurisdiction,
}: EditorHeaderProps) {
  const router = useRouter();

  return (
    <div className="border-b bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-sm"
            onClick={() => router.push("/")}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Largence Logo"
              width={24}
              height={24}
              className="shrink-0"
            />
            <div>
              <h1 className="text-base font-semibold font-heading">
                {documentName || "Untitled Document"}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Last saved 2 minutes ago</span>
                </div>
                <span>•</span>
                <span>{documentType}</span>
                <span>•</span>
                <span>{jurisdiction}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 rounded-sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="h-9 rounded-sm">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button className="h-9 rounded-sm">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
