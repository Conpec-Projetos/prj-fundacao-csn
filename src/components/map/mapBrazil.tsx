'use client'

import React, { useEffect, useRef } from 'react';
import MapaBrasil, { Options as MapaBrasilOptions } from 'mapa-brasil';

// 1. Criar a interface estendida
interface ExtendedOptions extends MapaBrasilOptions {
  fill?: (stateCode: string) => string;
  stroke?: string;
  strokeWidth?: number;
  onMouseEnter?: (stateCode: string) => void;
  onMouseLeave?: () => void;
}

interface MapBrazilProps {
  data: {
    labels: string[];
    values: number[];
  };
}

const BrazilMap: React.FC<MapBrazilProps> = ({ data }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Create a map object from the array data for easier access
  const stateDataMap: Record<string, number> = {};
  data.labels.forEach((state, index) => {
    stateDataMap[state] = data.values[index];
  });
  
  // Find the max value to calculate color intensity
  const maxValue = Math.max(...data.values);
  
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear any previous content
    mapRef.current.innerHTML = '';
    
    // 2. Usar a interface estendida ao chamar a função
    MapaBrasil(mapRef.current, {
      fill: (stateCode: string) => {
        const value = stateDataMap[stateCode] || 0;
        if (value === 0) return "#f8f9fa"; // Light gray for states with no data
        
        // Calculate opacity based on value (from 0.2 to 1.0)
        const opacity = 0.2 + (value / maxValue) * 0.8;
        return `rgba(179, 123, 151, ${opacity})`; // b37b97 with opacity
      },
      stroke: "#ffffff",
      strokeWidth: 1,
      onMouseEnter: (stateCode: string) => {
        if (!tooltipRef.current) return;
        
        const value = stateDataMap[stateCode];
        if (!value) return;
        
        tooltipRef.current.innerHTML = `
          <p class="font-medium">${stateCode}</p>
          <p class="text-lg font-bold">${value}</p>
        `;
        tooltipRef.current.style.display = 'block';
      },
      onMouseLeave: () => {
        if (!tooltipRef.current) return;
        tooltipRef.current.style.display = 'none';
      }
    } as ExtendedOptions); // Usar a asserção de tipo com nossa interface estendida
  }, [data, stateDataMap, maxValue]);
  
  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full"></div>
      <div 
        ref={tooltipRef} 
        className="absolute top-4 right-4 bg-white shadow-md rounded-md p-2 z-10" 
        style={{ display: 'none' }}
      ></div>
    </div>
  );
};

export default BrazilMap;