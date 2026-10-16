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
  Layers,
  Activity,
  MousePointerClick
} from 'lucide-react';
import { useProjectContext, DrilldownFilter } from '../context/ProjectContext';
import { PieChart, PieChartDataItem } from '../components/PieChart';
import { StatCard } from '../components/StatCard';
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
  const releaseDates = dailyReports.map(r => r.releaseDate).sort();
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

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-cyan-500/5 blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider font-semibold">
              <Activity className="w-4 h-4" /> Real-Time Analytics Dashboard
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Ringkasan Performa Controlling Project Belacom
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Klik pada elemen grafik pie chart atau kartu statistik untuk membuka informasi detail & akurat setiap kategori WO, BAST, RFS, dan Invoice.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs">
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">TOTAL PENAGIHAN LUNAS</span>
              <span className="text-emerald-400 font-extrabold text-sm">
                Rp {penagihanList.filter(p => p.statusPenagihan === 'Lunas').reduce((acc, c) => acc + c.totalNominalRupiah, 0).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Main Cards: Total WO & Total Project */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* TOTAL WO Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">TOTAL WO (WORK ORDER)</h3>
                <p className="text-xs text-slate-400">Statistik Rilis & Jenis Pekerjaan</p>
              </div>
            </div>
            <span className="text-3xl font-black text-cyan-400 font-mono">{totalWoCount}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleStatCardClick('Month Release WO', 'wo', monthReleaseList[0] || '2026-10')}
              className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-left hover:border-cyan-500/50 transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-slate-500 font-mono block">MONTH RELEASE WO</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block truncate">
                {monthReleaseList.join(', ') || '-'}
              </span>
            </button>

            <button
              onClick={() => handleStatCardClick('Variasi WO', 'wo', 'All Types')}
              className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-left hover:border-cyan-500/50 transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-slate-500 font-mono block">VARIASI KATEGORI WO</span>
              <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                {woTypesCount} Jenis WO
              </span>
            </button>

            <button
              onClick={() => handleStatCardClick('WO Number Count', 'wo', 'WO Numbers')}
              className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-left hover:border-cyan-500/50 transition-colors cursor-pointer"
            >
              <span className="text-[10px] text-slate-500 font-mono block">WO NUMBER LIST</span>
              <span className="text-xs font-bold text-cyan-400 mt-0.5 block font-mono">
                {totalWoCount} Nomor Terdaftar
              </span>
            </button>
          </div>
        </div>

        {/* TOTAL PROJECT Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">TOTAL PROJECT</h3>
                <p className="text-xs text-slate-400">Lokasi, Batal & Rentang Tanggal Eksekusi</p>
              </div>
            </div>
            <span className="text-3xl font-black text-blue-400 font-mono">{totalProjectsCount}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">AREA / LOCATION</span>
              <span className="font-bold text-slate-200 truncate block mt-0.5">{areasList.join(', ') || '-'}</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">PROJECT CANCEL</span>
              <span className="font-bold text-rose-400 block mt-0.5">{cancelledProjectsCount} Project</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">START DATE</span>
              <span className="font-bold text-cyan-400 block mt-0.5">{startDates[0] || '-'}</span>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">FINISH DATE</span>
              <span className="font-bold text-emerald-400 block mt-0.5">{finishDates[finishDates.length - 1] || '-'}</span>
            </div>
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
          onSliceClick={(slice) => handleStatCardClick('Status WO', 'statusWo', slice.label)}
        />

        {/* Pie Chart 2: Status Project */}
        <PieChart
          title="STATUS PROJECT TEAM"
          data={statusProjectData}
          centerText={dailyReports.length.toString()}
          centerSubtext="Total Project"
          onSliceClick={(slice) => handleStatCardClick('Status Project', 'statusProject', slice.label)}
        />

        {/* Pie Chart 3: BAST */}
        <PieChart
          title="STATUS BAST (BERITA ACARA)"
          data={bastData}
          centerText={bastList.length.toString()}
          centerSubtext="Total BAST"
          onSliceClick={(slice) => handleStatCardClick('BAST Status', 'bast', slice.label)}
        />

        {/* Pie Chart 4: RFS */}
        <PieChart
          title="STATUS RFS (READY FOR SERVICE)"
          data={rfsData}
          centerText={rfsList.length.toString()}
          centerSubtext="Total RFS"
          onSliceClick={(slice) => handleStatCardClick('RFS Status', 'rfs', slice.label)}
        />

        {/* Pie Chart 5: Invoice */}
        <PieChart
          title="STATUS INVOICE"
          data={invoiceData}
          centerText={invoices.length.toString()}
          centerSubtext="Total Invoice"
          onSliceClick={(slice) => handleStatCardClick('Invoice Status', 'invoice', slice.label)}
        />

        {/* Penagihan Quick Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" /> STATUS PENAGIHAN
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                13 Item Paket
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Berkas Lengkap Penagihan Ke Klien</p>
          </div>

          <div className="space-y-2 my-4">
            {penagihanList.map((p) => (
              <div key={p.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="font-bold text-white block">{p.billingCode}</span>
                  <span className="text-[10px] text-slate-500">WO: {p.woNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">Rp {p.totalNominalRupiah.toLocaleString('id-ID')}</span>
                  <span className="text-[10px] text-cyan-400">{p.statusPenagihan}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 font-mono text-center pt-2 border-t border-slate-800">
            Terintegrasi dengan seluruh BAST, Invoice, & Daily Report
          </div>
        </div>

      </div>

      {/* Drilldown Modal */}
      <DetailFilterModal
        filter={drilldownFilter}
        onClose={() => setDrilldownFilter(null)}
      />

    </div>
  );
};
