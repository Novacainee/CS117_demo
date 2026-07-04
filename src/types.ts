/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Species {
  id: string;
  name: string;
  scientificName: string;
  iucnStatus: 'CR' | 'EN' | 'VU' | 'NT' | 'LC';
  statusLabel: string;
  description: string;
  preferredElevation: [number, number]; // [min, max] in meters
  preferredTemp: [number, number]; // [min, max] in °C
  preferredNdvi: [number, number]; // [min, max] (vegetation index)
  preferredSlope: [number, number]; // [min, max] in degrees
  isHighlySensitive: boolean; // True for CR species where detail coords should be blurred
}

export type ScenarioType = 'CONSERVATION' | 'PATROL';

export interface PredictionQuery {
  speciesId: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  scenario: ScenarioType;
}

export interface EnvironmentalFeatures {
  elevation: number;
  slope: number;
  aspect: number;
  aspectSin: number;
  aspectCos: number;
  ndvi: number;
  temperature: number;
  distanceToRoad: number;
}

export interface FeatureVifInfo {
  featureName: string;
  vif: number;
  status: 'ACCEPTED' | 'REJECTED';
}

export interface PredictionResult {
  query: PredictionQuery;
  suitabilityScore: number;
  isSuitable: boolean;
  cutOffThreshold: number;
  features: EnvironmentalFeatures;
  vifInfo: FeatureVifInfo[];
  isValidLocation: boolean;
  message: string;
}

export interface PipelineStepLog {
  timestamp: string;
  module: 'PREPROCESSING' | 'FEATURE_EXTRACTION' | 'MODEL_TRAINING' | 'POST_PROCESSING' | 'DATA_INGESTION';
  message: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface TrainingMetrics {
  accuracy: number;
  recall: number;
  precision: number;
  f2Score: number;
  originalPointsCount: number;
  thinnedPointsCount: number;
  pseudoAbsencesCount: number;
  featuresUsed: string[];
}

export interface RasterBandInfo {
  name: string;
  resolution: string;
  source: string;
  status: 'NOT_DOWNLOADED' | 'DOWNLOADING' | 'READY';
  sizeMb: number;
  filePath: string;
}
