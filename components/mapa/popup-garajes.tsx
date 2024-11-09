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

interface PopupProps {
  open: boolean;
  setOpenPopup: any;
  garajeInfo: {
    id: string;
    codigo: string;
    lngLat: any | null;
    comentario: string | null;
    estado: number | null;
  } | null;
  updateMapa: any;
  map: maplibregl.Map;
}

const PopupGaraje: React.FC<PopupProps> = ({
  garajeInfo,
  setOpenPopup,
  open,
  map,
  updateMapa,
}) => {
  const [estado, setEstado] = useState(0);
  const [comentario, setComentario] = useState("");

  const handleEstadoChange = (e: any) => {
    setEstado(Number(e));
  };

  const emptyForm = () => {
    setComentario("");
    setEstado(0);
    setOpenPopup(false);
  };

  useEffect(() => {
    if (garajeInfo) {
      setEstado(garajeInfo.estado || 0);
      setComentario(garajeInfo.comentario || "");
    }
  }, [garajeInfo]);

  const manejarGuardadoGaraje = async (e: React.FormEvent) => {
    e.preventDefault();

    const reporte = {
      codigo: garajeInfo!.codigo,
      comentario: comentario,
      estado: estado,
      idUsuario: localStorage.getItem("currentUser"),
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/garaje`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reporte),
        }
      );

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (!response.ok) {
        throw new Error(data.message || "Error al guardar el reporte");
      }

      updateMapa(garajeInfo!.codigo, estado);
      emptyForm();
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  return (
    <>
      <Dialog onOpenChange={setOpenPopup} open={open}>
        <DialogContent className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-[400px] md:max-w-500px]">
          <DialogHeader>
            <DialogTitle>Estado del garaje</DialogTitle>
            <DialogDescription>
              Haz cambios al estado del garaje con las opciones de abajo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={manejarGuardadoGaraje}>
            <div className="grid gap-4 py-4">
              <div className="flex w-full gap-5">
                <Label htmlFor="estadoCorrecto">Limpio</Label>
                <Checkbox
                  id="estadoCorrecto"
                  checked={estado == 1}
                  onCheckedChange={(checked: any) => {
                    handleEstadoChange(1);
                  }}
                />
              </div>
              <div className="flex w-full gap-5">
                <Label htmlFor="estadoBarro">Barro</Label>
                <Checkbox
                  id="estadoBarro"
                  checked={estado == 2}
                  onCheckedChange={(checked: any) => {
                    handleEstadoChange(2);
                  }}
                />
              </div>
              <div className="flex w-full gap-5">
                <Label htmlFor="estadoInundado">Inundado</Label>
                <Checkbox
                  id="estadoInundado"
                  checked={estado == 3}
                  onCheckedChange={(checked: any) => {
                    handleEstadoChange(3);
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

export default PopupGaraje;
