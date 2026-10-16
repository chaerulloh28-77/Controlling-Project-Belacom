import React from 'react';
import { 
  FileSpreadsheet, 
  FolderKanban, 
  CheckSquare, 
  Receipt, 
  FileCheck2, 
  CreditCard, 
  TrendingUp,
  MapPin,
  Calendar,
  CalendarDays,
  Layers,
  Activity,
  MousePointerClick,
  Sparkles,
  AlertOctagon,
  CheckCircle2,
  Flag,
  Hash,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { useProjectContext, DrilldownFilter } from '../context/ProjectContext';
import { PieChart, PieChartDataItem } from '../components/PieChart';
import { DetailFilterModal } from '../components/DetailFilterModal';

export const DashboardOverviewPage: React.FC = () => {
  const { 
    dailyReports, 
    bastList, 
    invoices, 
    rfsList, 
    penagihanList,
    drilldownFilter,
    setDrilldownFilter
  } = useProjectContext();

  // 1. Total WO Stats
  const totalWoCount = dailyReports.length;
  const monthReleaseList = Array.from(new Set(dailyReports.map(r => r.monthReleaseWo)));
  const woTypesCount = Array.from(new Set(dailyReports.map(r => r.woType))).length;

  // 2. Total Project Stats
  const totalProjectsCount = dailyReports.length;
  const areasList = Array.from(new Set(dailyReports.map(r => r.assignment)));
  const cancelledProjectsCount = dailyReports.filter(r => r.statusWo === 'Cancel').length;

  // Earliest release date & latest finish date
  const startDates = dailyReports.map(r => r.startDate).sort();
  const finishDates = dailyReports.map(r => r.finishDate).sort();

  // 3. Status WO Breakdown (Not Yet, In Progress, Cancel, Done)
  const statusWoData: PieChartDataItem[] = [
    { label: 'Not Yet', value: dailyReports.filter(r => r.statusWo === 'Not Yet').length, color: '#64748b' },
    { label: 'In Progress', value: dailyReports.filter(r => r.statusWo === 'In Progress').length, color: '#06b6d4' },
    { label: 'Done', value: dailyReports.filter(r => r.statusWo === 'Done').length, color: '#10b981' },
    { label: 'Cancel', value: dailyReports.filter(r => r.statusWo === 'Cancel').length, color: '#f43f5e' }
  ];

  // 4. Status Project Breakdown (Not Yet, In Progress, Cancel, Done)
  const statusProjectData: PieChartDataItem[] = [
    { label: 'Not Yet', value: dailyReports.filter(r => r.statusTeamProject === 'Not Yet').length, color: '#64748b' },
    { label: 'In Progress', value: dailyReports.filter(r => r.statusTeamProject === 'On Schedule' || r.statusTeamProject === 'Waiting Schedule').length, color: '#3b82f6' },
    { label: 'Done', value: dailyReports.filter(r => r.statusWo === 'Done').length, color: '#10b981' },
    { label: 'Cancel', value: dailyReports.filter(r => r.statusWo === 'Cancel').length, color: '#f43f5e' }
  ];

  // 5. BAST Breakdown (Not Yet, Submit, Done)
  const bastData: PieChartDataItem[] = [
    { label: 'Not Yet', value: bastList.filter(b => b.statusBast === 'Not Yet').length, color: '#64748b' },
    { label: 'Submit', value: bastList.filter(b => b.statusBast === 'Submit').length, color: '#06b6d4' },
    { label: 'Done', value: bastList.filter(b => b.statusBast === 'Done').length, color: '#10b981' }
  ];

  // 6. RFS Breakdown (Not Yet, Submit, Done)
  const rfsData: PieChartDataItem[] = [
    { label: 'Not Yet', value: rfsList.filter(r => r.statusRfs === 'Not Yet').length, color: '#64748b' },
    { label: 'Submit', value: rfsList.filter(r => r.statusRfs === 'Submit').length, color: '#06b6d4' },
    { label: 'Done', value: rfsList.filter(r => r.statusRfs === 'Done').length, color: '#10b981' }
  ];

  // 7. Invoice Breakdown (Not Yet, Submit, Revision, Done)
  const invoiceData: PieChartDataItem[] = [
    { label: 'Not Yet', value: invoices.filter(i => i.statusInvoice === 'Not Yet').length, color: '#64748b' },
    { label: 'Submit', value: invoices.filter(i => i.statusInvoice === 'Submit').length, color: '#06b6d4' },
    { label: 'Revision', value: invoices.filter(i => i.statusInvoice === 'Revision').length, color: '#f59e0b' },
    { label: 'Done', value: invoices.filter(i => i.statusInvoice === 'Done').length, color: '#10b981' }
  ];

  const handleStatCardClick = (title: string, category: DrilldownFilter['category'], value: string) => {
    setDrilldownFilter({ title, category, value });
  };

  const totalNominalLunas = penagihanList
    .filter(p => p.statusPenagihan === 'Lunas')
    .reduce((acc, c) => acc + c.totalNominalRupiah, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-8 select-none">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-cyan-500/10 blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold">
              <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
              </span>
              <span>Real-Time Controlling Dashboard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 flex items-center gap-2">
              Ringkasan Operasional Project Belacom
              <Sparkles className="w-5 h-5 text-amber-400 hidden sm:inline" />
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Setiap elemen kartu dan grafik dapat diklik untuk membuka rincian data yang akurat, real-time, dan terintegrasi lintas modul.
            </p>
          </div>

          {/* Clickable Total Penagihan Lunas Badge */}
          <button
            onClick={() => handleStatCardClick('Paket Penagihan Lunas', 'penagihan', 'Lunas')}
            className="flex items-center gap-3 bg-slate-950/90 hover:bg-slate-900 p-3.5 rounded-xl border border-slate-800 hover:border-emerald-500/50 font-mono text-xs transition-all cursor-pointer group/badge active:scale-95 shadow-lg shadow-emerald-950/20 text-left"
            title="Klik untuk membuka rincian paket penagihan yang telah lunas"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover/badge:scale-110 group-hover/badge:rotate-6 transition-all duration-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>TOTAL PENAGIHAN LUNAS</span>
                <ArrowUpRight className="w-3 h-3 text-emerald-400 group-hover/badge:translate-x-0.5 group-hover/badge:-translate-y-0.5 transition-transform" />
              </div>
              <span className="text-emerald-400 font-extrabold text-sm sm:text-base block">
                Rp {totalNominalLunas.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-slate-500 block">Klik untuk rincian</span>
            </div>
          </button>
        </div>
      </div>

      {/* Top Main Cards: Total WO & Total Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* TOTAL WO Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-cyan-500/50 transition-all duration-200 flex flex-col justify-between">
          <div 
            onClick={() => handleStatCardClick('Daftar Seluruh Work Order (WO)', 'wo', 'Semua WO')}
            className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 cursor-pointer group/woheader"
            title="Klik untuk melihat seluruh Work Order"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-400 rounded-xl border border-cyan-500/30 group-hover/woheader:scale-110 group-hover/woheader:rotate-6 transition-all duration-200 shadow-md shadow-cyan-950/40">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white group-hover/woheader:text-cyan-300 transition-colors">
                    TOTAL WO (WORK ORDER)
                  </h3>
                  <ChevronRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover/woheader:opacity-100 group-hover/woheader:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Statistik Rilis, Kategori & Uraian Kerja</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-cyan-400 font-mono block group-hover/woheader:scale-105 transition-transform">{totalWoCount}</span>
              <span className="text-[10px] text-cyan-500 font-mono">Klik rincian</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleStatCardClick('Month Release WO', 'wo', monthReleaseList[0] || '2026-10')}
              className="p-3 bg-slate-950/90 rounded-xl border border-slate-800/80 text-left hover:border-cyan-500/50 hover:bg-slate-850/80 transition-all duration-150 cursor-pointer group active:scale-95 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase">MONTH RELEASE</span>
                <Calendar className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-bold text-white block truncate">
                {monthReleaseList.join(', ') || '-'}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono mt-1 block">Rincian Per Bulan →</span>
            </button>

            <button
              onClick={() => handleStatCardClick('Variasi Kategori WO', 'wo', 'All Types')}
              className="p-3 bg-slate-950/90 rounded-xl border border-slate-800/80 text-left hover:border-cyan-500/50 hover:bg-slate-850/80 transition-all duration-150 cursor-pointer group active:scale-95 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase">VARIASI KATEGORI</span>
                <Layers className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-bold text-white block">
                {woTypesCount} Jenis WO
              </span>
              <span className="text-[10px] text-cyan-400 font-mono mt-1 block">Rincian Kategori →</span>
            </button>

            <button
              onClick={() => handleStatCardClick('Daftar Nomor WO', 'wo', 'WO Numbers')}
              className="p-3 bg-slate-950/90 rounded-xl border border-slate-800/80 text-left hover:border-cyan-500/50 hover:bg-slate-850/80 transition-all duration-150 cursor-pointer group active:scale-95 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase">NOMOR WO</span>
                <Hash className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-bold text-cyan-400 block font-mono">
                {totalWoCount} Nomor
              </span>
              <span className="text-[10px] text-cyan-400 font-mono mt-1 block">Lihat Seluruh WO →</span>
            </button>
          </div>
        </div>

        {/* TOTAL PROJECT Card - 100% Interactive & Precise */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-blue-500/50 transition-all duration-200 flex flex-col justify-between">
          <div 
            onClick={() => handleStatCardClick('Ringkasan Seluruh Project Belacom', 'project', 'Semua Project Aktif')}
            className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 cursor-pointer group/projheader"
            title="Klik untuk membuka rincian seluruh proyek"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-blue-400 rounded-xl border border-blue-500/30 group-hover/projheader:scale-110 group-hover/projheader:rotate-6 transition-all duration-200 shadow-md shadow-blue-950/40">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white group-hover/projheader:text-blue-300 transition-colors">
                    TOTAL PROJECT
                  </h3>
                  <ChevronRight className="w-4 h-4 text-blue-400 opacity-0 group-hover/projheader:opacity-100 group-hover/projheader:translate-x-1 transition-all" />
                </div>
                <p className="text-xs text-slate-400">Area, Proyek Batal, Mulai & Target Selesai</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-blue-400 font-mono block group-hover/projheader:scale-105 transition-transform">{totalProjectsCount}</span>
              <span className="text-[10px] text-blue-400 font-mono">Klik rincian</span>
            </div>
          </div>

          {/* Interactive Item Grid for Total Project */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            
            {/* 1. AREA / LOCATION - Clickable */}
            <button
              type="button"
              onClick={() => handleStatCardClick('Distribusi Area & Lokasi Project', 'area', areasList.join(', '))}
              className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-850/80 transition-all duration-150 text-left cursor-pointer group active:scale-95 shadow-sm"
              title="Klik untuk membuka rincian proyek per area penugasan"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">AREA / LOKASI</span>
                <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-bold text-white truncate block group-hover:text-cyan-300 transition-colors">
                {areasList.join(', ') || '-'}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono mt-1.5 block">
                {areasList.length} Area Terdaftar →
              </span>
            </button>

            {/* 2. PROJECT CANCEL - Clickable */}
            <button
              type="button"
              onClick={() => handleStatCardClick('Daftar Project Dibatalkan (Cancel)', 'cancel', `${cancelledProjectsCount} Project`)}
              className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 hover:border-rose-500/60 hover:bg-slate-850/80 transition-all duration-150 text-left cursor-pointer group active:scale-95 shadow-sm"
              title="Klik untuk melihat rincian project yang dibatalkan"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">PROJECT BATAL</span>
                <div className="p-1 rounded-md bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                  <AlertOctagon className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-bold text-rose-400 block group-hover:scale-105 transition-transform">
                {cancelledProjectsCount} Project
              </span>
              <span className="text-[10px] text-rose-400/80 font-mono mt-1.5 block">
                Lihat Alasan Batal →
              </span>
            </button>

            {/* 3. START DATE - Clickable */}
            <button
              type="button"
              onClick={() => handleStatCardClick('Jadwal Pelaksanaan Proyek (Start Date)', 'timeline', 'Jadwal Mulai Kerja')}
              className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-850/80 transition-all duration-150 text-left cursor-pointer group active:scale-95 shadow-sm"
              title="Klik untuk melihat timeline jadwal mulai kerja"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">START DATE</span>
                <div className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-bold text-cyan-400 block truncate group-hover:text-cyan-300 transition-colors">
                {startDates[0] || '-'}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono mt-1.5 block">
                Timeline Mulai →
              </span>
            </button>

            {/* 4. FINISH DATE - Clickable */}
            <button
              type="button"
              onClick={() => handleStatCardClick('Target Penyelesaian Proyek (Finish Date)', 'finishDate', 'Target Selesai')}
              className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-850/80 transition-all duration-150 text-left cursor-pointer group active:scale-95 shadow-sm"
              title="Klik untuk melihat batas waktu & target selesai proyek"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">FINISH DATE</span>
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Flag className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-bold text-emerald-400 block truncate group-hover:text-emerald-300 transition-colors">
                {finishDates[finishDates.length - 1] || '-'}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono mt-1.5 block">
                Target Selesai →
              </span>
            </button>

          </div>
        </div>

      </div>

      {/* Interactive Pie Charts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Pie Chart 1: Status WO */}
        <PieChart
          title="STATUS WO (WORK ORDER)"
          data={statusWoData}
          centerText={dailyReports.length.toString()}
          centerSubtext="Total WO"
          onSliceClick={(slice) => handleStatCardClick(`Status WO: ${slice.label}`, 'statusWo', slice.label)}
        />

        {/* Pie Chart 2: Status Project Team */}
        <PieChart
          title="STATUS PROJECT TEAM"
          data={statusProjectData}
          centerText={dailyReports.length.toString()}
          centerSubtext="Total Project"
          onSliceClick={(slice) => handleStatCardClick(`Status Project: ${slice.label}`, 'statusProject', slice.label)}
        />

        {/* Pie Chart 3: BAST */}
        <PieChart
          title="STATUS BAST (BERITA ACARA)"
          data={bastData}
          centerText={bastList.length.toString()}
          centerSubtext="Total BAST"
          onSliceClick={(slice) => handleStatCardClick(`Status BAST: ${slice.label}`, 'bast', slice.label)}
        />

        {/* Pie Chart 4: RFS */}
        <PieChart
          title="STATUS RFS (READY FOR SERVICE)"
          data={rfsData}
          centerText={rfsList.length.toString()}
          centerSubtext="Total RFS"
          onSliceClick={(slice) => handleStatCardClick(`Status RFS: ${slice.label}`, 'rfs', slice.label)}
        />

        {/* Pie Chart 5: Invoice */}
        <PieChart
          title="STATUS INVOICE (TAGIHAN)"
          data={invoiceData}
          centerText={invoices.length.toString()}
          centerSubtext="Total Invoice"
          onSliceClick={(slice) => handleStatCardClick(`Status Invoice: ${slice.label}`, 'invoice', slice.label)}
        />

        {/* Penagihan Quick Interactive Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-purple-500/40 transition-all duration-200">
          <div className="border-b border-slate-800 pb-3">
            <div 
              onClick={() => handleStatCardClick('Status Paket Penagihan 13 Dokumen', 'penagihan', 'Semua Paket Penagihan')}
              className="flex items-center justify-between cursor-pointer group/penheader"
            >
              <h3 className="text-sm font-bold text-white flex items-center gap-2 group-hover/penheader:text-purple-300 transition-colors">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover/penheader:scale-110 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span>STATUS PENAGIHAN</span>
              </h3>
              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 group-hover/penheader:bg-purple-500/20 transition-all">
                13 Item Paket
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Berkas Lengkap Penagihan Ke Klien</p>
          </div>

          {/* Clickable billing packages */}
          <div className="space-y-2 my-4">
            {penagihanList.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleStatCardClick(`Rincian Paket Penagihan ${p.billingCode}`, 'penagihan', p.billingCode)}
                className="w-full p-2.5 bg-slate-950/90 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-purple-500/40 flex items-center justify-between text-xs font-mono transition-all duration-150 cursor-pointer text-left group active:scale-98 shadow-sm"
              >
                <div>
                  <span className="font-bold text-white block group-hover:text-purple-300 transition-colors">{p.billingCode}</span>
                  <span className="text-[10px] text-slate-400">WO: {p.woNumber} • PT. BELACOM</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">Rp {p.totalNominalRupiah.toLocaleString('id-ID')}</span>
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-[10px] text-purple-400">{p.statusPenagihan}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleStatCardClick('Status Paket Penagihan 13 Dokumen', 'penagihan', 'Semua Paket Penagihan')}
            className="text-[11px] text-slate-400 hover:text-purple-300 font-mono text-center pt-2 border-t border-slate-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Buka Seluruh 13 Verifikasi Dokumen</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Drilldown Modal with Precise Data */}
      <DetailFilterModal
        filter={drilldownFilter}
        onClose={() => setDrilldownFilter(null)}
      />

    </div>
  );
};
