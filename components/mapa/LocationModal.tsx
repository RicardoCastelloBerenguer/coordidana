"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import React, { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import getPrioridad from "@/lib/getPrioridad";

interface LocationProps {
  open: boolean;
  setOpenPopup: any;
  onLocationUpdate: any;
  map: maplibregl.Map;
}

interface Ubicacion {
  latitude: number;
  longitude: number;
}

const LocationModal: React.FC<LocationProps> = ({
  setOpenPopup,
  onLocationUpdate,
  open,
  map,
}) => {
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);

  useEffect(() => {
    if (ubicacion) {
      onLocationUpdate(ubicacion);
    }
  }, [ubicacion]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUbicacion({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setOpenPopup(false);
        },
        (error) => {
          setOpenPopup(false);
          console.error("Error al obtener ubicación:", error.message);
        }
      );
    } else {
      setOpenPopup(false);
      alert("Geolocalización no soportada por este navegador");
    }
  };

  return (
    <>
      <Dialog onOpenChange={setOpenPopup} open={open}>
        <DialogContent className="absolute  left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[400px] md:max-w-500px] top-1/3">
          <DialogHeader>
            <DialogTitle>Necesitamos tu ubicación</DialogTitle>
            <DialogDescription>
              Para contribuir aportando datos necesitamos que nos des acceso a
              tu ubicación.
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="grid gap-4 py-4">
              <div className="flex w-full gap-5"></div>
            </div>
            <DialogFooter>
              <Button onClick={handleGetLocation}>
                Sí, permitir ubicación
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationModal;
