"use client";

// components/MapComponent.js
import { useEffect, useRef, useState } from "react";
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapComponent() {
  const mapContainer = useRef(null);

  const [map, setMap] = useState<any>(null);
  const [streetInfo, setStreetInfo] = useState<any>(null);

  function getColor(prioridad: number) {
    switch (prioridad) {
      case 0:
        return "rgba(61, 216, 114, 0)";
      case 1:
        return "rgba(216, 61, 86, 0.7)";
      case 2:
        return "rgba(216, 191, 61, 0.7)";
      case 3:
        return "rgba(61, 216, 114, 0.7)";
    }
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
        // Cargar el archivo GeoJSON
        const geojsonData = await fetch("/carreteras.geojson").then(
          (response) => response.json()
        );

        // Hacer una única llamada para obtener todos los colores de las calles
        const colorsResponse = await fetch("http://localhost:4000/prioridades");
        const colorsData = await colorsResponse.json();

        // Iterar sobre las características del GeoJSON y asignar el color de la base de datos
        geojsonData.features.forEach((feature: any) => {
          const streetId = feature.properties.id_tramo; // Asegúrate de que cada característica tenga un ID único
          // Asignar el color basado en los datos obtenidos
          if (colorsData[streetId] != undefined) {
            feature.properties.color =
              getColor(colorsData[streetId].prioridad) || 0;
            feature.properties.id = colorsData[streetId].id || null;
          } else feature.properties.color = getColor(0);
        });
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
            "line-width": 10,
          },
          filter: ["has", "color"],
        });
      });

      // map.addLayer({
      //   id: "streets-layer",
      //   type: "line",
      //   source: "streets",
      //   paint: {
      //     "line-color": [
      //       "case",
      //       ["!=", ["get", "color"], ""], // Si la propiedad 'color' no es null
      //       ["get", "color"], // Aplica el color de la propiedad 'color'
      //       "rgba(255, 255, 255, 0 )", // Si no tiene color, no dibujes la línea (transparente)
      //     ],
      //     "line-width": 15,
      //   },
      // });

      map.on("click", "streets-layer", async (e) => {
        console.log("first");
        if (e.features && e.features[0]?.properties) {
          const props = e.features[0].properties;
          const info = {
            id_tramo: props.id_tramo,
            nombre: props.nombre,
            comentario: props.comentario,
          };
          setStreetInfo({ ...info, lngLat: e.lngLat });
        }
      });

      setMap(map);

      return () => map.remove();
    }
  }, []);

  return (
    <>
      <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />
      {streetInfo && (
        <p>Hola</p>
        // <StreetPopup streetInfo={streetInfo} map={map} onClose={() => setStreetInfo(null)} />
      )}
    </>
  );
}
