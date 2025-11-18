"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@largence/lib/utils"
import { Button } from "@largence/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@largence/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@largence/components/ui/popover"

export const countries = [
  { value: "nigeria", label: "Nigeria", flag: "🇳🇬" },
  { value: "ghana", label: "Ghana", flag: "🇬🇭" },
  { value: "kenya", label: "Kenya", flag: "🇰🇪" },
  { value: "south-africa", label: "South Africa", flag: "🇿🇦" },
  { value: "egypt", label: "Egypt", flag: "🇪🇬" },
  { value: "tanzania", label: "Tanzania", flag: "🇹🇿" },
  { value: "united-kingdom", label: "United Kingdom", flag: "🇬🇧" },
  { value: "uganda", label: "Uganda", flag: "🇺🇬" },
  { value: "rwanda", label: "Rwanda", flag: "🇷🇼" },
  { value: "ethiopia", label: "Ethiopia", flag: "🇪🇹" },
  { value: "cote-divoire", label: "Côte d'Ivoire", flag: "🇨🇮" },
]

interface CountryComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyText?: string
}

export function CountryCombobox({
  value,
  onValueChange,
  placeholder = "Select country...",
  emptyText = "No country found.",
}: CountryComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedCountry = countries.find((country) => country.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-10 rounded-sm justify-between"
        >
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span>{selectedCountry.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={country.value}
                  keywords={[country.label]}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === country.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="text-lg mr-2">{country.flag}</span>
                  <span>{country.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
