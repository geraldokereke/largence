"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@largence/components/ui/button";
import { Input } from "@largence/components/ui/input";
import { Spinner } from "@largence/components/ui/spinner";
import { Sparkles, X, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function AccessCodeBanner() {
  const [code, setCode] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{
    hasAccessCode: boolean;
    remaining?: number;
    limit?: number;
  }>({
    queryKey: ["access-code-status"],
    queryFn: async () => {
      const res = await fetch("/api/billing/access-code");
      if (!res.ok) throw new Error("Failed to check access code");
      return res.json();
    },
  });

  const redeemMutation = useMutation({
    mutationFn: async (accessCode: string) => {
      const res = await fetch("/api/billing/access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: accessCode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to redeem code");
      return json;
    },
    onSuccess: (result) => {
      toast.success(result.message);
      setCode("");
      queryClient.invalidateQueries({ queryKey: ["access-code-status"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (isLoading || dismissed) return null;

  // Already redeemed — don't show the banner
  if (data?.hasAccessCode) return null;

  return (
    <div className="relative flex items-center gap-3 px-4 py-2.5 bg-primary/5 border-b border-primary/20">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="p-2 bg-primary/10 rounded-sm shrink-0">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Have an access code?</p>
        <p className="text-xs text-muted-foreground">
          Redeem a code to unlock full Pro features with your trial.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Input
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="w-44 font-mono text-xs tracking-wider"
          onKeyDown={(e) => {
            if (e.key === "Enter" && code.trim()) {
              redeemMutation.mutate(code.trim());
            }
          }}
        />
        <Button
          size="sm"
          onClick={() => redeemMutation.mutate(code.trim())}
          disabled={!code.trim() || redeemMutation.isPending}
        >
          {redeemMutation.isPending ? (
            <Spinner size="sm" />
          ) : (
            "Redeem"
          )}
        </Button>
      </div>
    </div>
  );
}
