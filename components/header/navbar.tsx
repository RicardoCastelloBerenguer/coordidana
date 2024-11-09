import Link from "next/link";
import React from "react";
import { Button, buttonVariants } from "../ui/button";
import Image from "next/image";
import AuthMenu from "../auth-menu";
import { useUser } from "@/app/contexts/UserContext";

const Navbar = ({
  className,
  setOpen,
}: {
  className?: string;
  setOpen?: (open: boolean) => void;
}) => {
  const handleClose = () => {
    if (setOpen) {
      setOpen(false);
    }
  };

  const { isLoggedIn, logout } = useUser();

  return (
    <ul
      className={`flex items-center justify-center gap-6  pb-6 sm:p-2 flex-col sm:flex-row ${className}`}
    >
      <Link onClick={handleClose} href={"/"}>
        <Image
          src="/logo_completo.png" // Ruta de la imagen
          alt="Logo de la página web" // Texto alternativo para la imagen
          width={120} // Ancho de la imagen
          height={40} // Alto de la imagen
          className="rounded-lg" // Clases de Tailwind o CSS para el estilo
        />
      </Link>

      <li>
        <Link
          onClick={handleClose}
          className={buttonVariants({ variant: "outline" })}
          href={"/"}
        >
          Mapa
        </Link>
      </li>

      <li>
        <Link
          onClick={handleClose}
          className={buttonVariants({ variant: "outline" })}
          href={"/comoUsar"}
        >
          Como usar
        </Link>
      </li>

      <li>
        {!isLoggedIn ? (
          <AuthMenu>
            <Button variant={"outline"}>Iniciar Sesión</Button>
          </AuthMenu>
        ) : (
          <Button onClick={logout} variant={"destructive"}>
            Cerrar Sesión
          </Button>
        )}
      </li>
    </ul>
  );
};

export default Navbar;
