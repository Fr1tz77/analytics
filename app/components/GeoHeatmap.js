'use client';

import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

export function GeoHeatmap({ data }) {
  const colorScale = scaleLinear()
    .domain([0, Math.max(...data.map(d => d.value))])
    .range(["#ffedea", "#ff5233"]);

  return (
    <ComposableMap projectionConfig={{ scale: 150 }}>
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const d = data.find((s) => s.id === geo.properties.name);
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