import MapComponent from "@/components/mapa";
import dynamic from "next/dynamic";
import React from "react";

const page = () => {
  const MapComponent = dynamic(() => import("../../components/mapa/index"), {
    ssr: false,
  });

  return <MapComponent />;
};

export default page;
