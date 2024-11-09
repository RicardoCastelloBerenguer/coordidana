const handleGetLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Error al obtener ubicación: ${error.message}`));
        }
      );
    } else {
      reject(new Error("Geolocalización no soportada por este navegador"));
    }
  });
};

export default handleGetLocation;
