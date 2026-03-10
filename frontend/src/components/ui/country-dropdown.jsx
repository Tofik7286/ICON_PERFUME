"use client";
import React, { useCallback, useState, forwardRef, useEffect } from "react";

// shadcn components
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// utils
import { cn } from "@/lib/utils";

// assets
import { ChevronDown, CheckIcon, Globe } from "lucide-react";

// data
import { countries } from "country-data-list";

const CountryDropdownComponent = (
  {
    options = countries.all.filter(
      (country) =>
        country.emoji && country.status !== "deleted" && country.ioc !== "PRK"
    ),
    onChange,
    defaultValue,
    disabled = false,
    placeholder = "Select a country",
    slim = false,
    ...props
  },
  ref
) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(undefined);

  useEffect(() => {
    if (defaultValue) {
      const initialCountry = options.find(
        (country) => country.countryCallingCodes[0] === defaultValue
      );
      setSelectedCountry(initialCountry);
    }
  }, [defaultValue, options]);

  const handleSelect = useCallback(
    (country) => {
      setSelectedCountry(country);

      onChange?.(country.countryCallingCodes[0]);
      setOpen(false);
    },
    [onChange]
  );

  const triggerClasses = cn(
    "flex h-9 w-fit items-center justify-between whitespace-nowrap rounded-md border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        ref={ref}
        className={triggerClasses}
        disabled={disabled}
        {...props}
      >
        <div className="flex items-center flex-grow gap-2">
          {selectedCountry?.countryCallingCodes[0]}
        </div>    

        <ChevronDown size={16} className={"ms-2"} />
      </PopoverTrigger>
      <PopoverContent
        collisionPadding={10}
        side="bottom"
        style={{zIndex: 99999}}
        className="min-w-[--radix-popper-anchor-width] p-0"
      >
        <Command className="w-full max-h-[200px] sm:max-h-[270px]">
          <CommandList>
            <div className="sticky top-0 z-10 bg-popover">
              <CommandInput placeholder="Search country..." />
            </div>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options
                .filter((x) => x.name)
                .map((option, key) => (
                  <CommandItem
                    className="flex items-center w-full gap-2"
                    key={key}
                    onSelect={() => handleSelect(option)}
                  >
                    {/* ✅ Removed country flag, showing only country code */}
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                      {option.countryCallingCodes} {option.name}
                    </span>
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        option.countryCallingCodes === selectedCountry?.countryCallingCodes
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

CountryDropdownComponent.displayName = "CountryDropdownComponent";

export const CountryDropdown = forwardRef(CountryDropdownComponent);
