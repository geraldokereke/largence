"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@largence/lib/utils";
import { Button } from "@largence/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@largence/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@largence/components/ui/popover";

export const countries = [
  // African countries (prioritized)
  { value: "nigeria", label: "Nigeria", flag: "🇳🇬" },
  { value: "ghana", label: "Ghana", flag: "🇬🇭" },
  { value: "kenya", label: "Kenya", flag: "🇰🇪" },
  { value: "south-africa", label: "South Africa", flag: "🇿🇦" },
  { value: "egypt", label: "Egypt", flag: "🇪🇬" },
  { value: "tanzania", label: "Tanzania", flag: "🇹🇿" },
  { value: "uganda", label: "Uganda", flag: "🇺🇬" },
  { value: "rwanda", label: "Rwanda", flag: "🇷🇼" },
  { value: "ethiopia", label: "Ethiopia", flag: "🇪🇹" },
  { value: "cote-divoire", label: "Côte d'Ivoire", flag: "🇨🇮" },
  { value: "senegal", label: "Senegal", flag: "🇸🇳" },
  { value: "cameroon", label: "Cameroon", flag: "🇨🇲" },
  { value: "morocco", label: "Morocco", flag: "🇲🇦" },
  { value: "zimbabwe", label: "Zimbabwe", flag: "🇿🇼" },
  { value: "botswana", label: "Botswana", flag: "🇧🇼" },
  { value: "namibia", label: "Namibia", flag: "🇳🇦" },
  // Other regions
  { value: "united-kingdom", label: "United Kingdom", flag: "🇬🇧" },
  { value: "united-states", label: "United States", flag: "🇺🇸" },
  { value: "canada", label: "Canada", flag: "🇨🇦" },
  { value: "germany", label: "Germany", flag: "🇩🇪" },
  { value: "france", label: "France", flag: "🇫🇷" },
  { value: "netherlands", label: "Netherlands", flag: "🇳🇱" },
  { value: "uae", label: "United Arab Emirates", flag: "🇦🇪" },
  { value: "india", label: "India", flag: "🇮🇳" },
  { value: "singapore", label: "Singapore", flag: "🇸🇬" },
  { value: "australia", label: "Australia", flag: "🇦🇺" },
];

interface CountryComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
}

export function CountryCombobox({
  value,
  onValueChange,
  placeholder = "Select country...",
  emptyText = "No country found.",
}: CountryComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCountry = countries.find((country) => country.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-9 rounded-sm justify-between text-sm font-normal"
        >
          {selectedCountry ? (
            <span className="flex items-center gap-1.5">
              <span className="text-base">{selectedCountry.flag}</span>
              <span>{selectedCountry.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start" side="bottom" sideOffset={4}>
        <Command>
          <CommandInput placeholder="Search country..." className="h-9" />
          <CommandList className="max-h-[250px] overflow-y-auto">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.value}
                  keywords={[country.label]}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="text-sm"
                >
                  <Check
                    className={cn(
                      "mr-1.5 h-3.5 w-3.5",
                      value === country.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="text-base mr-1.5">{country.flag}</span>
                  <span>{country.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
