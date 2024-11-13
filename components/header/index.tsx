"use client";
import Link from "next/link";
import React, { useState } from "react";
import { buttonVariants } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Menu, Rows3 } from "lucide-react";
import Navbar from "./navbar";

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
import ComboboxButton from "../ui/boton-combobox";

const Header = () => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <nav className="relative">
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className="block sm:hidden absolute transform w-full z-50" //
      >
        <CollapsibleTrigger className="m-4">
          <Menu className="text-primary bg-zinc-200 rounded-lg p-2 top-16 size-10 absolute z-40" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Navbar
            setOpen={setOpen}
            className="w-[200px] bg-white absolute left-1/2 transform -translate-x-1/2 top-32 rounded-lg pt-6 z-50"
          />
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 w-full h-screen blur-xl z-10 bg-black/50"
          />
        </CollapsibleContent>
      </Collapsible>
      <ComboboxButton classname="absolute m-4 left-0 top-1 sm:top-14 z-50" />
      <Navbar className="hidden sm:flex absolute z-50 bg-white/80 w-full" />
    </nav>
  );
};

export default Header;
