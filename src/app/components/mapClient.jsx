// app/components/MapClient.jsx
"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility"; 
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

export default function MapClient({ center = [51.505, -0.09], zoom = 13 }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map", { center, zoom });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      L.marker(center).addTo(map).bindPopup("Localização atual!").openPopup();
      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <div id="map" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}