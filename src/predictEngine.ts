/**
 * Client-side Habitat Suitability Prediction Engine
 * Extracted from server.ts to enable static GitHub Pages deployment.
 * All computation runs entirely in the browser — no backend required.
 */

import type { ScenarioType } from './types';

// Vietnam geographical boundary samples for S-shaped land check
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
  { lat: 8.18, minLon: 104.7, maxLon: 105.2 },
];

export function isWithinVietnam(lat: number, lon: number): boolean {
  // Con Dao check
  if (lat >= 8.60 && lat <= 8.75 && lon >= 106.50 && lon <= 106.70) {
    return true;
  }
  // Phu Quoc check
  if (lat >= 10.0 && lat <= 10.5 && lon >= 103.85 && lon <= 104.15) {
    return true;
  }

  if (lat < 8.18 || lat > 23.39 || lon < 102.14 || lon > 109.50) {
    return false;
  }

  // Find the interval in VIETNAM_LAND_SAMPLES
  let upper = VIETNAM_LAND_SAMPLES[0];
  let lower = VIETNAM_LAND_SAMPLES[VIETNAM_LAND_SAMPLES.length - 1];

  for (let i = 0; i < VIETNAM_LAND_SAMPLES.length - 1; i++) {
    if (lat <= VIETNAM_LAND_SAMPLES[i].lat && lat >= VIETNAM_LAND_SAMPLES[i + 1].lat) {
      upper = VIETNAM_LAND_SAMPLES[i];
      lower = VIETNAM_LAND_SAMPLES[i + 1];
      break;
    }
  }

  // Interpolate minLon and maxLon
  const range = upper.lat - lower.lat;
  if (range === 0) {
    return lon >= upper.minLon && lon <= upper.maxLon;
  }

  const factor = (lat - lower.lat) / range;
  const minLon = lower.minLon + factor * (upper.minLon - lower.minLon);
  const maxLon = lower.maxLon + factor * (upper.maxLon - lower.maxLon);

  return lon >= minLon && lon <= maxLon;
}

// Simulated environmental raster extraction based on geographical modeling
function extractEnvironmentalFeatures(lat: number, lon: number) {
  let elevation = 15; // default plain
  let slope = 1.5;

  // 1. Northwest Mountains proximity
  const nwDist = Math.sqrt(Math.pow(lat - 22.3, 2) + Math.pow(lon - 103.5, 2));
  if (nwDist < 2.0) {
    elevation = Math.max(elevation, (1 - nwDist / 2.0) * 2800 + 100);
    slope = Math.max(slope, (1 - nwDist / 2.0) * 42 + 5);
  }

  // 2. Truong Son Mountains (approximate ridge line)
  const pts: [number, number][] = [
    [19.5, 104.5],
    [18.2, 105.3],
    [16.5, 107.2],
    [15.0, 107.8],
    [12.5, 108.0],
  ];
  let minDistToRidge = 999;
  for (const pt of pts) {
    const dist = Math.sqrt(Math.pow(lat - pt[0], 2) + Math.pow(lon - pt[1], 2));
    if (dist < minDistToRidge) {
      minDistToRidge = dist;
    }
  }

  if (minDistToRidge < 1.5) {
    const factor = 1 - minDistToRidge / 1.5;
    elevation = Math.max(elevation, factor * 1400 + 150);
    slope = Math.max(slope, factor * 30 + 10);
  }

  // 3. Tay Nguyen Plateau
  const tnDist = Math.sqrt(Math.pow(lat - 12.8, 2) + Math.pow(lon - 107.9, 2));
  if (tnDist < 1.8) {
    const factor = 1 - tnDist / 1.8;
    elevation = Math.max(elevation, factor * 800 + 300);
    slope = Math.max(slope, factor * 12 + 2);
  }

  // Add micro-topographical noise
  const hash = Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453;
  const noise = hash - Math.floor(hash);
  elevation = Math.round(elevation + noise * 40 - 20);
  elevation = Math.max(elevation, 5);

  slope = parseFloat((slope + noise * 6 - 3).toFixed(1));
  slope = Math.max(slope, 0.5);

  const aspect = Math.round(noise * 359);
  const aspectSin = parseFloat(Math.sin((aspect * Math.PI) / 180).toFixed(4));
  const aspectCos = parseFloat(Math.cos((aspect * Math.PI) / 180).toFixed(4));

  // NDVI
  let ndvi = 0.15;
  if (elevation > 150) {
    ndvi = 0.55 + (elevation / 3000) * 0.35 + (noise * 0.1 - 0.05);
  } else {
    ndvi = 0.3 + noise * 0.15;
  }
  ndvi = parseFloat(Math.max(-0.1, Math.min(0.98, ndvi)).toFixed(3));

  // Temperature
  const baseTemp = 28.0 - (lat - 8.5) * 0.3;
  let temperature = baseTemp - 0.0065 * elevation + (noise * 1.5 - 0.75);
  temperature = parseFloat(Math.max(5, Math.min(38, temperature)).toFixed(1));

  // Distance to road
  let distanceToRoad = 120 + noise * 200;
  if (elevation > 200) {
    distanceToRoad = (elevation - 150) * 8 + noise * 800;
  }
  distanceToRoad = Math.round(Math.max(10, distanceToRoad));

  return {
    elevation,
    slope,
    aspect,
    aspectSin,
    aspectCos,
    ndvi,
    temperature,
    distanceToRoad,
  };
}

// Calculate Gaussian preference match
function gaussianMatch(value: number, minPref: number, maxPref: number): number {
  const center = (minPref + maxPref) / 2;
  const range = maxPref - minPref;
  const stdev = range / 3;
  if (stdev === 0) return 1;
  return Math.exp(-Math.pow(value - center, 2) / (2 * Math.pow(stdev, 2)));
}

// Species habitat preference profiles
const SPECIES_PROFILES: Record<
  string,
  {
    prefElevation: [number, number];
    prefTemp: [number, number];
    prefNdvi: [number, number];
    prefSlope: [number, number];
    distCenter: [number, number];
    distWeight: number;
  }
> = {
  sao_la: {
    prefElevation: [200, 1200],
    prefTemp: [18, 24],
    prefNdvi: [0.65, 0.95],
    prefSlope: [15, 45],
    distCenter: [17.5, 106.1],
    distWeight: 0.5,
  },
  voi_asia: {
    prefElevation: [100, 800],
    prefTemp: [22, 28],
    prefNdvi: [0.55, 0.85],
    prefSlope: [2, 18],
    distCenter: [12.8, 107.8],
    distWeight: 0.4,
  },
  vooc_cha_va: {
    prefElevation: [50, 600],
    prefTemp: [20, 26],
    prefNdvi: [0.6, 0.9],
    prefSlope: [10, 35],
    distCenter: [16.1, 108.2],
    distWeight: 0.6,
  },
  vuon_soc_den: {
    prefElevation: [400, 1000],
    prefTemp: [16, 22],
    prefNdvi: [0.7, 0.9],
    prefSlope: [20, 50],
    distCenter: [22.8, 106.5],
    distWeight: 0.8,
  },
  ho_dong_duong: {
    prefElevation: [300, 1500],
    prefTemp: [18, 25],
    prefNdvi: [0.6, 0.9],
    prefSlope: [10, 30],
    distCenter: [22.3, 102.3],
    distWeight: 0.4,
  },
};

/**
 * Main prediction function — runs entirely client-side.
 * Replaces the server-side POST /api/predict endpoint.
 */
export function predictHabitat(
  speciesId: string,
  latitude: number,
  longitude: number,
  radiusKm: number,
  scenario: ScenarioType
) {
  const isValid = isWithinVietnam(latitude, longitude);
  if (!isValid) {
    return {
      isValidLocation: false,
      suitabilityScore: 0,
      isSuitable: false,
      cutOffThreshold: 0.5,
      features: {
        elevation: 0,
        slope: 0,
        aspect: 0,
        aspectSin: 0,
        aspectCos: 0,
        ndvi: 0,
        temperature: 0,
        distanceToRoad: 0,
      },
      vifInfo: [],
      message: 'Tọa độ ngoài ranh giới lãnh thổ Việt Nam hoặc vùng biển xa bờ.',
    };
  }

  // Extract environmental features
  const features = extractEnvironmentalFeatures(latitude, longitude);

  const profile = SPECIES_PROFILES[speciesId] || SPECIES_PROFILES.sao_la;

  // Calculate environmental suitability score
  const matchElev = gaussianMatch(features.elevation, profile.prefElevation[0], profile.prefElevation[1]);
  const matchTemp = gaussianMatch(features.temperature, profile.prefTemp[0], profile.prefTemp[1]);
  const matchNdvi = gaussianMatch(features.ndvi, profile.prefNdvi[0], profile.prefNdvi[1]);
  const matchSlope = gaussianMatch(features.slope, profile.prefSlope[0], profile.prefSlope[1]);

  // Spatial distribution proximity weight
  const dist = Math.sqrt(
    Math.pow(latitude - profile.distCenter[0], 2) + Math.pow(longitude - profile.distCenter[1], 2)
  );
  const distMatch = Math.exp(-dist / (profile.distWeight * 4));

  // Combine suitability
  let baseScore =
    matchElev * 0.3 + matchTemp * 0.2 + matchNdvi * 0.25 + matchSlope * 0.15 + distMatch * 0.1;
  baseScore = Math.max(0, Math.min(1, baseScore));

  // Determine dynamic threshold based on scenario
  let cutOffThreshold = 0.5;
  if (scenario === 'CONSERVATION') {
    cutOffThreshold = 0.45;
  } else if (scenario === 'PATROL') {
    cutOffThreshold = 0.6;
  }

  // Adjust score slightly based on search radius
  if (radiusKm > 30) {
    baseScore = baseScore * 0.95 + 0.02;
  }

  const suitabilityScore = parseFloat(baseScore.toFixed(4));
  const isSuitable = suitabilityScore >= cutOffThreshold;

  // Simulated VIF Multicollinearity information
  const vifInfo = [
    { featureName: 'Elevation', vif: 24.3, status: 'ACCEPTED' as const },
    { featureName: 'Temperature', vif: 25.1, status: 'REJECTED' as const },
    { featureName: 'NDVI', vif: 4.8, status: 'ACCEPTED' as const },
    { featureName: 'Slope', vif: 3.2, status: 'ACCEPTED' as const },
    { featureName: 'Aspect_sin', vif: 1.1, status: 'ACCEPTED' as const },
    { featureName: 'Aspect_cos', vif: 1.1, status: 'ACCEPTED' as const },
    { featureName: 'Distance-to-road', vif: 2.8, status: 'ACCEPTED' as const },
  ];

  return {
    isValidLocation: true,
    suitabilityScore,
    isSuitable,
    cutOffThreshold,
    features,
    vifInfo,
    message: isSuitable
      ? 'Sinh cảnh thích hợp lý tưởng cho quần thể tự nhiên phát triển ổn định.'
      : 'Điều kiện môi trường vĩ mô chưa đạt chỉ số phù hợp tối thiểu để thiết lập quần thể sinh học lâu dài.',
  };
}
