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

    if(id == "VLC"){
      const geojsonCarreterasData = await fetch("/carreteras.geojson").then(
        (response) => response.json()
      );
      const geojsonGarajesData = await fetch("/garajes.geojson").then(
        (response) => response.json()
      );

      await db.carreteras.put({ id: "carreteras_VLC", data: geojsonCarreterasData });
      await db.garajes.put({ id: "garajes_VLC", data: geojsonGarajesData });
      return { carreteras: geojsonCarreterasData, garajes: geojsonGarajesData };
    }
    if(id = "MLG"){
      const geojsonMalagaCarreterasData = await fetch("/carreteras_malaga.geojson").then(
        (response) => response.json()
      );
      const geojsonMalagaGarajesData = await fetch("/garajes.geojson").then(
        (response) => response.json()
      );

      await db.carreteras.put({ id: "carreteras_MLG", data: geojsonMalagaCarreterasData });
      await db.garajes.put({ id: "garajes_MLG", data: geojsonMalagaGarajesData });
      return { carreteras: geojsonMalagaCarreterasData, garajes: geojsonMalagaGarajesData };
    }


  } catch (error) {
    console.error("Error al obtener el GeoJSON:", error);
    return null;
  }
}
