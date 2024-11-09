import Link from "next/link";
import { buttonVariants } from "../ui/button";

const Footer = () => {
  return (
    <footer className="pt-20 pb-10 flex-col flex items-center justify-center gap-3">
      <p className="text-zinc-500 text-center text-sm">
        Web creada por personas voluntarias, independiente de cualquier
        organismo.
      </p>
      <Link
        className={buttonVariants({ variant: "link" })}
        href={"/politicas-privacidad"}
      >
        Política de privacidad
      </Link>
      <span className="text-zinc-400"></span>
    </footer>
  );
};

export default Footer;
