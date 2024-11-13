// components/Search.js

import { useState, useEffect } from 'react';

interface NominatimResult {
    place_id: string;
    display_name: string;
    lat: string;
    lon: string;
}
interface SearchProps {
    map: maplibregl.Map; // Recibimos el mapa como prop
}
const Search = ({ map }: SearchProps) => {
    const [query, setQuery] = useState(''); // Guardará lo que el usuario escribe
    const [results, setResults] = useState<NominatimResult[]>([]);; // Guardará los resultados de la búsqueda
    const [loading, setLoading] = useState(false); // Para mostrar un spinner de carga

    // Función para realizar la búsqueda cuando el usuario escribe algo
    const handleSearch = async () => {
        if (query.length < 4) {
            // No hacer la búsqueda si el texto es demasiado corto
            setResults([]);
            return;
        }

        setLoading(true);

        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1`);
        const data = await response.json();
        
        // Filtramos los resultados si encontramos coincidencias con municipio y calle
        setResults(data);
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
                className="search-input"
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
