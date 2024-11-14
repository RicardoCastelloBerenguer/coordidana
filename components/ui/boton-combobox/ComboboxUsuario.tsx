"use client";
import React, { useEffect } from "react";

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

const opciones =
[
  {
    value: "R",
    label: "Residente",
  },
  {
    value: "V",
    label: "Voluntario",
  },
  {
    value: "N",
    label: "Prefiero no contestar",
  }
]

interface ComboboxButtonProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
}

const ComboboxButton: React.FC<ComboboxButtonProps> = ({
  value,
  onChange
}) => {
  const [open, setOpen] = React.useState(false);
  const [label, setLabel] = React.useState("");

  const handleSelect = (currentValue: string, currentLabel: string) => {
    setLabel(currentLabel);
    onChange(currentValue);
    setOpen(false);
  };
  

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-[210px]"
        >
          {value ? label : "Registrate como..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {opciones.map((opcion) => (
                <CommandItem
                key={opcion.value}
                onSelect={() => handleSelect(opcion.value, opcion.label)}
                className="hover:cursor-pointer"
              >
                {opcion.label}
                <Check
                  className={cn(
                    "ml-auto",
                    value === opcion.value ? "opacity-100" : "opacity-0"
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