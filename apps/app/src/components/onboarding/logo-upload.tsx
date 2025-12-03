"use client";

import { useState, useRef } from "react";
import { Upload, X, Building2 } from "lucide-react";
import { Button } from "@largence/components/ui/button";
import { Label } from "@largence/components/ui/label";

interface LogoUploadProps {
  value: string;
  onChange: (url: string, file: File | null) => void;
}

export function LogoUpload({ value, onChange }: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange("", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label>Organization Logo (Optional)</Label>

      {value ? (
        <div className="relative w-32 h-32 rounded-sm border-2 border-border overflow-hidden group">
          <img
            src={value}
            alt="Organization logo"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative w-full h-32 rounded-sm border-2 border-dashed transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isDragging ? (
              <>
                <Upload className="h-8 w-8" />
                <p className="text-sm">Drop your logo here</p>
              </>
            ) : (
              <>
                <Building2 className="h-8 w-8" />
                <p className="text-sm">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, SVG (max 5MB)
                </p>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
