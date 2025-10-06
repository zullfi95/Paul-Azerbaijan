"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

// Динамический импорт для избежания SSR проблем
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

interface MapComponentProps {
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  initialPosition?: [number, number];
  initialAddress?: string;
}

export default function MapComponent({ onLocationSelect, initialPosition, initialAddress }: MapComponentProps) {
  const [isClient, setIsClient] = useState(false);
  const [position, setPosition] = useState<[number, number]>(initialPosition || [40.4093, 49.8671]); // Баку по умолчанию
  const [address, setAddress] = useState(initialAddress || '');
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMapClick = async (e: any) => {
    const { lat, lng } = e.latlng;
    
    try {
      // Получаем адрес по координатам (reverse geocoding)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      const newAddress = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      setPosition([lat, lng]);
      setAddress(newAddress);
      
      if (onLocationSelect) {
        onLocationSelect(lat, lng, newAddress);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      const newAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setPosition([lat, lng]);
      setAddress(newAddress);
      
      if (onLocationSelect) {
        onLocationSelect(lat, lng, newAddress);
      }
    }
  };

  if (!isClient) {
    return (
      <div className="map-placeholder" style={{ 
        height: '180px', 
        background: '#f0f0f0', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="map-container" style={{ height: '180px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        eventHandlers={{
          click: handleMapClick
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={position}>
          <Popup>
            <div>
              <strong>Selected Location</strong>
              <br />
              {address || `${position[0].toFixed(6)}, ${position[1].toFixed(6)}`}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
