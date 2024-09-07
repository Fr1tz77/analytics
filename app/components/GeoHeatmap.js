'use client';

import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { geoData } from './geoData'; // We'll create this file next

const countryNameMapping = {
  "United States": "United States of America",
  "UK": "United Kingdom",
  "The Netherlands": "Netherlands",
  "Czech Republic": "Czechia",
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  // Add more mappings as needed
};

export function GeoHeatmap({ data = [] }) {  // Provide a default empty array
  console.log("GeoHeatmap received data:", data);  // Add this log

  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 1;

  const colorScale = scaleLinear()
    .domain([0, maxValue])
    .range(["#ffedea", "#ff5233"]);

  return (
    <ComposableMap
      projectionConfig={{
        scale: 147,
        center: [0, 30] // Adjust these values to center the map as needed
      }}
    >
      <Geographies geography={geoData}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const geoName = geo.properties.name;
            const d = data && data.find((s) => 
              s.id.toLowerCase() === geoName.toLowerCase() || 
              s.id.toLowerCase() === countryNameMapping[geoName]?.toLowerCase() || 
              countryNameMapping[s.id]?.toLowerCase() === geoName.toLowerCase()
            );
            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={d ? colorScale(d.value) : "#F5F4F6"}
                stroke="#D6D6DA"
                strokeWidth={0.5}
              />
            );
          })
        }
      </Geographies>
    </ComposableMap>
  );
}