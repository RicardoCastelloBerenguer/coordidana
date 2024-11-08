import CarruselImagenes from "@/components/carrusel-imagenes";
import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const page = () => {
  return (
    <>
      <div className="pt-28 flex justify-center flex-col items-center w-full h-full">
        <header className="flex flex-col gap-4 ">
          <h2 className="text-xl font-semibold text-primary w-full text-center">
            COMO USAR COORDIDANA
          </h2>
          <Card className="pt-5 mx-2">
            <CardContent>
              <p className="text-base font-medium text-center">
                A continuación puedes observar un carrusel de imágenes
                ofreciendo una breve guía de como usar y para que sirve nuestra
                web coordidana.
              </p>
            </CardContent>
          </Card>
        </header>
        <div className="h-full w-full flex justify-center mt-16 lg:mt-28">
          <CarruselImagenes
            className=""
            carpetaImagenesUrl="paso-a-paso"
            imgCount={12}
          />
        </div>
      </div>
    </>
  );
};

export default page;
