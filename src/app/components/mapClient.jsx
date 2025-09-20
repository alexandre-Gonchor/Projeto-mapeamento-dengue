"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

export default function MapClient({ center, zoom = 13, registros = [], onMapClick, recenter, openPopupId, onStatusChange }) {
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const individualMarkers = useRef({});

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map").setView(center, zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);

      map.on('click', (e) => {
        if (onMapClick) {
          onMapClick(e.latlng);
        }
      });

      map.on('popupopen', (e) => {
        const popup = e.popup;
        const button = popup.getElement().querySelector('.status-save-button');
        if (button) {
          button.addEventListener('click', () => {
            const registroId = button.dataset.id;
            const select = popup.getElement().querySelector('.status-select');
            const novoStatus = select.value;

            if (registroId && novoStatus && onStatusChange) {
              onStatusChange(registroId, novoStatus);
              mapRef.current.closePopup();
            }
          });
        }
      });

      mapRef.current = map;
    }
  }, [center, zoom, onMapClick, onStatusChange]);

  useEffect(() => {
    if (mapRef.current && markersRef.current) {
      markersRef.current.clearLayers();
      individualMarkers.current = {};

      registros.forEach(foco => {
        if (foco.localizacao && typeof foco.localizacao === 'string') {
          const coordsArray = foco.localizacao.split(',').map(coord => parseFloat(coord.trim()));
          if (coordsArray.length === 2 && !isNaN(coordsArray[0]) && !isNaN(coordsArray[1])) {
            const popupContent = `
              <b>Tipo:</b> ${foco.tipo}<br>
              <b>Status Atual:</b> ${foco.status}<br>
              <b>Descrição:</b> ${foco.descricao || 'Sem descrição'}
              <hr style="margin: 0.5rem 0;" />
              <div class="d-flex align-items-center">
                <select class="form-select form-select-sm me-2 status-select">
                  <option value="suspeito" ${foco.status === 'suspeito' ? 'selected' : ''}>Suspeito</option>
                  <option value="confirmado" ${foco.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                  <option value="resolvido" ${foco.status === 'resolvido' ? 'selected' : ''}>Resolvido</option>
                </select>
                <button class="btn btn-primary btn-sm status-save-button" data-id="${foco.id}">Salvar</button>
              </div>
            `;

            const marker = L.marker(coordsArray)
              .addTo(markersRef.current)
              .bindPopup(popupContent);

            individualMarkers.current[foco.id] = marker;
          }
        }
      });
    }
  }, [registros]);

  useEffect(() => {
    if (mapRef.current && recenter) {
      mapRef.current.setView([recenter.latitude, recenter.longitude], 15);
    }
  }, [recenter]);

  useEffect(() => {
    if (mapRef.current && openPopupId && individualMarkers.current[openPopupId]) {
      individualMarkers.current[openPopupId].openPopup();
    }
  }, [openPopupId, registros]);

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <div id="map" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}