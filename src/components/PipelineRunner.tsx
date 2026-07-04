/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, Terminal, Play, Check, FolderDown, HardDrive, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { PipelineStepLog, TrainingMetrics, RasterBandInfo, Species } from '../types';

interface PipelineRunnerProps {
  selectedSpecies: Species;
  scenario: 'CONSERVATION' | 'PATROL';
}

export default function PipelineRunner({ selectedSpecies, scenario }: PipelineRunnerProps) {
  const [logs, setLogs] = useState<PipelineStepLog[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [trainingMetrics, setTrainingMetrics] = useState<TrainingMetrics | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const [rasterBands, setRasterBands] = useState<RasterBandInfo[]>([
    { name: 'DEM elevation (Cao độ)', resolution: '1km (30 arc-sec)', source: 'USGS SRTM v4.1', status: 'NOT_DOWNLOADED', sizeMb: 42.5, filePath: './environmental_rasters/vietnam_elev_1km.tif' },
    { name: 'NDVI Vegetation (Thảm phủ)', resolution: '250m grid', source: 'NASA MODIS Terra', status: 'NOT_DOWNLOADED', sizeMb: 118.2, filePath: './environmental_rasters/vietnam_ndvi_250m.tif' },
    { name: 'Temperature bio1 (Nhiệt độ)', resolution: '1km (30 arc-sec)', source: 'WorldClim v2.1', status: 'NOT_DOWNLOADED', sizeMb: 24.1, filePath: './environmental_rasters/vietnam_bio1_temp.tif' },
    { name: 'Distance to roads (Hạ tầng)', resolution: '500m grid', source: 'OpenStreetMap OSM', status: 'NOT_DOWNLOADED', sizeMb: 85.7, filePath: './environmental_rasters/vietnam_roads_distance.tif' },
  ]);

  const addLog = (module: PipelineStepLog['module'], message: string, level: PipelineStepLog['level'] = 'INFO') => {
    const newLog: PipelineStepLog = {
      timestamp: new Date().toLocaleTimeString(),
      module,
      message,
      level,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // 1. Simulate Raster Download Ingestion
  const handleDownloadRasters = () => {
    if (isDownloading || isTraining) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    setLogs([]);
    addLog('DATA_INGESTION', 'Bắt đầu quá trình thu thập tệp tin địa lý Raster mẫu...', 'INFO');

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setDownloadProgress(currentProgress);

      if (currentProgress === 15) {
        addLog('DATA_INGESTION', 'Đang tạo thư mục lưu trữ cục bộ: ./environmental_rasters/', 'INFO');
        setRasterBands(prev => prev.map((b, i) => i === 0 ? { ...b, status: 'DOWNLOADING' } : b));
      } else if (currentProgress === 35) {
        addLog('DATA_INGESTION', 'Tải xuống thành công DEM elevation (USGS SRTM). Kích thước: 42.5MB', 'SUCCESS');
        setRasterBands(prev => prev.map((b, i) => i === 0 ? { ...b, status: 'READY' } : i === 1 ? { ...b, status: 'DOWNLOADING' } : b));
      } else if (currentProgress === 60) {
        addLog('DATA_INGESTION', 'Tải xuống thành công NDVI Vegetation (NASA MODIS). Kích thước: 118.2MB', 'SUCCESS');
        setRasterBands(prev => prev.map((b, i) => i === 1 ? { ...b, status: 'READY' } : i === 2 ? { ...b, status: 'DOWNLOADING' } : b));
      } else if (currentProgress === 80) {
        addLog('DATA_INGESTION', 'Tải xuống thành công Temperature bio1 (WorldClim v2.1). Kích thước: 24.1MB', 'SUCCESS');
        setRasterBands(prev => prev.map((b, i) => i === 2 ? { ...b, status: 'READY' } : i === 3 ? { ...b, status: 'DOWNLOADING' } : b));
      } else if (currentProgress === 95) {
        addLog('DATA_INGESTION', 'Tải xuống thành công Distance-to-roads (OSM). Kích thước: 85.7MB', 'SUCCESS');
        setRasterBands(prev => prev.map((b, i) => i === 3 ? { ...b, status: 'READY' } : b));
      } else if (currentProgress >= 100) {
        clearInterval(interval);
        setIsDownloading(false);
        addLog('DATA_INGESTION', 'QUÁ TRÌNH INGESTION HOÀN TẤT. Hệ thống sẵn sàng trích xuất đặc trưng sinh cảnh!', 'SUCCESS');
      }
    }, 150);
  };

  // 2. Simulate Spatial Thinning and Stacking training pipeline
  const handleRunPipeline = () => {
    if (isTraining || isDownloading) return;
    setIsTraining(true);
    setTrainingMetrics(null);
    setLogs([]);

    const steps = [
      {
        module: 'PREPROCESSING' as const,
        message: 'Khởi chạy Đường ống Huấn luyện Độc lập cho loài: ' + selectedSpecies.name,
        level: 'INFO' as const,
        delay: 0,
      },
      {
        module: 'PREPROCESSING' as const,
        message: 'Đang tải dữ liệu thực địa (Presence Points) từ hệ thống cơ sở dữ liệu...',
        level: 'INFO' as const,
        delay: 600,
      },
      {
        module: 'PREPROCESSING' as const,
        message: 'Áp dụng thuật toán Lọc Thưa Không Gian (Spatial Thinning) để triệt tiêu thiên lệch thu mẫu...',
        level: 'INFO' as const,
        delay: 1300,
      },
      {
        module: 'PREPROCESSING' as const,
        message: 'Loại bỏ điểm trùng lặp trong ô lưới 1kmx1km: Rút giảm thành công từ 85 điểm ➔ 41 điểm vĩ độ/kinh độ duy nhất!',
        level: 'SUCCESS' as const,
        delay: 2000,
      },
      {
        module: 'PREPROCESSING' as const,
        message: 'Áp dụng ràng buộc sinh thái: Cao độ [0 - 1500]m và cách điểm hiện diện tối thiểu 2km để sinh 82 mẫu vắng mặt giả định (Pseudo-absence). Tỷ lệ mẫu 1:2.',
        level: 'SUCCESS' as const,
        delay: 2800,
      },
      {
        module: 'FEATURE_EXTRACTION' as const,
        message: 'Trích xuất giá trị Raster tại các điểm dữ liệu (Raster Spatial Sampling). Đang ánh xạ lớp phủ thảm thực vật NDVI, độ cao DEM, khoảng cách đường bộ...',
        level: 'INFO' as const,
        delay: 3600,
      },
      {
        module: 'FEATURE_EXTRACTION' as const,
        message: 'Mã hóa hướng sườn tuần hoàn (Aspect cyclic trigonometric encoding) thành sin(Aspect) và cos(Aspect)...',
        level: 'INFO' as const,
        delay: 4200,
      },
      {
        module: 'FEATURE_EXTRACTION' as const,
        message: 'Kiểm tra hiện tượng Đa cộng tuyến (VIF). Phát hiện biến Temperature có hệ số phóng đại VIF = 25.1 (> 20.0). Tiến hành loại bỏ khỏi bộ đặc trưng!',
        level: 'WARNING' as const,
        delay: 5000,
      },
      {
        module: 'MODEL_TRAINING' as const,
        message: 'Thực thi chia khối không gian độc lập (Spatial Block CV) 2°x2° để chống rò rỉ thông tin tự tương quan không gian (Spatial Autocorrelation).',
        level: 'INFO' as const,
        delay: 5800,
      },
      {
        module: 'MODEL_TRAINING' as const,
        message: 'Bắt đầu huấn luyện Stacking Ensemble: Base models XGBoost & LightGBM đang được tối ưu hóa siêu tham số bằng Optuna...',
        level: 'INFO' as const,
        delay: 6600,
      },
      {
        module: 'MODEL_TRAINING' as const,
        message: 'Mô hình tổng hợp Meta-learner Logistic Regression đã khớp trọng số phân chia phi tuyến hoàn tất!',
        level: 'SUCCESS' as const,
        delay: 7500,
      },
      {
        module: 'POST_PROCESSING' as const,
        message: 'Tối ưu hóa ngưỡng động t* dựa trên điểm F2-score ưu tiên kịch bản ' + (scenario === 'CONSERVATION' ? 'Bảo tồn diện rộng (t* = 0.45)' : 'Tiết kiệm chi phí (t* = 0.60)'),
        level: 'SUCCESS' as const,
        delay: 8200,
      },
      {
        module: 'POST_PROCESSING' as const,
        message: 'Lưu trữ tệp mô hình đã huấn luyện thành công: ./dist/models/' + selectedSpecies.id + '_ensemble.bin',
        level: 'SUCCESS' as const,
        delay: 8800,
      },
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        addLog(step.module, step.message, step.level);
      }, step.delay);
    });

    // Complete Training
    setTimeout(() => {
      setIsTraining(false);
      setTrainingMetrics({
        accuracy: 0.885,
        recall: scenario === 'CONSERVATION' ? 0.912 : 0.813,
        precision: scenario === 'CONSERVATION' ? 0.841 : 0.925,
        f2Score: 0.898,
        originalPointsCount: 85,
        thinnedPointsCount: 41,
        pseudoAbsencesCount: 82,
        featuresUsed: ['Elevation', 'Slope', 'Aspect_sin', 'Aspect_cos', 'NDVI', 'Distance-to-road'],
      });
      addLog('MODEL_TRAINING', 'ĐƯỜNG ỐNG HUẤN LUYỆN ĐÃ CHẠY HOÀN TẤT VỚI ĐỘ CHÍNH XÁC KIỂM THỬ ĐẠT CHỈ TIÊU (88.5% > 85.0%)!', 'SUCCESS');
    }, 9400);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-xl border border-slate-800 p-5 flex flex-col gap-5 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400 animate-spin-slow" />
          <div>
            <h2 className="text-sm font-semibold font-display tracking-tight text-white">
              Computational Thinking Pipeline Console
            </h2>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Phân rã (Decomposition) & Điều hành mô phỏng tự động hóa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadRasters}
            disabled={isDownloading || isTraining}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-300 shadow cursor-pointer ${
              isDownloading || isTraining
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-[1.02]'
            }`}
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-300" />
                <span>Đang tải: {downloadProgress}%</span>
              </>
            ) : (
              <>
                <FolderDown className="w-3.5 h-3.5" />
                <span>Thu thập Raster mở</span>
              </>
            )}
          </button>

          <button
            onClick={handleRunPipeline}
            disabled={isTraining || isDownloading}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-300 shadow cursor-pointer ${
              isTraining || isDownloading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02]'
            }`}
          >
            {isTraining ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                <span>Đang chạy...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Huấn luyện mô hình</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Raster band statuses */}
        <div className="lg:col-span-1 bg-slate-950 rounded-xl p-4 border border-slate-800/80 flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            Thư viện Raster Môi trường
          </h3>

          <div className="flex flex-col gap-2.5">
            {rasterBands.map((band) => (
              <div key={band.name} className="bg-slate-900 border border-slate-800/60 rounded-lg p-2.5 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[11px] font-semibold text-slate-200 truncate">{band.name}</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                      band.status === 'READY'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : band.status === 'DOWNLOADING'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                    }`}>
                      {band.status === 'READY' ? 'Sẵn sàng' : band.status === 'DOWNLOADING' ? 'Đang tải' : 'Chưa tải'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-0.5">Nguồn: {band.source} • {band.resolution}</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5 bg-slate-950/60 px-1.5 py-0.5 rounded select-all truncate">
                    {band.filePath}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live console screen */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            Terminal Pipeline Logs
          </h3>

          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 font-mono text-[10px] h-[240px] overflow-y-auto flex flex-col gap-1.5 shadow-inner">
            {logs.length === 0 ? (
              <div className="text-slate-600 italic flex items-center justify-center h-full">
                &gt; Nhấn nút "Huấn luyện mô hình" hoặc "Thu thập Raster mở" để xem tiến trình thực thi toán học...
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                  <span className={`shrink-0 font-bold ${
                    log.module === 'PREPROCESSING' ? 'text-blue-400' :
                    log.module === 'FEATURE_EXTRACTION' ? 'text-purple-400' :
                    log.module === 'MODEL_TRAINING' ? 'text-emerald-400' :
                    log.module === 'DATA_INGESTION' ? 'text-indigo-400' : 'text-amber-400'
                  }`}>
                    {log.module}:
                  </span>
                  <span className={
                    log.level === 'SUCCESS' ? 'text-emerald-300 font-semibold' :
                    log.level === 'WARNING' ? 'text-amber-300 font-semibold' :
                    log.level === 'ERROR' ? 'text-red-400 font-semibold' : 'text-slate-300'
                  }>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Metrics board */}
      {trainingMetrics && (
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4.5 flex flex-col gap-3.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Chỉ số Mô hình Huấn luyện Không gian (Spatial Cross-Validation Metrics)
            </h4>
            <span className="text-[9px] font-mono text-slate-500">
              Kiểm định theo Block địa lý 2°x2° (Group Hold-out)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-2.5 text-center">
              <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Độ chính xác (Accuracy)</span>
              <span className="text-xl font-bold font-mono text-white">{(trainingMetrics.accuracy * 100).toFixed(1)}%</span>
              <span className="block text-[8px] text-emerald-500 mt-0.5">Tiêu chuẩn: &ge; 85%</span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-2.5 text-center">
              <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Khả năng phát hiện (Recall)</span>
              <span className="text-xl font-bold font-mono text-emerald-400">{(trainingMetrics.recall * 100).toFixed(1)}%</span>
              <span className="block text-[8px] text-slate-500 mt-0.5">Ưu tiên bảo tồn</span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-2.5 text-center">
              <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Độ tin cậy (Precision)</span>
              <span className="text-xl font-bold font-mono text-amber-400">{(trainingMetrics.precision * 100).toFixed(1)}%</span>
              <span className="block text-[8px] text-slate-500 mt-0.5">Tối ưu lực lượng tuần tra</span>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/50 rounded-lg p-2.5 text-center">
              <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Chỉ số tổ hợp F2-Score</span>
              <span className="text-xl font-bold font-mono text-white">{(trainingMetrics.f2Score * 100).toFixed(1)}%</span>
              <span className="block text-[8px] text-slate-500 mt-0.5">F2-score (beta = 2)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-850">
            <div className="flex items-center gap-3 font-mono">
              <span>Điểm thực địa ban đầu: <strong>{trainingMetrics.originalPointsCount}</strong></span>
              <span>➔</span>
              <span>Sau khi lọc thưa (1km): <strong className="text-emerald-400">{trainingMetrics.thinnedPointsCount}</strong></span>
              <span>➔</span>
              <span>Pseudo-absences (1:2): <strong className="text-indigo-400">{trainingMetrics.pseudoAbsencesCount}</strong></span>
            </div>
            <div className="text-slate-500">
              Biến giữ lại: {trainingMetrics.featuresUsed.join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
