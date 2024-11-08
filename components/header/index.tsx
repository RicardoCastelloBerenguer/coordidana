import Link from "next/link";
import React from "react";
import { buttonVariants } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Menu, Rows3 } from "lucide-react";
import Navbar from "./navbar";
const Header = () => {
  return (
    <nav className="relative">
      <Collapsible className="block sm:hidden absolute transform w-full z-50">
        <CollapsibleTrigger className="m-4">
          <Menu className="text-primary bg-zinc-200 rounded-lg p-2 size-10" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Navbar className="w-[200px] bg-white absolute left-1/2 transform -translate-x-1/2 rounded-lg pt-6" />
        </CollapsibleContent>
      </Collapsible>
      <Navbar className="hidden sm:flex absolute z-50 bg-white/80 w-full" />
    </nav>
  );
};

export default Header;
