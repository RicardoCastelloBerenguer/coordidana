// components/Search.js

import { useState, useEffect } from 'react';

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
}
const Search = ({ map }: SearchProps) => {
    const [query, setQuery] = useState(''); // Guardará lo que el usuario escribe
    const [results, setResults] = useState<NominatimResult[]>([]);; // Guardará los resultados de la búsqueda
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

        const response = await fetch(`http://185.253.154.140/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10`);
        const data = await response.json();
        
        // Filtramos los resultados si encontramos coincidencias con municipio y calle
        const dataFiltrada =data.map((obj: any) => ({
            ...obj, 
            ["display_name"]: removeAfterSecondComma(obj["display_name"] as string)}));
        setResults(dataFiltrada);
        setLoading(false);
    };

    const handleClick = (result: NominatimResult) => {
        map.flyTo({
            center: [+result.lon, +result.lat], // Coordenadas de la ubicación
            zoom: 18, // Nivel de zoom
            essential: true, // Indica que la animación es necesaria
          });
    };

    // Se llama cada vez que el usuario escribe algo
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            handleSearch();
        }, 500); // Esperamos 500ms después de la última pulsación de tecla

        return () => clearTimeout(timeoutId); // Limpiamos el timeout si el usuario sigue escribiendo
    }, [query]);

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar calle, municipio..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
            {loading && <p>Cargando...</p>}
            <ul>
                {results.map((result) => (
                    <li key={result.place_id}>
                         <a
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                e.preventDefault();  // Evita que se siga el enlace
                                handleClick(result); // Ejecuta tu función personalizada
                            }}
                        >
                            {result.display_name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Search;
