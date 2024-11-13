"use client";
import React from "react";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

const localizaciones = [
  {
    value: "valencia",
    label: "Valencia",
  },
  {
    value: "malaga",
    label: "Málaga",
  },
];

const ComboboxButton = ({ classname }: { classname?: string }) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const handleSelect = (currentValue: any) => {
    setValue(currentValue === value ? "" : currentValue);
    if (currentValue) localStorage.setItem("current-location", currentValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={classname}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-[210px]"
        >
          {value ? value.toUpperCase() : "Selecciona localización"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {localizaciones.map((localizacion) => (
                <CommandItem
                  className="hover:cursor-pointer"
                  key={localizacion.value}
                  value={localizacion.value}
                  onSelect={(currentValue) => {
                    handleSelect(currentValue);
                  }}
                >
                  {localizacion.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === localizacion.value ? "opacity-100" : "opacity-0"
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

export default ComboboxButton;
