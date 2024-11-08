"use client";

// components/MapComponent.js
import { useEffect, useRef, useState } from "react";
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Popup from "./popup";

import getPrioridad from "@/lib/getPrioridad";

import PopupGaraje from "./popup-garajes";
import { features } from "process";

import LocationModal from "./LocationModal";
import { Button } from "../ui/button";
import { LocateFixed } from "lucide-react";

interface Ubicacion {
  latitude: number;
  longitude: number;
}

export default function MapComponent() {
  const mapContainer = useRef(null);

  const [map, setMap] = useState<any>(null);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [streetInfo, setStreetInfo] = useState<any>(null);
  const [garajeInfo, setGarajeInfo] = useState<any>(null);
  const [openPopupGaraje, setOpenPopupGaraje] = useState<boolean>(false);
  const [openPopupPermisos, setOpenPopupPermisos] = useState<boolean>(false);
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);

  // TODO DESCOMENTAR
  //const DISTANCIA_LIMITE =50;
  const DISTANCIA_LIMITE =200;

  const ubicacionRef = useRef(ubicacion);

  const handleUbicacionUpdate = (newUbicacion: any) => {
    setUbicacion(newUbicacion); // Actualiza el estado de location
  };

  useEffect(() => {
    ubicacionRef.current = ubicacion; // Actualiza el ref cuando cambia `ubicacion`
  }, [ubicacion]);

  function updateStreetColorInMap(row: any) {
    const source = map.getSource("streets-colors");
       // Buscar la calle específica por su ID
    const geojsonData = source._data;


    const nuevaFeature: {
      type: "Feature",
      geometry: { type: string, coordinates: any[] },
      properties: { [key: string]: any }
    } = {
      type: "Feature",
      geometry: streetInfo.geometry, 
      properties: {
        "id_tramo": streetInfo.id_tramo, 
        "nombre": streetInfo.nombre,
        "color": getColorByPrioridad(row.prioridad) || 0
      }
    };

    geojsonData.features.push(nuevaFeature);
    source.setData(geojsonData);
  }

  function updateGarajeColorInMap(codigo: any, estado: any) {
    const source = map.getSource("garajes");

    // Obtener el GeoJSON de la fuente
    const geojsonData = source._data;

    geojsonData.features.forEach((feature: any) => {
      if (feature.properties.ID == codigo) {
        feature.properties.color = getColorByEstado(estado);
        source.setData(geojsonData);
        return;
      }
    });
  }

  function getColorByPrioridad(prioridad: number) {
    switch (prioridad) {
      case 0:
        return "rgba(210, 210, 220, 0.3)";
      case 1:
        return "rgba(61, 216, 114, 0.7)";
      case 2:
        return "rgba(255, 222, 89, 0.7)";
      case 3:
        return "rgba(216, 61, 86, 0.7)";
    }
  }

  function getColorByEstado(estado: number) {
    switch (estado) {
      case 0:
        return "rgba(46, 41, 78, 0.15)";
      case 1:
        return "rgba(126, 217, 87, 0.8)";
      case 2:
        return "rgba(178, 147, 91, 0.8)";
      case 3:
        return "rgba(12, 192, 223, 0.8)";
    }
  }

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (angle: number) => (angle * Math.PI) / 180;

    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // Devuelve la distancia en kilómetros
  }

  useEffect(() => {
    if (typeof window !== "undefined" && mapContainer.current) {
      const map = new maplibre.Map({
        container: mapContainer.current,
        style:
          "https://api.maptiler.com/maps/dataviz/style.json?key=gI4Oo4FqdNdASpvMjsac", // URL de estilo de MapLibre
        center: [-0.376488, 39.477814],
        zoom: 12,
      });

      map.on("load", async () => {
        setOpenPopupPermisos(true);
        // Cargar el archivo GeoJSON
        const geojsonData = await fetch("/carreteras.geojson").then(
          (response) => response.json()
        );

        // Hacer una única llamada para obtener todos los colores de las calles
        const colorsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/prioridades`
        );
        const colorsData = await colorsResponse.json();

        const callesGuardadasGeojson: {
          type: "FeatureCollection",
          features: { 
            type: "Feature", 
            geometry: { type: string, coordinates: any[] }, 
            properties: { [key: string]: any } 
          }[]
        } = {
          type: "FeatureCollection",
          features: []
        };
        
        // Iterar sobre las características del GeoJSON y asignar el color de la base de datos
        geojsonData.features.forEach((feature: any) => {
          const streetId = feature.properties.id_tramo; // Asegúrate de que cada característica tenga un ID único
          // Asignar el color basado en los datos obtenidos
          if (colorsData[streetId] != undefined) {

            const nuevaFeature: {
              type: "Feature",
              geometry: { type: string, coordinates: any[] },
              properties: { [key: string]: any }
            } = {
              type: "Feature",
              geometry: feature.geometry, 
              properties: {
                "id_tramo": feature.properties.id_tramo, 
                "nombre": feature.properties.nombre,
                "color": getColorByPrioridad(colorsData[streetId].prioridad) || 0,
                "id": colorsData[streetId].id || null
              }
            };

            callesGuardadasGeojson.features.push(nuevaFeature);
          } 
          feature.properties.color = getColorByPrioridad(0);
        });

        //CAPA DE SELECCION DE CALLES
        map.addSource("streets", {
          type: "geojson",
          data: geojsonData,
        });

        // Añadir la capa de las calles
        map.addLayer({
          id: "streets-layer",
          type: "line",
          source: "streets",
          paint: {
            "line-color": ["get", "color"], // Aplica el color de la propiedad 'color'
            "line-width": 12,
          },
          minzoom: 16,  
          maxzoom: 24   
        });

        map.addSource("streets-colors", {
          type: "geojson",
          data: callesGuardadasGeojson as GeoJSON.FeatureCollection<GeoJSON.Geometry>
        });

        // Añadir la capa de las calles
        map.addLayer({
          id: "streets-colors-layer",
          type: "line",
          source: "streets-colors",
          paint: {
            "line-color": ["get", "color"], // Aplica el color de la propiedad 'color'
            "line-width": 6,
          } 
        });


        map.on('zoom', () => {
          const zoomLevel = map.getZoom();
          console.log(`Nivel de zoom actual: ${zoomLevel}`);
        });

        //PARKING
        // Cargar el archivo GeoJSON
        const geojsonGarajesData = await fetch("/garajes.geojson").then(
          (response) => response.json()
        );

        const coloresGarajesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/colores-garajes`
        );
        const coloresGarajes = await coloresGarajesResponse.json();

        geojsonGarajesData.features.forEach((feature: any) => {
          if (coloresGarajes[feature.properties.ID]) {
            feature.properties.color = getColorByEstado(
              coloresGarajes[feature.properties.ID].estado
            );
          } else {
            feature.properties.color = getColorByEstado(0);
          }
        });
        map.addSource("garajes", {
          type: "geojson",
          data: geojsonGarajesData,
        });

        // Añadir la capa de las calles
        map.addLayer({
          id: "garajes-layer",
          type: "fill", // Cambia a 'symbol' si quieres usar íconos personalizados
          source: "garajes",
          paint: {
            "fill-color": ["get", "color"],
          },
        });
      });

      setMap(map);

    map.on("click", "streets-layer", async (e) => {
        //TODO DESCOMENTAR
        if(ubicacionRef && ubicacionRef.current){
          if(haversine(ubicacionRef.current!.latitude, ubicacionRef.current!.longitude, e.lngLat.lat, e.lngLat.lng) < DISTANCIA_LIMITE){

            if (e.features && e.features[0]?.properties) {
              const props = e.features[0].properties;
              const info = {
                id_tramo: props.id_tramo,
                nombre: props.nombre,
                comentario: props.comentario,
                geometry: e.features[0].geometry
              };
              setStreetInfo({ ...info, lngLat: e.lngLat });
              setOpenPopup(true);
            }
          }
        } else {
          setOpenPopupPermisos(true);
        }
      });

      
      map.on("click", "garajes-layer", async (e) => {
       //TODO DESCOMENTAR
       if(ubicacionRef && ubicacionRef.current){
        if(haversine(ubicacionRef.current!.latitude, ubicacionRef.current!.longitude, e.lngLat.lat, e.lngLat.lng) < DISTANCIA_LIMITE){

          if (e.features && e.features[0]?.properties ) {
            const props = e.features[0].properties;

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/garaje/${props.ID}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },

            }
          );

            const data = await response.json();
            console.log("Respuesta del servidor:", data);
      
            if (!response.ok) {
              throw new Error(data.message || "Error al recuperar el garaje");
            }

            const info = {
              codigo: props.ID,
              estado: data.estado,
              comentario: data.comentario
            };
            setGarajeInfo({ ...info, lngLat: e.lngLat });
            setOpenPopupGaraje(true);
          }
        }} else {
          setOpenPopupPermisos(true);
        }
      });


      // Cambia el cursor a "pointer" cuando pase sobre una calle
      map.on("mouseenter", "streets-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      // Cambia el cursor a "default" cuando salga de una calle
      map.on("mouseleave", "streets-layer", () => {
        map.getCanvas().style.cursor = "";
      });

      // Cambia el cursor a "pointer" cuando pase sobre una calle
      map.on("mouseenter", "garajes-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      // Cambia el cursor a "default" cuando salga de una calle
      map.on("mouseleave", "garajes-layer", () => {
        map.getCanvas().style.cursor = "";
      });

      return () => map.remove();
    }
  }, []);

  return (
    <>
      <div>
        <LocationModal
          setOpenPopup={setOpenPopupPermisos}
          map={map}
          open={openPopupPermisos}
          onLocationUpdate={handleUbicacionUpdate}
        />
      </div>
      <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />

      {garajeInfo && (
        <PopupGaraje
          garajeInfo={garajeInfo}
          setOpenPopup={setOpenPopupGaraje}
          open={openPopupGaraje}
          map={map}
          updateMapa={updateGarajeColorInMap}
        />
      )}
      {streetInfo && (
        <Popup
          streetInfo={streetInfo}
          setOpenPopup={setOpenPopup}
          open={openPopup}
          map={map}
          updateMapa={updateStreetColorInMap}
        />
      )}

      <Button
        variant={"outline"}
        className="absolute z-50 top-0 sm:top-32 right-10 w-auto m-5"
      >
        <LocateFixed size={20} className="size-28" />
      </Button>
      {/* <Popup streetInfo={streetInfo} map={map} /> */}
    </>
  );
}
