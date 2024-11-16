"use client";
import React, { useEffect } from "react";

import { Check, ChevronsUpDown } from "lucide-react";
import { localizaciones } from "@/app/config/config";

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


const ComboboxButton = ({ classname }: { classname?: string }) => {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const handleSelect = (currentValue: any, label: any) => {
    setValue(currentValue === value ? "" : label);
    if (currentValue) localStorage.setItem("current-location", currentValue);
    setOpen(false);
    window.location.reload()
  };

  useEffect(() => {
    let localizacion = localStorage.getItem("current-location");
    if(localizacion){
      const objLocalizacion = localizaciones.find((loc) => loc.value === localizacion)
      setValue(objLocalizacion!.label);
    } else {
      const objLocalizacion = localizaciones.find((loc) => loc.value === "VLC")
      setValue(objLocalizacion!.label);
    }
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={classname}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-[120px]"
        >
          {value ? value : "Selecciona localización"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[120px] p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {localizaciones.map((localizacion) => (
                <CommandItem
                  className="hover:cursor-pointer"
                  key={localizacion.value}
                  value={localizacion.value}
                  onSelect={(currentValue: any) => {
                    handleSelect(currentValue, localizacion.label);
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
