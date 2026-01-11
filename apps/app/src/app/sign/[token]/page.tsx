"use client";

import { useState, useEffect, useRef, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  FileText,
  PenTool,
  AlertCircle,
  Check,
  Eraser,
  Type,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface SignatureData {
  signature: {
    id: string;
    signerName: string;
    signerEmail: string;
    signerRole: string | null;
    status: string;
  };
  document: {
    id: string;
    title: string;
    content: string;
  };
}

export default function SignPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [data, setData] = useState<SignatureData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureType, setSignatureType] = useState<"draw" | "type">("draw");
  const [typedName, setTypedName] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [token]);

  useEffect(() => {
    if (data) {
      setTypedName(data.signature.signerName);
    }
  }, [data]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/sign/${token}`);
      const result = await response.json();

      if (response.ok) {
        setData(result);
      } else if (result.alreadySigned) {
        setAlreadySigned(true);
      } else if (response.status === 410) {
        setError("This signature request has expired.");
      } else if (response.status === 404) {
        setError("Signature request not found.");
      } else {
        setError(result.error || "Failed to load document.");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setError("Failed to load document.");
    } finally {
      setLoading(false);
    }
  };

  // Canvas drawing functions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing style
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [data, signatureType]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getSignatureData = (): string | null => {
    if (signatureType === "type") {
      if (!typedName.trim()) return null;
      // Create a canvas with the typed name
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000";
      ctx.font = "italic 32px 'Brush Script MT', cursive";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

      return canvas.toDataURL("image/png");
    }

    const canvas = canvasRef.current;
    if (!canvas || !hasSignature) return null;
    return canvas.toDataURL("image/png");
  };

  const handleSubmit = async () => {
    const signatureData = getSignatureData();

    if (!signatureData) {
      toast.error(
        signatureType === "draw"
          ? "Please draw your signature"
          : "Please type your name"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/sign/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureData,
          signatureType: signatureType === "draw" ? "DRAW" : "TYPE",
        }),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success("Document signed successfully!");
      } else {
        const result = await response.json();
        toast.error(result.error || "Failed to submit signature");
      }
    } catch (error) {
      console.error("Error submitting signature:", error);
      toast.error("Failed to submit signature");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Unable to Sign Document</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (alreadySigned) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>Already Signed</CardTitle>
            <CardDescription>
              This document has already been signed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>Signature Complete</CardTitle>
            <CardDescription>
              Thank you! Your signature has been recorded successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              You can safely close this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PenTool className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">Sign Document</h1>
                <p className="text-xs text-muted-foreground">
                  {data.document.title}
                </p>
              </div>
            </div>
            <Badge variant="secondary">
              {data.signature.signerRole || "Signer"}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Signer Info */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Signing as</p>
                <p className="font-medium">{data.signature.signerName}</p>
                <p className="text-sm text-muted-foreground">
                  {data.signature.signerEmail}
                </p>
              </div>
              <Badge
                variant={
                  data.signature.status === "VIEWED" ? "secondary" : "outline"
                }
              >
                {data.signature.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Document Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document to Sign
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm dark:prose-invert max-w-none max-h-[400px] overflow-y-auto p-4 border rounded-lg bg-muted/30"
              dangerouslySetInnerHTML={{ __html: data.document.content }}
            />
          </CardContent>
        </Card>

        {/* Signature Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Your Signature
            </CardTitle>
            <CardDescription>
              Draw or type your signature below to sign this document
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs
              value={signatureType}
              onValueChange={(v) => setSignatureType(v as "draw" | "type")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="draw" className="gap-2">
                  <PenTool className="h-4 w-4" />
                  Draw
                </TabsTrigger>
                <TabsTrigger value="type" className="gap-2">
                  <Type className="h-4 w-4" />
                  Type
                </TabsTrigger>
              </TabsList>

              <TabsContent value="draw" className="space-y-4">
                <div className="border rounded-lg bg-white relative">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-[150px] cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-muted-foreground text-sm">
                        Draw your signature here
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCanvas}
                  disabled={!hasSignature}
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </TabsContent>

              <TabsContent value="type" className="space-y-4">
                <Input
                  placeholder="Type your full name"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="text-2xl h-14 font-serif italic text-center"
                />
                {typedName && (
                  <div className="p-4 border rounded-lg bg-white text-center">
                    <p
                      className="text-3xl font-serif italic"
                      style={{ fontFamily: "'Brush Script MT', cursive" }}
                    >
                      {typedName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Preview
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-xs text-muted-foreground max-w-md">
                By signing, I agree that my electronic signature is legally
                binding and has the same legal effect as a handwritten signature.
              </p>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  (signatureType === "draw" && !hasSignature) ||
                  (signatureType === "type" && !typedName.trim())
                }
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Sign Document
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
