/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Eye, EyeOff, TreePine, Map, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
}

export default function Header({ isAdminMode, setIsAdminMode }: HeaderProps) {
  return (
    <header className="bg-emerald-950 border-b border-emerald-900 text-white py-4 px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-inner flex items-center justify-center animate-pulse">
            <TreePine className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border border-emerald-500/30">
                CS117 - Computational Thinking
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> PROTOTYPE DEMO
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-emerald-50 text-shadow-sm">
              Mô hình Dự báo Sinh cảnh Động vật Nguy cấp tại Việt Nam
            </h1>
            <p className="text-xs text-emerald-300 font-sans mt-0.5 max-w-2xl">
              Hệ thống WebGIS ước lượng xác suất phân bố không gian P(Y=1 | X) sử dụng Spatial Thinning, Lọc đa cộng tuyến VIF và Stacking Ensemble.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-emerald-900/40 border border-emerald-800/60 rounded-xl p-1.5 px-3">
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${isAdminMode ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="text-xs font-medium text-emerald-100">
              Chế độ Kiểm lâm (Ranger Admin):
            </span>
          </div>
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 shadow cursor-pointer ${
              isAdminMode
                ? 'bg-amber-500 hover:bg-amber-400 text-emerald-950 hover:scale-[1.02]'
                : 'bg-emerald-800/80 hover:bg-emerald-700 text-emerald-300 border border-emerald-700/50 hover:scale-[1.02]'
            }`}
          >
            {isAdminMode ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Đang Bật (Exact Coords)</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Đang Tắt (Blurred Coords)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
