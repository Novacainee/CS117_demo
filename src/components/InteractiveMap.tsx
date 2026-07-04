/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Eye, Info, ShieldAlert, Crosshair } from 'lucide-react';
import { Species } from '../types';
import { SPECIES_PRESENCE_POINTS } from '../data';

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  radiusKm: number;
  selectedSpecies: Species;
  isAdminMode: boolean;
  onCoordinatesChange: (lat: number, lon: number) => void;
  predictedPoints: { lat: number; lon: number; score: number }[];
}

// Bounding box of Vietnam
const VN_BOUNDS = {
  minLat: 8.18,
  maxLat: 23.39,
  minLon: 102.14,
  maxLon: 109.5,
};

declare var L: any;

export default function InteractiveMap({
  latitude,
  longitude,
  radiusKm,
  selectedSpecies,
  isAdminMode,
  onCoordinatesChange,
  predictedPoints,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const presenceMarkersGroupRef = useRef<any>(null);
  const predictedMarkersGroupRef = useRef<any>(null);

  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // 1. Inject Leaflet CSS and JS from CDN dynamically
  useEffect(() => {
    // Check if Leaflet is already loaded
    if (window.hasOwnProperty('L')) {
      setIsLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    cssLink.crossOrigin = '';
    document.head.appendChild(cssLink);

    const jsScript = document.createElement('script');
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    jsScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    jsScript.crossOrigin = '';
    jsScript.onload = () => {
      setIsLeafletLoaded(true);
    };
    jsScript.onerror = () => {
      setLoadError(true);
    };
    document.head.appendChild(jsScript);

    return () => {
      // Clean up scripts on unmount if appropriate, or keep them cached
    };
  }, []);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!isLeafletLoaded || !mapContainerRef.current) return;

    // Prevent double map initialization
    if (mapInstanceRef.current) return;

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      center: [16.0, 108.0], // Center of Vietnam
      zoom: 6,
      zoomControl: true,
    });

    // Add high quality topographical styled map tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    // Feature Groups for organization
    presenceMarkersGroupRef.current = L.featureGroup().addTo(map);
    predictedMarkersGroupRef.current = L.featureGroup().addTo(map);

    // Click handler for coordinates setting
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      // Clamp to Vietnam bounds or just let user click and form handles bounds warning
      onCoordinatesChange(parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6)));
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletLoaded]);

  // 3. Sync Map Marker and Buffer Circle when latitude, longitude, radius or adminMode changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Determine coordinate to display
    // Blurring policy for CR species if admin mode is disabled
    let displayLat = latitude;
    let displayLon = longitude;
    const isBlurred = selectedSpecies.isHighlySensitive && !isAdminMode;

    if (isBlurred) {
      // Deterministic offset based on coordinates to prevent flickering
      const offsetLat = (Math.sin(latitude * 500) * 0.04); // approx 4km offset
      const offsetLon = (Math.cos(longitude * 500) * 0.04);
      displayLat = latitude + offsetLat;
      displayLon = longitude + offsetLon;
    }

    // Clear previous marker & circle
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
    }

    // Draw Buffer Circle (search radius)
    circleRef.current = L.circle([displayLat, displayLon], {
      radius: radiusKm * 1000,
      color: isBlurred ? '#f59e0b' : '#10b981', // Amber if blurred/policy, Emerald if precise
      fillColor: isBlurred ? '#f59e0b' : '#10b981',
      fillOpacity: 0.12,
      dashArray: isBlurred ? '6, 6' : '0',
      weight: 2,
    }).addTo(map);

    // Draw Main Position Marker
    const iconColor = isBlurred ? 'amber' : 'emerald';
    const markerHtmlStyles = `
      background-color: ${isBlurred ? '#d97706' : '#059669'};
      width: 20px;
      height: 20px;
      display: block;
      left: -5px;
      top: -5px;
      position: relative;
      border-radius: 20px 20px 0;
      transform: rotate(-45deg);
      border: 2px solid #ffffff;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    `;

    const pinIcon = L.divIcon({
      className: "custom-pin-icon",
      iconAnchor: [5, 15],
      popupAnchor: [0, -15],
      html: `<span style="${markerHtmlStyles}" />`
    });

    markerRef.current = L.marker([displayLat, displayLon], { icon: pinIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <strong style="color: ${isBlurred ? '#d97706' : '#059669'};">Tâm điểm khảo sát</strong><br/>
          ${isBlurred ? '⚠️ <em>Tọa độ được làm mờ (~4km) vì lý do bảo tồn loài cực kỳ nguy cấp.</em><br/>' : ''}
          Vĩ độ: ${displayLat.toFixed(5)}<br/>
          Kinh độ: ${displayLon.toFixed(5)}<br/>
          Bán kính: ${radiusKm} km
        </div>
      `);

    // Only pan map if position changed significantly
    const currentCenter = map.getCenter();
    const distanceToNewCenter = Math.sqrt(Math.pow(currentCenter.lat - displayLat, 2) + Math.pow(currentCenter.lng - displayLon, 2));
    if (distanceToNewCenter > 0.4) {
      map.setView([displayLat, displayLon], 8);
    }
  }, [latitude, longitude, radiusKm, selectedSpecies, isAdminMode, isLeafletLoaded]);

  // 4. Draw species presence points (Green points) & predict heatmap (color grid points)
  useEffect(() => {
    if (!mapInstanceRef.current || !isLeafletLoaded) return;

    const presenceGroup = presenceMarkersGroupRef.current;
    const predictedGroup = predictedMarkersGroupRef.current;

    presenceGroup.clearLayers();
    predictedGroup.clearLayers();

    // A. Draw Presence Points (Historical detections)
    const points = SPECIES_PRESENCE_POINTS[selectedSpecies.id] || [];
    const isBlurred = selectedSpecies.isHighlySensitive && !isAdminMode;

    points.forEach((pt, index) => {
      let drawLat = pt[0];
      let drawLon = pt[1];

      if (isBlurred) {
        // Blur historical points as well to protect species location!
        const randOffsetLat = (Math.sin(index * 23.4) * 0.05); // Approx 5km blur
        const randOffsetLon = (Math.cos(index * 45.1) * 0.05);
        drawLat = pt[0] + randOffsetLat;
        drawLon = pt[1] + randOffsetLon;
      }

      L.circleMarker([drawLat, drawLon], {
        radius: isBlurred ? 8 : 5,
        color: isBlurred ? '#d97706' : '#059669',
        fillColor: isBlurred ? '#f59e0b' : '#10b981',
        fillOpacity: isBlurred ? 0.35 : 0.85,
        weight: isBlurred ? 1.5 : 2,
        dashArray: isBlurred ? '4, 4' : '0',
      })
      .addTo(presenceGroup)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <strong style="color: #059669;">Điểm ghi nhận thực địa</strong><br/>
          Loài: <em>${selectedSpecies.name}</em><br/>
          ${isBlurred ? '🔒 <em>Tọa độ được bóp méo ngẫu nhiên để chống săn trộm. Bật Ranger Admin Mode để xem tọa độ thực tế.</em>' : `Tọa độ thực: ${pt[0].toFixed(5)}, ${pt[1].toFixed(5)}`}
        </div>
      `);
    });

    // B. Draw Predicted Suitability Grid Points (within Buffer Circle)
    predictedPoints.forEach((point) => {
      // Color gradient based on HSS suitability score
      // Score: 0.0 to 1.0
      // Green (Low suitability) -> Yellow (Moderate) -> Red (High suitability)
      let color = '#3b82f6'; // Blue for very low
      if (point.score >= 0.75) {
        color = '#ef4444'; // Red (High)
      } else if (point.score >= 0.6) {
        color = '#f97316'; // Orange
      } else if (point.score >= 0.45) {
        color = '#eab308'; // Yellow
      } else if (point.score >= 0.25) {
        color = '#10b981'; // Green
      }

      L.circleMarker([point.lat, point.lon], {
        radius: 6,
        stroke: false,
        fillColor: color,
        fillOpacity: 0.55,
      })
      .addTo(predictedGroup)
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
          <strong>Dự đoán ô lưới sinh cảnh</strong><br/>
          Mức độ phù hợp (HSS): <strong style="color: ${color}; font-size: 13px;">${point.score.toFixed(4)}</strong><br/>
          Vị trí: ${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}
        </div>
      `);
    });

  }, [selectedSpecies, isAdminMode, predictedPoints, isLeafletLoaded]);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden flex flex-col h-full min-h-[480px]">
      <div className="bg-slate-50 border-b border-slate-100 p-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-800 font-display">
            Bản đồ Phân bố Địa lý & Sinh cảnh Việt Nam
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span>Thực địa {selectedSpecies.isHighlySensitive && !isAdminMode ? '(Làm mờ)' : '(Xác thực)'}</span>
          </div>
          {predictedPoints.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
              <span>Lớp dự báo (HSS &gt;= 0.45)</span>
            </div>
          )}
        </div>
      </div>

      {loadError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
          <p className="text-sm font-medium text-slate-700">Không thể tải thư viện bản đồ tương tác</p>
          <p className="text-xs text-slate-500 mt-1">Vui lòng kiểm tra kết nối internet và tải lại trang.</p>
        </div>
      ) : !isLeafletLoaded ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-slate-500 font-mono">Đang khởi tạo WebGIS Engine...</p>
        </div>
      ) : null}

      <div 
        ref={mapContainerRef} 
        id="vietnam-webgis-map" 
        className={`flex-1 w-full h-full relative ${isLeafletLoaded ? 'block' : 'hidden'}`}
        style={{ zIndex: 1 }}
      />

      <div className="bg-emerald-50 border-t border-emerald-100 p-3.5 px-5 text-[11px] leading-relaxed text-emerald-800 flex items-start gap-2">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong>Mẹo tương tác:</strong> Nhấp trực tiếp vào bất kỳ vị trí nào trên bản đồ đất liền Việt Nam để chọn tọa độ khảo sát mới. Tâm khảo sát sẽ tự động dịch chuyển và hiển thị các điểm dự đoán sinh cảnh trong vòng bán kính đệm.
          {selectedSpecies.isHighlySensitive && !isAdminMode && (
            <div className="mt-1 font-semibold text-amber-700 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> 
              Chính sách bảo mật dữ liệu đang bật: Tọa độ thực địa của {selectedSpecies.name} đã được làm mờ để bảo tồn an toàn.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
