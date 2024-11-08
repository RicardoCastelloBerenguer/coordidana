import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

const CarruselImagenes = ({
  carpetaImagenesUrl,
  className,
  imgCount,
}: {
  carpetaImagenesUrl: string;
  className?: string;
  imgCount: number;
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Carousel
        opts={{
          align: "start",
        }}
        orientation="vertical"
        className="w-full max-w-xs"
      >
        <CarouselContent className="-mt-1 h-[400px]">
          {Array.from({ length: imgCount }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="">
                <Image
                  src={`/${carpetaImagenesUrl}/${index + 1}.png`}
                  alt="Imagenes carrusel de como usar coordidana"
                  //   layout="intrinsic"
                  width={1420} // Ancho de la imagen que deseas que ocupe
                  height={1040} // Alto de la imagen que deseas que ocupe
                  className="rounded-lg w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default CarruselImagenes;
