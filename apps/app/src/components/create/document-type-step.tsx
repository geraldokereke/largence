"use client";

import { Check } from "lucide-react";
import { Label } from "@largence/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentTypeStepProps {
  documentTypes: Array<{
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  selectedType: string;
  onSelect: (typeId: string) => void;
}

export function DocumentTypeStep({
  documentTypes,
  selectedType,
  onSelect,
}: DocumentTypeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2 font-title">
          Choose Document Type
        </h2>
        <p className="text-muted-foreground">
          Select the type of legal document you want to generate
        </p>
      </div>

      <ScrollArea className="h-[450px] pr-4">
        <div className="grid grid-cols-2 gap-3">
          {documentTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => onSelect(type.id)}
                className={`relative p-4 rounded-sm border-2 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  </div>
                )}
                <Icon
                  className={`h-6 w-6 mb-2 ${
                    isSelected ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <p className="font-medium text-sm">{type.name}</p>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
