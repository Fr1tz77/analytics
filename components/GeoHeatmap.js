'use client';

import { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

const countryNameMapping = {
  "United States": "United States of America",
  "UK": "United Kingdom",
  "The Netherlands": "Netherlands",
  "Czech Republic": "Czechia",
  "Bosnia and Herzegovina": "Bosnia and Herz.",
  // Add more mappings as needed
};

export function GeoHeatmap({ data }) {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch(geoUrl)
      .then(response => response.json())
      .then(setGeoData)
      .catch(error => console.error('Error loading geography data:', error));
  }, []);

  if (!data || data.length === 0 || !geoData) {
    return <div>Loading heatmap data...</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value));

  const colorScale = scaleLinear()
    .domain([0, maxValue])
    .range(["#ffedea", "#ff5233"]);

  return (
    <ComposableMap projectionConfig={{ scale: 150 }}>
      <Geographies geography={geoData}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const geoName = geo.properties.name;
            const d = data.find((s) => 
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