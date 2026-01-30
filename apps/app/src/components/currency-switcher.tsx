"use client";

import * as React from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { cn } from "@largence/lib/utils";
import { Button } from "@largence/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@largence/components/ui/dropdown-menu";

export type Currency = "USD" | "NGN" | "GHS" | "KES" | "ZAR";

interface CurrencyOption {
  code: Currency;
  name: string;
  symbol: string;
  country: string;
  flag: string;
  provider: "stripe" | "paystack";
}

const currencies: CurrencyOption[] = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    country: "United States",
    flag: "🇺🇸",
    provider: "stripe",
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    country: "Nigeria",
    flag: "🇳🇬",
    provider: "paystack",
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "GH₵",
    country: "Ghana",
    flag: "🇬🇭",
    provider: "paystack",
  },
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    country: "Kenya",
    flag: "🇰🇪",
    provider: "paystack",
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    country: "South Africa",
    flag: "🇿🇦",
    provider: "paystack",
  },
];

interface CurrencySwitcherProps {
  value: Currency;
  onChange: (currency: Currency) => void;
  className?: string;
  compact?: boolean;
}

export function CurrencySwitcher({
  value,
  onChange,
  className,
  compact = false,
}: CurrencySwitcherProps) {
  const selectedCurrency = currencies.find((c) => c.code === value) || currencies[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn(
            "flex items-center gap-2",
            compact ? "h-8 px-2" : "h-9 px-3",
            className
          )}
        >
          <span className="text-base">{selectedCurrency.flag}</span>
          <span className="font-medium">{selectedCurrency.code}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Select Currency
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* USD - Stripe */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          International (Stripe)
        </DropdownMenuLabel>
        {currencies
          .filter((c) => c.provider === "stripe")
          .map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => onChange(currency.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{currency.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{currency.code}</span>
                  <span className="text-xs text-muted-foreground">
                    {currency.name}
                  </span>
                </div>
              </div>
              {value === currency.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}

        <DropdownMenuSeparator />

        {/* African currencies - Paystack */}
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Africa (Paystack)
        </DropdownMenuLabel>
        {currencies
          .filter((c) => c.provider === "paystack")
          .map((currency) => (
            <DropdownMenuItem
              key={currency.code}
              onClick={() => onChange(currency.code)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{currency.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{currency.code}</span>
                  <span className="text-xs text-muted-foreground">
                    {currency.name}
                  </span>
                </div>
              </div>
              {value === currency.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook to detect user's country and suggest appropriate currency
export function useDetectedCurrency(): Currency {
  const [detectedCurrency, setDetectedCurrency] = React.useState<Currency>("USD");

  React.useEffect(() => {
    // Try to detect from browser
    const detectCurrency = async () => {
      try {
        // First check localStorage for user preference
        const stored = localStorage.getItem("billing:currency");
        if (stored && currencies.some((c) => c.code === stored)) {
          setDetectedCurrency(stored as Currency);
          return;
        }

        // Try navigator language/locale
        const locale = navigator.language || "en-US";
        const country = locale.split("-")[1]?.toUpperCase();

        // Map country to currency
        const countryToCurrency: Record<string, Currency> = {
          NG: "NGN",
          GH: "GHS",
          KE: "KES",
          ZA: "ZAR",
        };

        if (country && countryToCurrency[country]) {
          setDetectedCurrency(countryToCurrency[country]);
          return;
        }

        // Fallback: Try IP geolocation (you might want to use a service like ipinfo.io)
        // For now, default to USD
        setDetectedCurrency("USD");
      } catch {
        setDetectedCurrency("USD");
      }
    };

    detectCurrency();
  }, []);

  return detectedCurrency;
}

// Helper to persist currency preference
export function saveCurrencyPreference(currency: Currency) {
  localStorage.setItem("billing:currency", currency);
}

// Get currency info
export function getCurrencyInfo(code: Currency): CurrencyOption | undefined {
  return currencies.find((c) => c.code === code);
}

// Format price for display
export function formatCurrencyPrice(
  amountInCents: number,
  currency: Currency
): string {
  const info = getCurrencyInfo(currency);
  if (!info) return `$${(amountInCents / 100).toFixed(2)}`;

  const amount = amountInCents / 100;

  // For African currencies, don't show decimals
  if (info.provider === "paystack") {
    return `${info.symbol}${Math.round(amount).toLocaleString()}`;
  }

  return `${info.symbol}${amount.toFixed(2)}`;
}

export { currencies };
