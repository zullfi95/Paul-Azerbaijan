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
    coordinates: [40.3765113, 49.8637226] // Port Baku Towers (verified)
  },
  {
    id: 2,
    name: 'PAUL Cinema Plus',
    address: 'Mammad Amin Razulzadeh Street, 8-10',
    phone: ['050 899 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3754686, 49.8435136] // Nizami Cinema area
  },
  {
    id: 3,
    name: 'PAUL Caspian Plaza',
    address: 'Jafar Jabbarli Street, 44',
    phone: ['050 890 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3998587, 49.8527933] // Ganjlik Mall area
  },
  {
    id: 4,
    name: 'PAUL Demirchi Tower',
    address: 'Khojali Avenue, 37',
    phone: ['051 225 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3582328, 49.8374188] // Deniz Mall area
  },
  {
    id: 5,
    name: 'PAUL Chinar Plaza',
    address: 'Heydar Aliyev Avenue, 106A',
    phone: ['051 335 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.4034736, 49.8729281] // Park Cinema area
  },
  {
    id: 6,
    name: 'PAUL 28 Mall',
    address: 'Azadliq Avenue, 15a/4',
    phone: ['050 772 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.379006, 49.8467346] // 28 Mall (verified)
  },
  {
    id: 7,
    name: 'PAUL BEGOC',
    address: 'Zarifa Aliyeva Street, 93',
    phone: ['051 206 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3729566, 49.8496137] // Zarifa Aliyeva 93 (verified)
  },
  {
    id: 8,
    name: 'PAUL Ministry of Economy',
    address: 'Heydar Aliyev Avenue, 155',
    phone: ['050 698 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.4124336, 49.8969206] // Ministry of Economy (verified)
  },
  {
    id: 9,
    name: 'PAUL Crescent Mall',
    address: 'Neftchilar avenue 66, 68 (Aypara Palace and Town)',
    phone: ['010 324 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3708113, 49.8366915] // Fountains Square area
  },
  {
    id: 10,
    name: 'PAUL ADA',
    address: 'Ahmadbey Aghaoghlu str. 61',
    phone: ['010 321 07 70'],
    hours: 'Mon-Sun. 08:00 - 23:00',
    coordinates: [40.3964110, 49.8497598] // ADA University (verified)
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

  // Центр Баку (среднее значение всех локаций)
  const bakuCenter: [number, number] = [40.3845, 49.8565];

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

