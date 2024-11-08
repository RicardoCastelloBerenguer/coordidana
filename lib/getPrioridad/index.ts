export default function getPrioridad(
  isNoTransitable: boolean,
  isHayVehiculos: boolean,
  isEscombros: boolean
) {
  if (!isNoTransitable && !isHayVehiculos && !isEscombros) return 1;
  else if (isNoTransitable) return 3;
  else return 2;
}
