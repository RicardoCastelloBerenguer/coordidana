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
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/app/contexts/UserContext";

interface PopupProps {
  open: boolean;
  setOpenPopup: any;
  streetInfo: {
    id_tramo: string;
    nombre: string;
    lngLat: any | null;
    comentario: string | null;
  } | null;
  updateMapa: any;
  map: maplibregl.Map;
}

const Popup: React.FC<PopupProps> = ({
  streetInfo,
  setOpenPopup,
  open,
  map,
  updateMapa,
}) => {
  const [isNoTransitable, setIsNoTransitable] = useState(false);
  const [isLimpia, setIsLimpia] = useState(false);
  const [isHayVehiculos, setIsHayVehiculos] = useState(false);
  const [isEscombros, setIsEscombros] = useState(false);
  const [comentario, setComentario] = useState("");
  const { toast } = useToast();
  
  const { isLoggedIn } = useUser();
  const emptyForm = () => {
    setComentario("");
    setIsEscombros(false);
    setIsNoTransitable(false);
    setIsHayVehiculos(false);
    setOpenPopup(false);
  };

  const manejarGuardadoCarretera = async (e: React.FormEvent) => {
    e.preventDefault();
    const reporte = {
      id_tramo: streetInfo!.id_tramo,
      nombre: streetInfo!.nombre,
      comentario: comentario,
      transitable: !isNoTransitable,
      coches: isHayVehiculos,
      escombros: isEscombros,
      idUsuario: localStorage.getItem("currentUser"),
      prioridad: getPrioridad(isNoTransitable, isHayVehiculos, isEscombros),
    };

    try {
      const response = await fetch(
        `http://localhost:4000/reportes/${streetInfo!.id_tramo}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reporte),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error guardando reporte",
          description: "Estamos teniendo problemas actualmente",
          variant: "destructive",
        });
        // throw new Error(data.message || "Error al guardar el reporte");
      } else {
        console.log("first");
        toast({
          title: "Reporte guardado correctamente",
        });
      }

      emptyForm();
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/tramo/${streetInfo!.id_tramo}`
      );
      const data = await response.json();
      updateMapa({ id_tramo: streetInfo!.id_tramo, prioridad: data.prioridad });
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  return (
    <>
      <Dialog onOpenChange={setOpenPopup} open={open}>
        <DialogContent className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[400px] md:max-w-500px]">
          <DialogHeader>
            <DialogTitle>Calle {streetInfo!.nombre}</DialogTitle>
            <DialogDescription>
              Haz cambios al estado de la calle con las opciones de abajo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={manejarGuardadoCarretera}>
            <div className="grid gap-4 py-4">
              <div className="flex w-full gap-5">
                <Label htmlFor="limpio">Limpia</Label>
                <Checkbox
                  id="limpio"
                  checked={isLimpia}
                  onCheckedChange={(checked: any) => {
                    setIsLimpia(checked);
                    if (checked) {
                      setIsNoTransitable(false);
                      setIsHayVehiculos(false);
                      setIsEscombros(false);
                    }
                  }}
                />
              </div>
              <div className="flex w-full gap-5">
                <Label htmlFor="noTransitable">No transitable</Label>
                <Checkbox
                  id="noTransitable"
                  checked={isNoTransitable}
                  onCheckedChange={(checked: any) => {
                    setIsNoTransitable(checked);
                    if (checked) {
                      setIsLimpia(false);
                    }
                  }}
                />
              </div>

              <div className="flex w-full gap-5">
                <Label htmlFor="hayVehiculos">Hay vehículos</Label>
                <Checkbox
                  id="hayVehiculos"
                  checked={isHayVehiculos}
                  onCheckedChange={(checked: any) => {
                    setIsHayVehiculos(checked);
                    if (checked) {
                      setIsLimpia(false);
                    }
                  }}
                />
              </div>

              <div className="flex w-full gap-5">
                <Label htmlFor="escombros">Hay escombros</Label>
                <Checkbox
                  id="escombros"
                  checked={isEscombros}
                  onCheckedChange={(checked: any) => {
                    setIsEscombros(checked);
                    if (checked) {
                      setIsLimpia(false);
                    }
                  }}
                />
              </div>

              <div className="flex w-full flex-col mt-5 gap-2">
                <Label htmlFor="comentarios" className="ml-1">
                  Comentarios
                </Label>
                <Input
                  id="comentarios"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Popup;
