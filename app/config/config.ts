export enum UserRole {
  Admin = "ADMIN",
  User = "USER",
  Guest = "GUEST",
}

export const localizaciones = [
  {
    value: "VLC",
    label: "Valencia",
    coordenadas: [-0.39614, 39.42278],
    geojson_carreteras: "/carreteras.geojson",
    geojson_garajes: "/garajes.geojson"
  },
  {
    value: "MLG",
    label: "Málaga",
    coordenadas: [-4.429376, 36.715269],
    geojson_carreteras: "/carreteras_malaga.geojson",
    geojson_garajes: "/garajes_malaga.geojson"
  },
];