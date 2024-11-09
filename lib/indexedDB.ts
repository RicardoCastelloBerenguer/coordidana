import Dexie, { Table } from "dexie";

interface CarreteraData {
  id: number;
  data: any;
}

interface GarajeData {
  id: number;
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

export async function fetchAndSaveGeoJson() {
  try {
    const savedCarreterasGeoJson = await db.carreteras.get(1);
    const savedGarajesGeoJson = await db.garajes.get(1);

    if (savedCarreterasGeoJson && savedGarajesGeoJson) {
      console.log("GeoJSON de carreteras y garajes encontrados en IndexedDB");
      return {
        carreteras: savedCarreterasGeoJson.data,
        garajes: savedGarajesGeoJson.data,
      };
    }

    console.log(
      "GeoJSON no encontrado en IndexedDB. Realizando fetch de ambos geoJson..."
    );

    const geojsonCarreterasData = await fetch("/carreteras.geojson").then(
      (response) => response.json()
    );
    const geojsonGarajesData = await fetch("/garajes.geojson").then(
      (response) => response.json()
    );

    await db.carreteras.put({ id: 1, data: geojsonCarreterasData });
    await db.garajes.put({ id: 1, data: geojsonGarajesData });

    console.log("GeoJSON de carreteras y garajes guardados en IndexedDB");
    return { carreteras: geojsonCarreterasData, garajes: geojsonGarajesData };
  } catch (error) {
    console.error("Error al obtener el GeoJSON:", error);
    return null;
  }
}
