import Link from "next/link";
import React from "react";
import { buttonVariants } from "../ui/button";
import Image from "next/image";

const Navbar = ({ className }: { className?: string }) => {
  return (
    <ul
      className={`flex items-center justify-center gap-6  pb-6 sm:p-2 flex-col sm:flex-row ${className}`}
    >
      <Link href={"/"}>
        <Image
          src="/logo_completo.png" // Ruta de la imagen
          alt="Logo de la página web" // Texto alternativo para la imagen
          width={120} // Ancho de la imagen
          height={40} // Alto de la imagen
          className="rounded-lg" // Clases de Tailwind o CSS para el estilo
        />
      </Link>

      <li>
        <Link className={buttonVariants({ variant: "outline" })} href={"/"}>
          Mapa
        </Link>
      </li>

      <li>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href={"/comoUsar"}
        >
          Como usar
        </Link>
      </li>

      <li>
        <Link className={buttonVariants({ variant: "outline" })} href={"/"}>
          Que es Coordidana
        </Link>
      </li>

      <li>
        <Link className={buttonVariants({ variant: "outline" })} href={"/"}>
          Iniciar Sesión
        </Link>
      </li>
    </ul>
  );
};

export default Navbar;
