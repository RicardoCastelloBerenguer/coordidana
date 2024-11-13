import { localizaciones } from "@/app/config/config";
import Dexie, { Table } from "dexie";

interface CarreteraData {
  id: string;
  data: any;
}

interface GarajeData {
  id: string;
  data: any;
}

class GeoJsonDatabase extends Dexie {
  carreteras!: Table<CarreteraData>;
  garajes!: Table<GarajeData>;

  constructor() {
    super("GeoJsonDatabase");
    this.version(1).stores({
      carreteras: "id",
      garajes: "id",
    });
  }
}

const db = new GeoJsonDatabase();

export async function fetchAndSaveGeoJson(id: string) {
  try {
    const savedCarreterasGeoJson = await db.carreteras.get(`carreteras_${id}`);
    const savedGarajesGeoJson = await db.garajes.get(`garajes_${id}`);

    if (savedCarreterasGeoJson && savedGarajesGeoJson) {
      return {
        carreteras: savedCarreterasGeoJson.data,
        garajes: savedGarajesGeoJson.data,
      };
    }

    const localizacion = localizaciones.find((obj) => obj.value === id);
    
    const geojsonCarreterasData = await fetch(localizacion!.geojson_carreteras).then(
      (response) => response.json()
    );
    const geojsonGarajesData = await fetch(localizacion!.geojson_garajes).then(
      (response) => response.json()
    );

    await db.carreteras.put({ id: `carreteras_${id}`, data: geojsonCarreterasData });
    await db.garajes.put({ id: `garajes_${id}`, data: geojsonGarajesData });
    return { carreteras: geojsonCarreterasData, garajes: geojsonGarajesData };
    


  } catch (error) {
    console.error("Error al obtener el GeoJSON:", error);
    return null;
  }
}
