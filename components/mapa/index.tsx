"use client";

// components/MapComponent.js
import { useEffect, useRef, useState } from "react";
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Popup from "./popup";

import getPrioridad from "@/lib/getPrioridad";

import PopupGaraje from "./popup-garajes";

export default function MapComponent() {
  const mapContainer = useRef(null);

  const [map, setMap] = useState<any>(null);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [streetInfo, setStreetInfo] = useState<any>(null);
  const [garajeInfo, setGarajeInfo] = useState<any>(null);


  function updateStreetColorInMap(row: any) {
    const source = map.getSource("streets");
       // Buscar la calle específica por su ID
    
    geojsonData.features.forEach((feature: any) => {
      if (feature.properties.id_tramo == row.id_tramo) {
        feature.properties.color = getColorByPrioridad(row.prioridad) || null;
        // Actualizar la fuente de datos del mapa con el nuevo GeoJSON
        source.setData(geojsonData);
      }
    });
  }
  function updateGarajeColorInMap(codigo: any, estado: any) {
    const source = map.getSource("garajes");

    // Obtener el GeoJSON de la fuente
    const geojsonData = source._data;

    geojsonData.features.forEach((feature: any) => {
      if(feature.properties.ID == codigo){
        
        feature.properties.color = getColorByEstado(estado);
        source.setData(geojsonData);
        return
      }
    
    });
  }

  function getColorByPrioridad(prioridad: number) {
    switch (prioridad) {
      case 0:
        return "rgba(61, 216, 114, 0)";
      case 1:
        return "rgba(61, 216, 114, 0.7)";
      case 2:
        return "rgba(216, 191, 61, 0.7)";
      case 3:
        return "rgba(216, 61, 86, 0.7)";
    }
  }
  
  function getColorByEstado(estado: number) {
    switch (estado) {
      case 0:
        return "rgba(46, 41, 78, 0.15)";
      case 1:
        return "rgba(61, 216, 114, 0.8)";
      case 2:
        return "rgba(209, 142, 56, 0.8)";
      case 3:
        return "rgba(56, 125, 209, 0.8)";
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
              getColorByPrioridad(colorsData[streetId].prioridad) || 0;
            feature.properties.id = colorsData[streetId].id || null;
          } else feature.properties.color = getColorByPrioridad(0);
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
        });
        
        //PARKING
        // Cargar el archivo GeoJSON
        const geojsonGarajesData = await fetch("/garajes.geojson").then(
          (response) => response.json()
        );
        geojsonGarajesData.features.forEach((feature: any) => {
          feature.properties.color = getColorByEstado(0);
        });
        map.addSource("garajes", {
          type: "geojson",
          data: geojsonGarajesData,
        });

        // Añadir la capa de las calles
        map.addLayer({
          id: "garajes-layer",
          type: 'fill',  // Cambia a 'symbol' si quieres usar íconos personalizados
          source: 'garajes',
          paint: {
              'fill-color': ["get", "color"]
          }
        });
      });
      

      setMap(map);

      map.on("click", "streets-layer", async (e) => {
        if (e.features && e.features[0]?.properties) {
          const props = e.features[0].properties;
          const info = {
            id_tramo: props.id_tramo,
            nombre: props.nombre,
            comentario: props.comentario,
          };
          setStreetInfo({ ...info, lngLat: e.lngLat });
          setOpenPopup(true);
        }
      });

      
      map.on("click", "garajes-layer", async (e) => {
        if (e.features && e.features[0]?.properties ) {
          const props = e.features[0].properties;

          const response = await fetch(
            `http://localhost:4000/garaje/${props.ID}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              }
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
          setOpenPopup(true);
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
      map.on('mouseenter', 'garajes-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Cambia el cursor a "default" cuando salga de una calle
      map.on('mouseleave', 'garajes-layer', () => {
        map.getCanvas().style.cursor = '';
      });

      return () => map.remove();
    }
  }, []);

  return (
    <>
      <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />
      {streetInfo && (
        <Popup
          streetInfo={streetInfo}
          setOpenPopup={setOpenPopup}
          open={openPopup}
          map={map}
          updateMapa={updateStreetColorInMap}
        />
      )}
      {garajeInfo && (
        <PopupGaraje
          garajeInfo={garajeInfo}
          setOpenPopup={setOpenPopup}
          open={openPopup}
          map={map}
          updateMapa ={updateGarajeColorInMap}
        />
      )}
      {/* <Popup streetInfo={streetInfo} map={map} /> */}
    </>
    
  );
}
