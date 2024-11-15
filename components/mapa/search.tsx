// components/Search.js

import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { SeparatorHorizontal } from "lucide-react";

interface NominatimResult {
  place_id: string;
  display_name: string;
  name: string;
  lat: string;
  lon: string;
  address: any;
}
interface SearchProps {
  map: maplibregl.Map; // Recibimos el mapa como prop
  className?: string;
}
const Search = ({ map, className }: SearchProps) => {
  const [query, setQuery] = useState(""); // Guardará lo que el usuario escribe
  const [results, setResults] = useState<NominatimResult[]>([]); // Guardará los resultados de la búsqueda
  const [loading, setLoading] = useState(false); // Para mostrar un spinner de carga

  function removeAfterSecondComma(input: string): string {
    // Divide el string en un array usando la coma como separador
    const parts = input.split(",");

    // Si hay menos de dos comas, no hay nada que eliminar
    if (parts.length <= 3) {
      return input;
    }

    // Combina solo las primeras dos partes, unidas por comas
    return `${parts[0]}, ${parts[2]}`;
  }

  // Función para realizar la búsqueda cuando el usuario escribe algo
  const handleSearch = async () => {
    if (query.length < 4) {
      // No hacer la búsqueda si el texto es demasiado corto
      setResults([]);
      return;
    }

    setLoading(true);

    const response = await fetch(
      `http://185.253.154.140/search?q=${encodeURIComponent(
        query
      )}&format=json&addressdetails=1&limit=10`
    );
    const data = await response.json();

    // Filtramos los resultados si encontramos coincidencias con municipio y calle
    const dataFiltrada = data.map((obj: any) => ({
      ...obj,
      ["display_name"]: removeAfterSecondComma(obj["display_name"] as string),
    }));
    setResults(dataFiltrada);
    setLoading(false);
  };

  const handleClick = (result: NominatimResult) => {
    map.flyTo({
      center: [+result.lon, +result.lat], // Coordenadas de la ubicación
      zoom: 18, // Nivel de zoom
      essential: true, // Indica que la animación es necesaria
    });
    setQuery("");
  };

  // Se llama cada vez que el usuario escribe algo
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500); // Esperamos 500ms después de la última pulsación de tecla

    return () => clearTimeout(timeoutId); // Limpiamos el timeout si el usuario sigue escribiendo
  }, [query]);

  return (
    <div className={className}>
      <Input
        aria-label="Navegador calles municipios"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar calle, municipio..."
        className="bg-white text-primary font-semibold rounded-b-none"
      />
      {loading && <p>Cargando...</p>}
      <ul className="bg-white text-xs rounded-lg rounded-t-none">
        {results.map((result) => (
          <>
            <li
              key={result.place_id}
              className="hover:bg-primary hover:text-white hover:cursor-pointer p-1"
            >
              <a
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault(); // Evita que se siga el enlace
                  handleClick(result); // Ejecuta tu función personalizada
                }}
              >
                {result.display_name}
              </a>
            </li>
            <div className="border-b" />
          </>
        ))}
      </ul>
    </div>
  );
};

export default Search;
