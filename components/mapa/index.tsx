"use client";

// components/MapComponent.js
import { useEffect, useRef, useState } from "react";
import maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Popup from "./popup";
import Search from "./search";
import { Marker } from "maplibre-gl";

import getPrioridad from "@/lib/getPrioridad";

import PopupGaraje from "./popup-garajes";
import { features } from "process";

import LocationModal from "./LocationModal";
import { Button } from "../ui/button";
import { LoaderCircle, LocateFixed, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/app/contexts/UserContext";
import handleGetLocation from "@/lib/currentLocation";
import { fetchAndSaveGeoJson } from "@/lib/indexedDB";

interface Ubicacion {
  latitude: number;
  longitude: number;
}

export default function MapComponent() {
  const mapContainer = useRef(null);

  const [map, setMap] = useState<any>(null);
  const [loadingData, setOnloadingData] = useState<boolean>(false);
  const [loadingColores, setOnloadingColores] = useState<boolean>(false);
  const [openPopup, setOpenPopup] = useState<boolean>(false);
  const [streetInfo, setStreetInfo] = useState<any>(null);
  const [garajeInfo, setGarajeInfo] = useState<any>(null);
  const [openPopupGaraje, setOpenPopupGaraje] = useState<boolean>(false);
  const [openPopupPermisos, setOpenPopupPermisos] = useState<boolean>(false);
  const [ubicacion, setUbicacion] = useState<any | null>(null);
  const [marcadorAnterior, setMarcadorAnterior] =
    useState<maplibregl.Marker | null>(null);
  const { toast } = useToast();

  const { isLoggedIn, location, userWithRole } = useUser();

  const { saveLocationLocalStorage } = useUser();

  const [geoJsonDataCarreteras, setGeoJsonDataCarreteras] = useState<any>(null);

  // TODO DESCOMENTAR
  const DISTANCIA_LIMITE = userWithRole("admin") ? 100000 : 10;

  const ubicacionRef = useRef(ubicacion);

  const handleUbicacionUpdate = (newUbicacion: any) => {
    setUbicacion(newUbicacion); // Actualiza el estado de location
    saveLocationLocalStorage(newUbicacion);
  };

  const handleCentrarUbicacion = async () => {
    if (!ubicacion) {
      setOpenPopupPermisos(true);
    } else {
      try {
        const location = (await handleGetLocation()) as {
          latitude: number;
          longitude: number;
        };
        setUbicacion(location);
        saveLocationLocalStorage(location);
        map.flyTo({
          center: [location.longitude, location.latitude], // Coordenadas de la ubicación
          zoom: 18, // Nivel de zoom
          essential: true, // Indica que la animación es necesaria
        });

        if (marcadorAnterior) {
          marcadorAnterior.remove();
        }
        setMarcadorAnterior(
          new maplibre.Marker({ color: "#803cec" })
            .setLngLat([location.longitude, location.latitude])
            .addTo(map)
        );
      } catch (error: any) {
        console.error("Error capturado:", error.message);
      }
    }
  };

  const refrescarCalles = async () => {
    try {
      const sourceColores = map.getSource("streets-colors");
      const geojsonColoresData = sourceColores._data;

      const sourceCalles = map.getSource("streets");
      const geojsonCallesData = sourceCalles._data;

      const colorsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/prioridades`
      );
      const colorsData = await colorsResponse.json();
      geojsonColoresData.features = [];
      geojsonCallesData.features.forEach((feature: any) => {
        const streetId = feature.properties.id_tramo;
        // Asegúrate de que cada característica tenga un ID único
        // Asignar el color basado en los datos obtenidos
        if (colorsData[streetId] != undefined) {
          const nuevaFeature: {
            type: "Feature";
            geometry: { type: string; coordinates: any[] };
            properties: { [key: string]: any };
          } = {
            type: "Feature",
            geometry: feature.geometry,
            properties: {
              id_tramo: feature.properties.id_tramo,
              nombre: feature.properties.nombre,
              color: getColorByPrioridad(colorsData[streetId].prioridad) || 0,
              id: colorsData[streetId].id || null,
            },
          };

          geojsonColoresData.features.push(nuevaFeature);
        }
      });

      sourceColores.setData(geojsonColoresData);
    } catch (error: any) {
      console.error("Error capturado:", error.message);
    }
  };

  const refrescarGarajes = async () => {
    try {
      const sourceColores = map.getSource("garajes-colores");
      const geojsonColoresData = sourceColores._data;

      const sourceGarajes = map.getSource("garajes");
      const geojsonGarajesData = sourceGarajes._data;

      const coloresGarajesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/colores-garajes`
      );
      const coloresGarajes = await coloresGarajesResponse.json();

      geojsonColoresData.features = [];
      geojsonGarajesData.features.forEach((feature: any) => {
        const garajeId = feature.properties.ID;
        // Asegúrate de que cada característica tenga un ID único
        // Asignar el color basado en los datos obtenidos
        if (coloresGarajes[garajeId] != undefined) {
          const nuevaFeature: {
            type: "Feature";
            geometry: { type: string; coordinates: any[] };
            properties: { [key: string]: any };
          } = {
            type: "Feature",
            geometry: feature.geometry,
            properties: {
              color: getColorByEstado(coloresGarajes[garajeId].estado),
              id: coloresGarajes[garajeId].id || null,
            },
          };

          geojsonColoresData.features.push(nuevaFeature);
        }
      });

      sourceColores.setData(geojsonColoresData);
    } catch (error: any) {
      console.error("Error capturado:", error.message);
    }
  };

  const handleRefrescarMapa = async () => {
    refrescarCalles();
    refrescarGarajes();
  };

  useEffect(() => {
    ubicacionRef.current = ubicacion; // Actualiza el ref cuando cambia `ubicacion`
  }, [ubicacion]);

  function updateStreetColorInMap(row: any) {
    const source = map.getSource("streets-colors");
    // Buscar la calle específica por su ID
    const geojsonData = source._data;

    const nuevaFeature: {
      type: "Feature";
      geometry: { type: string; coordinates: any[] };
      properties: { [key: string]: any };
    } = {
      type: "Feature",
      geometry: streetInfo.geometry,
      properties: {
        id_tramo: streetInfo.id_tramo,
        nombre: streetInfo.nombre,
        color: getColorByPrioridad(row.prioridad) || 0,
      },
    };

    let contiene = false;
    for (let i = 0; i < geojsonData.features.length; i++) {
      if (geojsonData.features[i].properties.id_tramo === streetInfo.id_tramo) {
        geojsonData.features[i].properties.color = getColorByPrioridad(
          row.prioridad
        );
        contiene = true;
      }
    }
    if (!contiene) {
      geojsonData.features.push(nuevaFeature);
    }

    geojsonData.features.push(nuevaFeature);
    source.setData(geojsonData);
  }

  function updateGarajeColorInMap(codigo: any, estado: any) {
    const source = map.getSource("garajes-colores");

    // Obtener el GeoJSON de la fuente
    const geojsonData = source._data;

    const nuevaFeature: {
      type: "Feature";
      geometry: { type: string; coordinates: any[] };
      properties: { [key: string]: any };
    } = {
      type: "Feature",
      geometry: garajeInfo.geometry,
      properties: {
        id: codigo,
        color: getColorByEstado(estado),
      },
    };
    let contiene = false;
    for (let i = 0; i < geojsonData.features.length; i++) {
      if (geojsonData.features[i].properties.id === codigo) {
        geojsonData.features[i].properties.color = getColorByEstado(estado);
        contiene = true;
      }
    }
    if (!contiene) {
      geojsonData.features.push(nuevaFeature);
    }
    source.setData(geojsonData);
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
      case -1:
        return "rgba(46, 41, 78, 0)";
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
    if (Object.keys(location).length > 0) {
      setUbicacion(location);
    }
  }, [location]);

  useEffect(() => {
    if (typeof window !== "undefined" && mapContainer.current) {
      const map = new maplibre.Map({
        container: mapContainer.current,
        style: "/estilo.json", // URL de estilo de MapLibre
        center: [-0.39614, 39.42278],
        zoom: 10,
      });

      map.on("load", async () => {
        setOnloadingData(true);

        if (ubicacionRef && ubicacionRef.current) {
          const newlocation = (await handleGetLocation()) as {
            latitude: number;
            longitude: number;
          };
          setUbicacion(newlocation);
          saveLocationLocalStorage(newlocation);
        }

        const data = await fetchAndSaveGeoJson();
        const geojsonData = data!.carreteras;

        // Hacer una única llamada para obtener todos los colores de las calles
        const colorsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/prioridades`
        );
        setOnloadingData(false);
        setOnloadingColores(true);
        const colorsData = await colorsResponse.json();

        const callesGuardadasGeojson: {
          type: "FeatureCollection";
          features: {
            type: "Feature";
            geometry: { type: string; coordinates: any[] };
            properties: { [key: string]: any };
          }[];
        } = {
          type: "FeatureCollection",
          features: [],
        };

        // Iterar sobre las características del GeoJSON y asignar el color de la base de datos
        geojsonData.features.forEach((feature: any) => {
          const streetId = feature.properties.id_tramo; // Asegúrate de que cada característica tenga un ID único
          // Asignar el color basado en los datos obtenidos
          if (colorsData[streetId] != undefined) {
            const nuevaFeature: {
              type: "Feature";
              geometry: { type: string; coordinates: any[] };
              properties: { [key: string]: any };
            } = {
              type: "Feature",
              geometry: feature.geometry,
              properties: {
                id_tramo: feature.properties.id_tramo,
                nombre: feature.properties.nombre,
                color: getColorByPrioridad(colorsData[streetId].prioridad) || 0,
                id: colorsData[streetId].id || null,
              },
            };

            callesGuardadasGeojson.features.push(nuevaFeature);
          }
          feature.properties.color = getColorByPrioridad(0);
        });
        setOnloadingColores(true);
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
          maxzoom: 24,
        });

        map.addSource("streets-colors", {
          type: "geojson",
          data: callesGuardadasGeojson as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
        });

        // Añadir la capa de las calles
        map.addLayer({
          id: "streets-colors-layer",
          type: "line",
          source: "streets-colors",
          paint: {
            "line-color": ["get", "color"], // Aplica el color de la propiedad 'color'
            "line-width": 6,
          },
        });

        map.on("zoom", () => {
          const zoomLevel = map.getZoom();
        });

        //PARKING
        // Cargar el archivo GeoJSON
        const geojsonGarajesData = data?.garajes;

        const coloresGarajesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/colores-garajes`
        );
        const coloresGarajes = await coloresGarajesResponse.json();

        const garajesGuardadosGeojson: {
          type: "FeatureCollection";
          features: {
            type: "Feature";
            geometry: { type: string; coordinates: any[] };
            properties: { [key: string]: any };
          }[];
        } = {
          type: "FeatureCollection",
          features: [],
        };

        geojsonGarajesData.features.forEach((feature: any) => {
          if (coloresGarajes[feature.properties.ID] != undefined) {
            const nuevaFeature: {
              type: "Feature";
              geometry: { type: string; coordinates: any[] };
              properties: { [key: string]: any };
            } = {
              type: "Feature",
              geometry: feature.geometry,
              properties: {
                color: getColorByEstado(
                  coloresGarajes[feature.properties.ID].estado
                ),
                id: feature.properties.ID,
              },
            };
            feature.properties.color = getColorByEstado(-1);
            garajesGuardadosGeojson.features.push(nuevaFeature);
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

        map.on("sourcedata", function onSourceData(e) {
          // Comprobar que la fuente correcta se ha cargado y la capa está lista
          if (
            e.sourceId === "garajes-colores" &&
            map.isSourceLoaded("garajes-colores")
          ) {
            // Cambiar el estado de carga
            setOnloadingColores(false);
            // Eliminar el listener para que no se ejecute más veces
            map.off("sourcedata", onSourceData);
          }
        });

        map.addSource("garajes-colores", {
          type: "geojson",
          data: garajesGuardadosGeojson as GeoJSON.FeatureCollection<GeoJSON.Geometry>,
        });

        // Añadir la capa de las calles
        map.addLayer({
          id: "garajes-colores-layer",
          type: "fill", // Cambia a 'symbol' si quieres usar íconos personalizados
          source: "garajes-colores",
          paint: {
            "fill-color": ["get", "color"],
          },
        });
      });

      setMap(map);

      map.on("click", "streets-layer", async (e) => {
        if (!isLoggedIn) {
          toast({
            title: "Necesitas estar loggeado para hacer reportes",
            variant: "destructive",
          });
        } else {
          if (ubicacionRef && ubicacionRef.current) {
            if (
              haversine(
                ubicacionRef.current!.latitude,
                ubicacionRef.current!.longitude,
                e.lngLat.lat,
                e.lngLat.lng
              ) < DISTANCIA_LIMITE
            ) {
              if (e.features && e.features[0]?.properties) {
                const props = e.features[0].properties;
                const info = {
                  id_tramo: props.id_tramo,
                  nombre: props.nombre,
                  comentario: props.comentario,
                  geometry: e.features[0].geometry,
                };
                setStreetInfo({ ...info, lngLat: e.lngLat });
                setOpenPopup(true);
              }
            } else {
              toast({
                title: "Debes estar a menos de 10 km de la localización",
                variant: "destructive",
              });
            }
          } else {
            setOpenPopupPermisos(true);
          }
        }
      });

      map.on("click", "garajes-layer", async (e) => {
        //TODO DESCOMENTAR
        if (!isLoggedIn) {
          toast({
            title: "Necesitas estar loggeado para hacer reportes",
            variant: "destructive",
          });
        } else {
          if (ubicacionRef && ubicacionRef.current) {
            if (
              haversine(
                ubicacionRef.current!.latitude,
                ubicacionRef.current!.longitude,
                e.lngLat.lat,
                e.lngLat.lng
              ) < DISTANCIA_LIMITE
            ) {
              if (e.features && e.features[0]?.properties) {
                const props = e.features[0].properties;
                const geometry = e.features[0].geometry;

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

                if (!response.ok) {
                  throw new Error(
                    data.message || "Error al recuperar el garaje"
                  );
                }

                const info = {
                  codigo: props.ID,
                  estado: data.estado,
                  comentario: data.comentario,
                  geometry: geometry,
                };
                setGarajeInfo({ ...info, lngLat: e.lngLat });
                setOpenPopupGaraje(true);
              }
            } else {
              toast({
                title: "Debes estar a menos de 10 km de la localización",
                variant: "destructive",
              });
            }
          } else {
            setOpenPopupPermisos(true);
          }
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
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <LocationModal
          setOpenPopup={setOpenPopupPermisos}
          map={map}
          open={openPopupPermisos}
          onLocationUpdate={handleUbicacionUpdate}
        />
      </div>

      <div className="relative w-full h-screen">
        <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />
        {loadingData && (
          <div className="absolute top-14 left-0 right-0 bottom-0 flex justify-center items-center z-40">
            <div className="flex flex-col items-center justify-center gap-2">
              <LoaderCircle className="animate-spin size-20" />
              <span>Cargando datos del mapa...</span>
            </div>
          </div>
        )}
      </div>

      {loadingColores && (
        <div className="absolute top-16 right-2 flex justify-center items-center z-50">
          <div className="flex items-center justify-center gap-2 bg-white rounded-lg text-primary p-2">
            <LoaderCircle className="animate-spin size-15" />
            <span>Cargando reportes de usuarios...</span>
          </div>
        </div>
      )}

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {garajeInfo && (
          <PopupGaraje
            garajeInfo={garajeInfo}
            setOpenPopup={setOpenPopupGaraje}
            open={openPopupGaraje}
            map={map}
            updateMapa={updateGarajeColorInMap}
          />
        )}
      </div>

      {streetInfo && (
        <Popup
          streetInfo={streetInfo}
          setOpenPopup={setOpenPopup}
          open={openPopup}
          map={map}
          updateMapa={updateStreetColorInMap}
        />
      )}

      <div className="absolute z-40 top-0 sm:top-32 right-2 w-auto m-5">
        <div className="flex flex-col gap-3">
          <Button onClick={handleRefrescarMapa} variant={"outline"}>
            <RefreshCcw size={20} className="size-28" />
          </Button>

          <Button onClick={handleCentrarUbicacion} variant={"outline"}>
            <LocateFixed size={20} className="size-28" />
          </Button>
        </div>
      </div>
      <div className="absolute z-0 top-0 sm:top-32 right-2 w-auto m-5">
        <div className="flex flex-col gap-3">
        <Search map ={map} />
        </div>
      </div>
      
      {/* <Popup streetInfo={streetInfo} map={map} /> */}
    </>
  );
}
