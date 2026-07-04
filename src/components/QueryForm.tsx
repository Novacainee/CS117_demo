/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, Compass, Settings2, Sliders, AlertCircle, RefreshCw } from 'lucide-react';
import { Species, ScenarioType } from '../types';
import { SUPPORTED_SPECIES } from '../data';

interface QueryFormProps {
  selectedSpeciesId: string;
  setSelectedSpeciesId: (id: string) => void;
  latitude: number;
  setLatitude: (lat: number) => void;
  longitude: number;
  setLongitude: (lon: number) => void;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  scenario: ScenarioType;
  setScenario: (scenario: ScenarioType) => void;
  isPredicting: boolean;
  onRunPrediction: () => void;
}

// Vietnam land bounds samples for S-shaped check
const VIETNAM_LAND_SAMPLES = [
  { lat: 23.4, minLon: 103.8, maxLon: 105.5 },
  { lat: 23.0, minLon: 103.5, maxLon: 105.8 },
  { lat: 22.5, minLon: 102.5, maxLon: 106.5 },
  { lat: 22.0, minLon: 102.1, maxLon: 107.3 },
  { lat: 21.5, minLon: 102.8, maxLon: 107.9 },
  { lat: 21.0, minLon: 103.5, maxLon: 107.2 },
  { lat: 20.5, minLon: 104.1, maxLon: 106.6 },
  { lat: 20.0, minLon: 104.0, maxLon: 106.1 },
  { lat: 19.5, minLon: 104.1, maxLon: 105.8 },
  { lat: 19.0, minLon: 104.4, maxLon: 105.9 },
  { lat: 18.5, minLon: 105.2, maxLon: 106.4 },
  { lat: 18.0, minLon: 105.5, maxLon: 106.5 },
  { lat: 17.5, minLon: 105.8, maxLon: 106.8 },
  { lat: 17.0, minLon: 106.1, maxLon: 107.3 },
  { lat: 16.5, minLon: 106.2, maxLon: 107.7 },
  { lat: 16.0, minLon: 107.1, maxLon: 108.3 },
  { lat: 15.5, minLon: 107.3, maxLon: 109.0 },
  { lat: 15.0, minLon: 107.4, maxLon: 109.1 },
  { lat: 14.5, minLon: 107.4, maxLon: 109.2 },
  { lat: 14.0, minLon: 107.4, maxLon: 109.3 },
  { lat: 13.5, minLon: 107.3, maxLon: 109.3 },
  { lat: 13.0, minLon: 107.2, maxLon: 109.4 },
  { lat: 12.5, minLon: 107.1, maxLon: 109.4 },
  { lat: 12.0, minLon: 107.1, maxLon: 109.3 },
  { lat: 11.5, minLon: 107.0, maxLon: 109.1 },
  { lat: 11.0, minLon: 106.4, maxLon: 108.7 },
  { lat: 10.5, minLon: 104.9, maxLon: 108.1 },
  { lat: 10.0, minLon: 104.8, maxLon: 107.3 },
  { lat: 9.5, minLon: 104.8, maxLon: 106.7 },
  { lat: 9.0, minLon: 104.8, maxLon: 106.4 },
  { lat: 8.5, minLon: 104.7, maxLon: 105.5 },
  { lat: 8.18, minLon: 104.7, maxLon: 105.2 }
];

function isWithinVietnam(lat: number, lon: number): boolean {
  if (lat >= 8.60 && lat <= 8.75 && lon >= 106.50 && lon <= 106.70) return true; // Con Dao
  if (lat >= 10.0 && lat <= 10.5 && lon >= 103.85 && lon <= 104.15) return true; // Phu Quoc
  if (lat < 8.18 || lat > 23.39 || lon < 102.14 || lon > 109.50) return false;

  let upper = VIETNAM_LAND_SAMPLES[0];
  let lower = VIETNAM_LAND_SAMPLES[VIETNAM_LAND_SAMPLES.length - 1];
  for (let i = 0; i < VIETNAM_LAND_SAMPLES.length - 1; i++) {
    if (lat <= VIETNAM_LAND_SAMPLES[i].lat && lat >= VIETNAM_LAND_SAMPLES[i + 1].lat) {
      upper = VIETNAM_LAND_SAMPLES[i];
      lower = VIETNAM_LAND_SAMPLES[i + 1];
      break;
    }
  }
  const range = upper.lat - lower.lat;
  if (range === 0) return lon >= upper.minLon && lon <= upper.maxLon;
  const factor = (lat - lower.lat) / range;
  const minLon = lower.minLon + factor * (upper.minLon - lower.minLon);
  const maxLon = lower.maxLon + factor * (upper.maxLon - lower.maxLon);
  return lon >= minLon && lon <= maxLon;
}

export default function QueryForm({
  selectedSpeciesId,
  setSelectedSpeciesId,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  radiusKm,
  setRadiusKm,
  scenario,
  setScenario,
  isPredicting,
  onRunPrediction,
}: QueryFormProps) {
  const selectedSpecies = SUPPORTED_SPECIES.find((s) => s.id === selectedSpeciesId) || SUPPORTED_SPECIES[0];

  const isLatValid = latitude >= 8.18 && latitude <= 23.39;
  const isLonValid = longitude >= 102.14 && longitude <= 109.50;
  const isLocationValid = isWithinVietnam(latitude, longitude);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 flex flex-col gap-5 h-full">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Sliders className="w-5 h-5 text-emerald-600" />
        <h2 className="text-sm font-semibold text-slate-800 font-display">
          Cấu hình Tham số Dự báo Sinh cảnh
        </h2>
      </div>

      {/* 1. Select Species */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-emerald-600" />
          Loài sinh vật mục tiêu
        </label>
        <select
          value={selectedSpeciesId}
          onChange={(e) => setSelectedSpeciesId(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
        >
          {SUPPORTED_SPECIES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.scientificName})
            </option>
          ))}
        </select>
        <p className="text-[11px] text-slate-500 italic mt-0.5 leading-relaxed bg-slate-50 border border-slate-100/50 p-2.5 rounded-lg">
          {selectedSpecies.description}
        </p>
      </div>

      {/* 2. Set Coordinates */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            Vĩ độ (Latitude)
          </label>
          <input
            type="number"
            step="0.000001"
            min={8.18}
            max={23.39}
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
            className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:ring-2 transition-all ${
              isLatValid
                ? 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                : 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500'
            }`}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            Kinh độ (Longitude)
          </label>
          <input
            type="number"
            step="0.000001"
            min={102.14}
            max={109.50}
            value={longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
            className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-sm text-slate-700 font-mono focus:outline-none focus:ring-2 transition-all ${
              isLonValid
                ? 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
                : 'border-red-300 bg-red-50 focus:ring-red-500/20 focus:border-red-500'
            }`}
          />
        </div>
      </div>

      {!isLocationValid && (
        <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-2 text-[11px] leading-relaxed text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <div>
            <strong>Ngoài phạm vi lãnh thổ:</strong> Tọa độ đã chọn nằm ngoài đất liền Việt Nam, ngoài khơi xa, hoặc thuộc quốc gia lân cận. Hãy click chọn lại tọa độ trong vùng đất liền/đảo ven bờ của Việt Nam (Vĩ độ: 8.18° - 23.39°, Kinh độ: 102.14° - 109.50°).
          </div>
        </div>
      )}

      {/* 3. Search Radius Buffer */}
      <div className="flex flex-col gap-2 bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-600">Bán kính vùng đệm (R)</span>
          <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[11px]">
            {radiusKm} km
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={radiusKm}
          onChange={(e) => setRadiusKm(parseInt(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
          <span>1 km</span>
          <span>50 km</span>
          <span>100 km</span>
        </div>
      </div>

      {/* 4. Select Optimization Scenario */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
          <Settings2 className="w-3.5 h-3.5 text-emerald-600" />
          Kịch bản tối ưu hóa ứng dụng
        </label>
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value as ScenarioType)}
          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
        >
          <option value="CONSERVATION">Bảo tồn toàn diện (Ưu tiên Recall, t* = 0.45)</option>
          <option value="PATROL">Tiết kiệm chi phí tuần tra (Ưu tiên Precision, t* = 0.60)</option>
        </select>
        <div className="text-[10px] text-slate-500 leading-normal">
          {scenario === 'CONSERVATION' ? (
            <span className="text-emerald-700">
              💡 <strong>Bảo tồn diện rộng (Recall):</strong> Ngưỡng cắt thấp hơn để không bỏ sót bất kỳ vùng sinh cảnh tiềm năng nào của loài nguy cấp.
            </span>
          ) : (
            <span className="text-amber-700">
              💡 <strong>Tuần tra tiết kiệm (Precision):</strong> Ngưỡng cắt cao hơn giúp tập trung chính xác nguồn lực tuần tra vào các sinh cảnh cốt lõi nhất.
            </span>
          )}
        </div>
      </div>

      {/* 5. Run Prediction Button */}
      <button
        onClick={onRunPrediction}
        disabled={isPredicting || !isLocationValid}
        className={`w-full font-semibold py-3 px-4 rounded-xl shadow-md cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 text-sm text-white ${
          isPredicting || !isLocationValid
            ? 'bg-slate-300 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:scale-[1.01] active:scale-[0.99]'
        }`}
      >
        {isPredicting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Đang chạy mô hình sinh thái...</span>
          </>
        ) : (
          <>
            <Compass className="w-4 h-4" />
            <span>Chạy Dự báo Sinh cảnh</span>
          </>
        )}
      </button>
    </div>
  );
}
