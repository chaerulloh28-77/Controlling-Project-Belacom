import React from 'react';
import { 
  CheckCircle2, 
  RotateCw, 
  Search, 
  User, 
  LogOut, 
  RefreshCw,
  Activity
} from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';

export const Header: React.FC = () => {
  const { 
    currentUserEmail, 
    logout, 
    autoSaveStatus, 
    lastSavedTime,
    filters,
    setFilters,
    resetAllData
  } = useProjectContext();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
      
      {/* Left Title & Status */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0"></span>
              CONTROLLING PROJECT BELACOM
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Sistem Informasi Operasional & Manajemen WO Telecom
          </p>
        </div>

        {/* Real-time Auto-save Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-full text-xs font-mono">
          {autoSaveStatus === 'saving' ? (
            <>
              <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
              <span className="text-amber-300 font-medium">Menyimpan...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-emerald-300 font-medium">Tersimpan Otomatis</span>
              <span className="text-slate-500 text-[10px]">({lastSavedTime})</span>
            </>
          )}
        </div>
      </div>

      {/* Middle Global Search */}
      <div className="flex-1 max-w-xs lg:max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari WO, PIC, area, tim, atau nomor surat..."
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 text-xs text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 outline-none transition-all focus:ring-1 focus:ring-cyan-500"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Demo Data */}
        <button
          onClick={() => {
            if (confirm('Atur ulang seluruh data ke sampel awal Belacom?')) {
              resetAllData();
            }
          }}
          className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs border border-slate-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Reset Sampel Data"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="hidden xl:inline text-xs font-medium">Reset Data</span>
        </button>

        {/* User Info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 truncate max-w-[140px]" title={currentUserEmail || 'Operator Belacom'}>
              {currentUserEmail || 'Operator Belacom'}
            </p>
            <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 inline" /> Operational Controller
            </p>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer ml-1"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </header>
  );
};
