import React, { useEffect, useRef } from 'react';
import MapaBrasil from "mapa-brasil"; // Importa o componente do mapa
import { Options } from "mapa-brasil"; // Importa os tipos de opções do mapa




interface MapaBrasilWrapperProps {
  width: string;
  height: string;
  fillColor: string;
  strokeColor: string;
  options: LocalOptions;
  onClick: (data: { codIbge: number; nomUnidade: string }) => void;
}

interface LocalOptions {
  // Add existing properties here
  states?: {
    [key: string]: {
      fillColor: string;
    };
  };
}

const MapaBrasilWrapper: React.FC<MapaBrasilWrapperProps> = ({
  width,
  height,
  fillColor,
  strokeColor,
  options,
  onClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapRef.current) {
      console.log("MapaBrasilWrapper mounted");

      MapaBrasil(mapRef.current, {
        ...options,
        // strokeColor is not part of Options, so it is removed
        onClick: (data) => onClick(data),
      });
    }
  }, [options, fillColor, strokeColor, onClick]);

  return <div ref={mapRef} style={{ width, height }} />;
};

export default MapaBrasilWrapper;