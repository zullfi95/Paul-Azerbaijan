"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix для иконок Leaflet в Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Данные локаций PAUL в Баку
export interface Location {
  id: number;
  name: string;
  address: string;
  phone: string[];
  hours: string;
  coordinates: [number, number]; // [latitude, longitude]
}

export const paulLocations: Location[] = [
  {
    id: 1,
    name: 'PAUL Port Baku',
    address: 'Neftchilar Avenue, 123',
    phone: ['050 464 07 70', '055 464 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3656, 49.8359] // Port Baku area
  },
  {
    id: 2,
    name: 'PAUL Cinema Plus',
    address: 'Mammad Amin Razulzadeh Street, 8-10',
    phone: ['050 899 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3775, 49.8425] // Park Bulvar area
  },
  {
    id: 3,
    name: 'PAUL Caspian Plaza',
    address: 'Jafar Jabbarli Street, 44',
    phone: ['050 890 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3725, 49.8375]
  },
  {
    id: 4,
    name: 'PAUL Demirchi Tower',
    address: 'Khojali Avenue, 37',
    phone: ['051 225 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3895, 49.8495]
  },
  {
    id: 5,
    name: 'PAUL Chinar Plaza',
    address: 'Heydar Aliyev Avenue, 106A',
    phone: ['051 335 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3825, 49.8520]
  },
  {
    id: 6,
    name: 'PAUL 28 Mall',
    address: 'Azadliq Avenue, 15a/4',
    phone: ['050 772 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3995, 49.8665]
  },
  {
    id: 7,
    name: 'PAUL BEGOC',
    address: 'Zarifa Aliyeva Street, 93',
    phone: ['051 206 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3785, 49.8395]
  },
  {
    id: 8,
    name: 'PAUL Ministry of Economy',
    address: 'Heydar Aliyev Avenue, 155',
    phone: ['050 698 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3915, 49.8585]
  },
  {
    id: 9,
    name: 'PAUL Crescent Mall',
    address: 'Neftchilar avenue 66, 68 (Aypara Palace and Town)',
    phone: ['010 324 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3665, 49.8365]
  },
  {
    id: 10,
    name: 'PAUL ADA',
    address: 'Ahmadbey Aghaoghlu str. 61',
    phone: ['010 321 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3855, 49.8545]
  }
];

interface LocationsMapProps {
  height?: string;
}

export default function LocationsMap({ height = '600px' }: LocationsMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>🗺️</div>
          <div>Loading map...</div>
        </div>
      </div>
    );
  }

  // Центр Баку
  const bakuCenter: [number, number] = [40.3777, 49.8420];

  return (
    <div style={{ 
      height, 
      borderRadius: '12px', 
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <MapContainer 
        center={bakuCenter} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {paulLocations.map((location) => (
          <Marker 
            key={location.id} 
            position={location.coordinates}
            icon={icon}
          >
            <Popup>
              <div style={{ 
                padding: '8px',
                minWidth: '200px'
              }}>
                <h3 style={{ 
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#1a1a1a'
                }}>
                  {location.name}
                </h3>
                <p style={{ 
                  margin: '0 0 6px 0',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  📍 {location.address}
                </p>
                <p style={{ 
                  margin: '0 0 6px 0',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  📞 {location.phone.join(', ')}
                </p>
                <p style={{ 
                  margin: '0',
                  fontSize: '13px',
                  color: '#888'
                }}>
                  🕐 {location.hours}
                </p>
                <a 
                  href={`https://www.google.com/maps?q=${location.coordinates[0]},${location.coordinates[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: '#1a1a1a',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}
                >
                  Open in Google Maps →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

