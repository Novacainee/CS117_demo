/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, XCircle, Activity, Thermometer, ShieldCheck, Mountain, AlertCircle, Droplet, Navigation, Milestone } from 'lucide-react';
import { PredictionResult as ResultType } from '../types';
import { SUPPORTED_SPECIES } from '../data';

interface PredictionResultProps {
  result: ResultType | null;
  selectedSpeciesId: string;
}

export default function PredictionResult({ result, selectedSpeciesId }: PredictionResultProps) {
  const species = SUPPORTED_SPECIES.find((s) => s.id === selectedSpeciesId) || SUPPORTED_SPECIES[0];

  if (!result) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
        <Activity className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-700">Chưa có kết quả dự báo</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          Hãy thiết lập các cấu hình tham số địa lý ở bảng điều khiển bên trái rồi nhấn "Chạy Dự báo Sinh cảnh".
        </p>
      </div>
    );
  }

  if (!result.isValidLocation) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-sm font-bold text-red-800">Ngoài phạm vi Việt Nam</h3>
        <p className="text-xs text-red-600 mt-2 max-w-xs leading-relaxed">
          {result.message}
        </p>
      </div>
    );
  }

  const scorePct = Math.round(result.suitabilityScore * 100);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-semibold text-slate-800 font-display">
            Kết quả Phân tích Sinh cảnh vĩ mô
          </h2>
        </div>
        <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">
          HSS Predictor v1.0
        </span>
      </div>

      {/* Score gauge */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 border border-slate-100 p-4.5 rounded-2xl">
        <div className="relative flex items-center justify-center shrink-0">
          {/* Circular progress bar SVG */}
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="#e2e8f0"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke={result.isSuitable ? '#10b981' : '#f59e0b'}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={301.6}
              strokeDashoffset={301.6 - (301.6 * result.suitabilityScore)}
              className="transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-800">
              {result.suitabilityScore.toFixed(4)}
            </span>
            <span className="block text-[9px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              SCORE (HSS)
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {result.isSuitable ? (
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ĐẠT NGƯỠNG SINH CẢNH CỐT LÕI
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-amber-600" />
                KHÔNG PHÙ HỢP
              </span>
            )}
            <span className="text-xs text-slate-400 font-mono">
              (Ngưỡng cắt t* = {result.cutOffThreshold})
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
            {result.message}
          </p>
          <p className="text-[10px] text-slate-400 font-sans leading-normal">
            * Điểm số phù hợp sinh cảnh (Habitat Suitability Score) phản ánh mức độ thuận lợi về địa lý, thảm thực vật NDVI, độ dốc địa hình và khí hậu tại khu vực được chọn.
          </p>
        </div>
      </div>

      {/* Environmental Features Grid */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
          Thuộc tính Môi trường trích xuất (Raster Sampling)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Mountain className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-semibold text-slate-500">Độ cao (Elevation)</span>
            </div>
            <span className="text-sm font-bold font-mono text-slate-800">
              {result.features.elevation} m
            </span>
            <span className="text-[9px] text-slate-400">
              (Yêu cầu: {species.preferredElevation[0]}-{species.preferredElevation[1]}m)
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] font-semibold text-slate-500">Nhiệt độ (Temp)</span>
            </div>
            <span className="text-sm font-bold font-mono text-slate-800">
              {result.features.temperature} °C
            </span>
            <span className="text-[9px] text-slate-400">
              (Yêu cầu: {species.preferredTemp[0]}-{species.preferredTemp[1]}°C)
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Droplet className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-[10px] font-semibold text-slate-500">Thảm thực vật (NDVI)</span>
            </div>
            <span className="text-sm font-bold font-mono text-slate-800">
              {result.features.ndvi}
            </span>
            <span className="text-[9px] text-slate-400">
              (Yêu cầu: {species.preferredNdvi[0]}-{species.preferredNdvi[1]})
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Milestone className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[10px] font-semibold text-slate-500">Gần đường bộ</span>
            </div>
            <span className="text-sm font-bold font-mono text-slate-800">
              {result.features.distanceToRoad.toLocaleString()} m
            </span>
            <span className="text-[9px] text-slate-400">
              (Càng xa đường bộ càng tốt)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-semibold text-slate-500">Độ dốc (Slope)</span>
            </div>
            <span className="text-sm font-bold font-mono text-slate-800">
              {result.features.slope}°
            </span>
            <span className="text-[9px] text-slate-400">
              (Thích nghi: {species.preferredSlope[0]}-{species.preferredSlope[1]}°)
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Navigation className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[10px] font-semibold text-slate-500">Hướng sườn Aspect_sin</span>
            </div>
            <span className="text-sm font-bold font-mono text-slate-800">
              {result.features.aspectSin}
            </span>
            <span className="text-[9px] text-slate-400">
              Hướng góc thô: {result.features.aspect}°
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Navigation className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[10px] font-semibold text-slate-500">Hướng sườn Aspect_cos</span>
            </div>
            <span className="text-sm font-bold font-mono text-slate-800">
              {result.features.aspectCos}
            </span>
            <span className="text-[9px] text-slate-400">
              Mã hóa hướng lượng giác tuần hoàn
            </span>
          </div>
        </div>
      </div>

      {/* Multicollinearity VIF Alert */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          Kiểm soát Đa Cộng Tuyến VIF (Multicollinearity Check)
        </div>
        <p className="text-[10px] text-amber-800 leading-normal">
          Thuộc tính <strong>Nhiệt độ (Temperature)</strong> và <strong>Cao độ (Elevation)</strong> có độ tự tương quan vật lý cực kỳ cao ($R^2 \approx 0.96$). Thuật toán huấn luyện tự động phát hiện Temperature có <strong>VIF = 25.1 (&gt; 20)</strong> và đã thực hiện <strong>loại bỏ (dropped)</strong> nhằm triệt tiêu nhiễu sai số và tránh rò rỉ thông tin toán học.
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          {result.vifInfo.map((info) => (
            <span
              key={info.featureName}
              className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${
                info.status === 'ACCEPTED'
                  ? 'bg-emerald-100/50 text-emerald-800 border-emerald-200'
                  : 'bg-red-100/50 text-red-800 border-red-200 line-through'
              }`}
            >
              <span>{info.featureName}: {info.vif.toFixed(1)}</span>
              <span className="text-[8px] font-sans opacity-70">
                ({info.status === 'ACCEPTED' ? 'Đạt' : 'Bỏ'})
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
