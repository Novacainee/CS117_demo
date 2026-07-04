/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QueryForm from './components/QueryForm';
import InteractiveMap from './components/InteractiveMap';
import PredictionResult from './components/PredictionResult';
import PipelineRunner from './components/PipelineRunner';
import { Species, ScenarioType, PredictionResult as ResultType } from './types';
import { SUPPORTED_SPECIES } from './data';
import { predictHabitat, isWithinVietnam } from './predictEngine';
import { TreePine, Info, HelpCircle, FileDown, ShieldCheck, MapPin, Compass } from 'lucide-react';



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

  // Run the ecological predictor model (client-side — no backend required)
  const handleRunPrediction = () => {
    setIsPredicting(true);
    setPredictionResult(null);
    setPredictedPoints([]);

    // Run prediction entirely client-side
    const result = predictHabitat(selectedSpeciesId, latitude, longitude, radiusKm, scenario);

    // Artificial delay (800ms) for high-quality computational model processing vibe
    setTimeout(() => {
      setPredictionResult(result);
      if (result.isValidLocation) {
        const grid = generateCircularGridPoints(latitude, longitude, radiusKm, selectedSpeciesId);
        setPredictedPoints(grid);
      }
      setIsPredicting(false);
    }, 800);
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

        {/* Computational Thinking Training Console section */}
        <div className="w-full">
          <PipelineRunner selectedSpecies={selectedSpecies} scenario={scenario} />
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
