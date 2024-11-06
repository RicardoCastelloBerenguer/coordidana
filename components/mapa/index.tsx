"use client";

// components/MapComponent.js
import { useEffect, useRef } from "react";
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapComponent() {
  const mapContainer = useRef(null);

  function getColor(transitable: number, coches: number, escombros: number) {
    if (transitable == 1 && coches == 0 && escombros == 0) {
      return "rgba(61, 216, 114, 0.7)";
    } else if (transitable == 0) {
      return "rgba(216, 61, 86, 0.7)";
    } else {
      return "rgba(216, 191, 61, 0.7)";
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && mapContainer.current) {
      const map = new maplibre.Map({
        container: mapContainer.current,
        style:
          "https://api.maptiler.com/maps/basic-v2/style.json?key=0SnBvUuoJRBy5F6INdTN", // URL de estilo de MapLibre
        center: [-0.376488, 39.477814],
        zoom: 12,
      });

      map.on("load", async () => {
        // Cargar el archivo GeoJSON
        const geojsonData = await fetch("carreteras.geojson").then((response) =>
          response.json()
        );

        // Hacer una única llamada para obtener todos los colores de las calles
        const colorsResponse = await fetch(
          "http://localhost:3000/get-all-street-colors"
        );
        const colorsData = await colorsResponse.json();

        // Iterar sobre las características del GeoJSON y asignar el color de la base de datos
        geojsonData.features.forEach((feature: any) => {
          const streetId = feature.properties.id_tramo; // Asegúrate de que cada característica tenga un ID único
          // Asignar el color basado en los datos obtenidos
          if (colorsData[streetId] != undefined) {
            feature.properties.transitable =
              colorsData[streetId].TRANSITABLE || null;
            feature.properties.color =
              getColor(
                colorsData[streetId].TRANSITABLE,
                colorsData[streetId].COCHES,
                colorsData[streetId].ESCOMBROS
              ) || null;
            feature.properties.comentario =
              colorsData[streetId].COMENTARIO || null;
            feature.properties.coches = colorsData[streetId].COCHES;
            feature.properties.escombros = colorsData[streetId].ESCOMBROS;
            feature.properties.id = colorsData[streetId].ID || null;
          }
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
            "line-color": [
              "case",
              ["!=", ["get", "color"], ""],
              ["get", "color"],
              "rgba(255, 255, 255, 0 )",
            ],
            "line-width": 15,
          },
        });
      });

      return () => map.remove();
    }
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />;
}
