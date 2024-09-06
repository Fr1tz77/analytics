'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const WorldMap = ({ data, darkMode }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (map) {
      map.invalidateSize();
    }
  }, [map, darkMode]);

  console.log('WorldMap data:', data);

  if (!data || data.length === 0) {
    console.warn('No data provided to WorldMap');
    // Return an empty div or a message instead of null
    return <div>No geographical data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{ height: '400px', width: '100%' }} ref={mapRef}>
      {!map && (
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          whenCreated={setMap}
        >
          <TileLayer
            url={darkMode 
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {data.map((country, index) => {
            if (!country.coordinates) {
              console.warn(`Missing coordinates for country: ${country.id}`);
              return null;
            }
            return (
              <CircleMarker
                key={index}
                center={country.coordinates}
                radius={Math.max(5, (country.value / maxValue) * 20)}
                fillColor="#ff7800"
                color="#000"
                weight={1}
                opacity={1}
                fillOpacity={0.8}
              >
                <Tooltip>
                  {country.id}: {country.value}
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      )}
    </div>
  );
};

export default WorldMap;