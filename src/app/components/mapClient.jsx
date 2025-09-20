'use client';
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

export default function MapClient({ center, zoom = 13, registros = [], onMapClick, recenter, openPopupId, onStatusChange }) {
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const individualMarkers = useRef({});

  // Efeito para inicialização do mapa (roda apenas uma vez)
  useEffect(() => {
    if (mapRef.current) return; // Se o mapa já foi inicializado, não faz nada

    const map = L.map("map").setView(center, zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Função de limpeza: remove o mapa quando o componente é desmontado
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom]);

  // Efeito para gerenciar os eventos do mapa (click e popup)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e) => onMapClick?.(e.latlng);
    map.on('click', handleClick);

    const handlePopupOpen = (e) => {
      const popupEl = e.popup.getElement();
      const button = popupEl?.querySelector('.status-save-button');
      if (!button) return;

      const onButtonClick = () => {
        const registroId = button.dataset.id;
        const select = popupEl.querySelector('.status-select');
        const novoStatus = select?.value;
        if (registroId && novoStatus) {
          onStatusChange?.(registroId, novoStatus);
          map.closePopup();
        }
      };
      button.addEventListener('click', onButtonClick);

      map.once('popupclose', (ev) => {
        if (ev.popup === e.popup) {
          button.removeEventListener('click', onButtonClick);
        }
      });
    };
    map.on('popupopen', handlePopupOpen);

    // Limpa os listeners ao desmontar ou se as funções de callback mudarem
    return () => {
      map.off('click', handleClick);
      map.off('popupopen', handlePopupOpen);
    };
  }, [onMapClick, onStatusChange]);

  // Efeito para atualizar os marcadores na tela
  useEffect(() => {
    if (!markersRef.current) return;
    
    markersRef.current.clearLayers();
    individualMarkers.current = {};

    registros.forEach(foco => {
      if (foco.localizacao) {
        const coords = foco.localizacao.split(',').map(c => parseFloat(c.trim()));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          const popupContent = `
            <b>Tipo:</b> ${foco.tipo}<br>
            <b>Status Atual:</b> ${foco.status}<br>
            <b>Descrição:</b> ${foco.descricao || 'Sem descrição'}
            <hr style="margin: 0.5rem 0;" />
            <div style="display: flex; align-items: center; gap: 8px;">
              <select class="form-select form-select-sm status-select" style="flex-grow: 1;">
                <option value="suspeito" ${foco.status === 'suspeito' ? 'selected' : ''}>Suspeito</option>
                <option value="confirmado" ${foco.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
                <option value="resolvido" ${foco.status === 'resolvido' ? 'selected' : ''}>Resolvido</option>
              </select>
              <button class="btn btn-primary btn-sm status-save-button" data-id="${foco.id}">Salvar</button>
            </div>
          `;
          const marker = L.marker(coords).bindPopup(popupContent);
          markersRef.current.addLayer(marker);
          individualMarkers.current[foco.id] = marker;
        }
      }
    });
  }, [registros]);

  // Efeito para recentralizar o mapa
  useEffect(() => {
    if (mapRef.current && recenter) {
      mapRef.current.setView([recenter.latitude, recenter.longitude], 15, { animate: true });
    }
  }, [recenter]);

  // Efeito para abrir um pop-up específico
  useEffect(() => {
    if (openPopupId && individualMarkers.current[openPopupId]) {
      individualMarkers.current[openPopupId].openPopup();
    }
  }, [openPopupId]);

  return (
    <div style={{ height: "400px", width: "100%", borderRadius: "var(--bs-border-radius)" }}>
      <div id="map" style={{ height: "100%", width: "100%", borderRadius: "inherit" }} />
    </div>
  );
}