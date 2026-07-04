/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QueryForm from './components/QueryForm';
import InteractiveMap from './components/InteractiveMap';
import PredictionResult from './components/PredictionResult';
import { Species, ScenarioType, PredictionResult as ResultType } from './types';
import { SUPPORTED_SPECIES } from './data';
import { TreePine, Info, HelpCircle, FileDown, ShieldCheck, MapPin, Compass } from 'lucide-react';

// S-shaped Vietnam land check
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

export default function App() {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('sao_la');
  // Initialize to a real mountainous forest coordinate in Thua Thien Hue, Vietnam (Truong Son Range)
  const [latitude, setLatitude] = useState<number>(16.220);
  const [longitude, setLongitude] = useState<number>(107.680);
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [scenario, setScenario] = useState<ScenarioType>('CONSERVATION');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<ResultType | null>(null);
  const [predictedPoints, setPredictedPoints] = useState<{ lat: number; lon: number; score: number }[]>([]);

  const selectedSpecies = SUPPORTED_SPECIES.find((s) => s.id === selectedSpeciesId) || SUPPORTED_SPECIES[0];

  // Helper to generate coordinates in a circular grid around a center coordinate
  const generateCircularGridPoints = (centerLat: number, centerLon: number, radiusKm: number, speciesId: string) => {
    const points: { lat: number; lon: number; score: number }[] = [];
    const count = 15; // 15 grid points for spatial raster representation
    
    // Seeded random helper based on species and coordinate to keep it stable
    const seedRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count;
      // Convert km radius to rough degrees (1 degree lat is approx 111km, lon is approx 107km at 16 degrees North)
      const randomFactor = 0.3 + 0.7 * seedRandom(centerLat * i + centerLon);
      const distDegrees = (radiusKm / 111) * randomFactor;
      
      const pLat = parseFloat((centerLat + distDegrees * Math.sin(angle)).toFixed(6));
      const pLon = parseFloat((centerLon + distDegrees * Math.cos(angle)).toFixed(6));

      // Skip generated point if it falls in the sea or outside Vietnam
      if (!isWithinVietnam(pLat, pLon)) {
        continue;
      }

      // Calculate a slightly varied suitability score for this grid cell
      const cellSeed = pLat * 10 + pLon * 5;
      const noise = seedRandom(cellSeed) * 0.3 - 0.15; // [-0.15, 0.15]
      
      // Let's make cells closer to historical points have higher scores
      let distToCore = 1.0;
      if (speciesId === 'sao_la') distToCore = Math.sqrt(Math.pow(pLat - 16.22, 2) + Math.pow(pLon - 107.68, 2));
      else if (speciesId === 'voi_asia') distToCore = Math.sqrt(Math.pow(pLat - 12.8, 2) + Math.pow(pLon - 107.8, 2));
      else if (speciesId === 'vooc_cha_va') distToCore = Math.sqrt(Math.pow(pLat - 16.1, 2) + Math.pow(pLon - 108.2, 2));
      else if (speciesId === 'vuon_soc_den') distToCore = Math.sqrt(Math.pow(pLat - 22.8, 2) + Math.pow(pLon - 106.5, 2));
      else if (speciesId === 'ho_dong_duong') distToCore = Math.sqrt(Math.pow(pLat - 22.3, 2) + Math.pow(pLon - 102.3, 2));

      let cellScore = 0.85 * Math.exp(-distToCore / 0.8) + noise;
      cellScore = Math.max(0.1, Math.min(0.98, cellScore));

      points.push({
        lat: pLat,
        lon: pLon,
        score: parseFloat(cellScore.toFixed(4)),
      });
    }

    return points;
  };

  // Run the ecological predictor model
  const handleRunPrediction = async () => {
    setIsPredicting(true);
    setPredictionResult(null);
    setPredictedPoints([]);

    try {
      // Query the backend Express server
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          speciesId: selectedSpeciesId,
          latitude,
          longitude,
          radiusKm,
          scenario,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối đến máy chủ dự báo sinh cảnh.');
      }

      const result = await response.json();
      
      // Artificial delay (800ms) for high-quality computational model processing vibe
      setTimeout(() => {
        setPredictionResult(result);
        if (result.isValidLocation) {
          const grid = generateCircularGridPoints(latitude, longitude, radiusKm, selectedSpeciesId);
          setPredictedPoints(grid);
        }
        setIsPredicting(false);
      }, 800);

    } catch (error) {
      console.error('Error running prediction:', error);
      setIsPredicting(false);
    }
  };

  // Run prediction once on initial load to populate the page beautifully
  useEffect(() => {
    handleRunPrediction();
  }, [selectedSpeciesId]); // Automatically re-predict if species changes

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans antialiased text-slate-800">
      <Header isAdminMode={isAdminMode} setIsAdminMode={setIsAdminMode} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* Layout: Top Interactive Map & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar parameters form */}
          <div className="lg:col-span-1">
            <QueryForm
              selectedSpeciesId={selectedSpeciesId}
              setSelectedSpeciesId={setSelectedSpeciesId}
              latitude={latitude}
              setLatitude={setLatitude}
              longitude={longitude}
              setLongitude={setLongitude}
              radiusKm={radiusKm}
              setRadiusKm={setRadiusKm}
              scenario={scenario}
              setScenario={setScenario}
              isPredicting={isPredicting}
              onRunPrediction={handleRunPrediction}
            />
          </div>

          {/* Map display */}
          <div className="lg:col-span-2">
            <InteractiveMap
              latitude={latitude}
              longitude={longitude}
              radiusKm={radiusKm}
              selectedSpecies={selectedSpecies}
              isAdminMode={isAdminMode}
              onCoordinatesChange={(lat, lon) => {
                setLatitude(lat);
                setLongitude(lon);
              }}
              predictedPoints={predictedPoints}
            />
          </div>
        </div>

        {/* Layout: Bottom Results */}
        <div className="w-full">
          <PredictionResult result={predictionResult} selectedSpeciesId={selectedSpeciesId} />
        </div>
      </main>

      {/* Footer credits */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-semibold text-slate-400">
            <TreePine className="w-4 h-4 text-emerald-500" />
            <span>Vietnam Wildlife Conservation GIS Core System</span>
          </div>
          <p className="font-sans leading-normal text-slate-500">
            Dự án nghiên cứu thử nghiệm • Thiết kế cấu trúc dựa trên Phương pháp Tư duy Máy tính (Decomposition, Pattern Recognition, Abstraction, Algorithm)
          </p>
          <div className="text-slate-500 font-mono text-[10px]">
            Lãnh thổ: Việt Nam (Đất liền & Đảo ven bờ)
          </div>
        </div>
      </footer>
    </div>
  );
}
