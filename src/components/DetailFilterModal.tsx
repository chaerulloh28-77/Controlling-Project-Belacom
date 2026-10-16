import React, { useState, useMemo } from 'react';
import { 
  X, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  User, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle,
  Search,
  Layers,
  FolderKanban,
  FileSpreadsheet,
  Receipt,
  FileCheck2,
  CreditCard,
  Hash,
  ShieldCheck,
  ChevronRight,
  Info,
  SlidersHorizontal,
  ArrowRight,
  Mail
} from 'lucide-react';
import { useProjectContext, DrilldownFilter } from '../context/ProjectContext';
import { TouchButton } from './TouchButton';
import { DailyReportItem, PenagihanItem, BASTItem, InvoiceItem, RFSItem } from '../types';

interface DetailFilterModalProps {
  filter: DrilldownFilter | null;
  onClose: () => void;
}

export const DetailFilterModal: React.FC<DetailFilterModalProps> = ({ filter, onClose }) => {
  const { 
    dailyReports, 
    bastList, 
    invoices, 
    rfsList, 
    penagihanList,
    setActiveTab 
  } = useProjectContext();

  const [modalSearch, setModalSearch] = useState('');
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<DailyReportItem | null>(null);
  const [selectedAreaTab, setSelectedAreaTab] = useState<string>('ALL');

  // Extract unique areas and months
  const allAreas = useMemo(() => Array.from(new Set(dailyReports.map(r => r.assignment))), [dailyReports]);
  const allMonths = useMemo(() => Array.from(new Set(dailyReports.map(r => r.monthReleaseWo))), [dailyReports]);
  const allWoTypes = useMemo(() => Array.from(new Set(dailyReports.map(r => r.woType))), [dailyReports]);

  if (!filter) return null;

  // Filter matched items based on category and value
  const matchedReports: DailyReportItem[] = dailyReports.filter(r => {
    // Search query within modal
    if (modalSearch) {
      const q = modalSearch.toLowerCase();
      const matchSearch = 
        r.woNumber.toLowerCase().includes(q) ||
        r.pic.toLowerCase().includes(q) ||
        r.workType.toLowerCase().includes(q) ||
        r.assignment.toLowerCase().includes(q) ||
        r.team.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    if (filter.category === 'wo') {
      if (filter.value === 'WO Numbers' || filter.value === 'All Types' || filter.value === 'Semua WO') return true;
      if (filter.value.startsWith('202')) return r.monthReleaseWo === filter.value;
      return true;
    }

    if (filter.category === 'monthRelease') {
      return r.monthReleaseWo.toLowerCase() === filter.value.toLowerCase();
    }

    if (filter.category === 'woType') {
      return r.woType.toLowerCase() === filter.value.toLowerCase();
    }

    if (filter.category === 'project') {
      return true; // All projects
    }

    if (filter.category === 'area') {
      if (selectedAreaTab !== 'ALL') {
        return r.assignment.toLowerCase() === selectedAreaTab.toLowerCase();
      }
      if (filter.value && !filter.value.includes(',')) {
        return r.assignment.toLowerCase() === filter.value.toLowerCase();
      }
      return true;
    }

    if (filter.category === 'cancel') {
      return r.statusWo.toLowerCase() === 'cancel';
    }

    if (filter.category === 'timeline') {
      return true; // sorted by start date
    }

    if (filter.category === 'finishDate') {
      return true; // sorted by finish date
    }

    if (filter.category === 'statusWo') {
      return r.statusWo.toLowerCase() === filter.value.toLowerCase();
    }

    if (filter.category === 'statusProject') {
      const v = filter.value.toLowerCase();
      if (v === 'not yet') return r.statusTeamProject === 'Not Yet';
      if (v === 'in progress') return r.statusTeamProject === 'On Schedule' || r.statusTeamProject === 'Waiting Schedule';
      if (v === 'done') return r.statusWo === 'Done';
      if (v === 'cancel') return r.statusWo === 'Cancel';
      return r.statusTeamProject.toLowerCase() === v;
    }

    return false;
  }).sort((a, b) => {
    if (filter.category === 'timeline') {
      return a.startDate.localeCompare(b.startDate);
    }
    if (filter.category === 'finishDate') {
      return b.finishDate.localeCompare(a.finishDate);
    }
    return 0;
  });

  const matchedBast: BASTItem[] = bastList.filter(b => {
    if (modalSearch) {
      const q = modalSearch.toLowerCase();
      if (!b.woNumber.toLowerCase().includes(q) && !b.workType.toLowerCase().includes(q)) return false;
    }
    if (filter.category === 'bast') {
      return b.statusBast.toLowerCase() === filter.value.toLowerCase();
    }
    return false;
  });

  const matchedInvoice: InvoiceItem[] = invoices.filter(i => {
    if (modalSearch) {
      const q = modalSearch.toLowerCase();
      if (!i.invoiceNumber.toLowerCase().includes(q) && !i.woNumber.toLowerCase().includes(q)) return false;
    }
    if (filter.category === 'invoice') {
      return i.statusInvoice.toLowerCase() === filter.value.toLowerCase();
    }
    return false;
  });

  const matchedRfs: RFSItem[] = rfsList.filter(r => {
    if (modalSearch) {
      const q = modalSearch.toLowerCase();
      if (!r.rfsNumber.toLowerCase().includes(q) && !r.woNumber.toLowerCase().includes(q)) return false;
    }
    if (filter.category === 'rfs') {
      return r.statusRfs.toLowerCase() === filter.value.toLowerCase();
    }
    return false;
  });

  const matchedPenagihan: PenagihanItem[] = penagihanList.filter(p => {
    if (modalSearch) {
      const q = modalSearch.toLowerCase();
      if (!p.billingCode.toLowerCase().includes(q) && !p.woNumber.toLowerCase().includes(q)) return false;
    }
    if (filter.category === 'penagihan') {
      if (filter.value.toLowerCase() === 'lunas') {
        return p.statusPenagihan.toLowerCase() === 'lunas';
      }
      return true;
    }
    return false;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('gmail') || s === 'submitted via gmail') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-950/30">
          <Mail className="w-3.5 h-3.5 text-blue-400" /> {status}
        </span>
      );
    }
    if (s === 'done' || s === 'lunas') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-950/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {status}
        </span>
      );
    }
    if (s === 'in progress' || s === 'submit' || s === 'on schedule' || s === 'dalam review') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm shadow-cyan-950/30">
          <Clock className="w-3.5 h-3.5 text-cyan-400" /> {status}
        </span>
      );
    }
    if (s === 'revision' || s === 'waiting schedule') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm shadow-amber-950/30">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> {status}
        </span>
      );
    }
    if (s === 'cancel' || s === 'ditolak') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm shadow-rose-950/30">
          <XCircle className="w-3.5 h-3.5 text-rose-400" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
        {status}
      </span>
    );
  };

  // Find linked documents for inspector
  const getLinkedBast = (woNumber: string) => bastList.find(b => b.woNumber === woNumber);
  const getLinkedInvoice = (woNumber: string) => invoices.find(i => i.woNumber === woNumber);
  const getLinkedRfs = (woNumber: string) => rfsList.find(r => r.woNumber === woNumber);
  const getLinkedPenagihan = (woNumber: string) => penagihanList.find(p => p.woNumber === woNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-950/40">
              {filter.category === 'project' && <FolderKanban className="w-5 h-5" />}
              {filter.category === 'area' && <MapPin className="w-5 h-5" />}
              {filter.category === 'cancel' && <XCircle className="w-5 h-5 text-rose-400" />}
              {filter.category === 'timeline' && <Calendar className="w-5 h-5" />}
              {filter.category === 'finishDate' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {filter.category === 'wo' && <FileSpreadsheet className="w-5 h-5" />}
              {filter.category === 'bast' && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
              {filter.category === 'invoice' && <Receipt className="w-5 h-5 text-amber-400" />}
              {filter.category === 'rfs' && <FileCheck2 className="w-5 h-5 text-cyan-400" />}
              {filter.category === 'penagihan' && <CreditCard className="w-5 h-5 text-purple-400" />}
              {!['project', 'area', 'cancel', 'timeline', 'finishDate', 'wo', 'bast', 'invoice', 'rfs', 'penagihan'].includes(filter.category) && (
                <SlidersHorizontal className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-[11px] font-mono uppercase tracking-wider font-semibold">
                <span>Informasi Rinci & Akurat</span>
                <span>•</span>
                <span className="text-slate-400">Kategori: {filter.category.toUpperCase()}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 flex items-center gap-2">
                <span>{filter.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                  {filter.value}
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl transition-all cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls: Quick Search & Sub-category Pills */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari dalam hasil ini..."
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 rounded-lg pl-8 pr-3 py-1.5 outline-none transition-all"
            />
          </div>

          {/* Area Filter Selector when in 'area' or 'project' category */}
          {(filter.category === 'area' || filter.category === 'project') && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Area:</span>
              <button
                onClick={() => setSelectedAreaTab('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  selectedAreaTab === 'ALL'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Semua ({dailyReports.length})
              </button>
              {allAreas.map(area => (
                <button
                  key={area}
                  onClick={() => setSelectedAreaTab(area)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    selectedAreaTab === area
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {area} ({dailyReports.filter(r => r.assignment === area).length})
                </button>
              ))}
            </div>
          )}

          {/* Quick Counter */}
          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            Menampilkan: <strong className="text-cyan-400 font-bold">{matchedReports.length + matchedBast.length + matchedInvoice.length + matchedRfs.length + matchedPenagihan.length}</strong> item
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Top Summary Bar for 'project' or 'area' */}
          {(filter.category === 'project' || filter.category === 'area') && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Project</span>
                <span className="text-lg font-bold text-white font-mono">{matchedReports.length}</span>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Total Panjang Jalur</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">
                  {matchedReports.reduce((acc, r) => acc + (r.pathLengthMeters || 0), 0).toLocaleString('id-ID')} m
                </span>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Status Selesai (Done)</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {matchedReports.filter(r => r.statusWo === 'Done').length} Project
                </span>
              </div>
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Status Batal (Cancel)</span>
                <span className="text-lg font-bold text-rose-400 font-mono">
                  {matchedReports.filter(r => r.statusWo === 'Cancel').length} Project
                </span>
              </div>
            </div>
          )}

          {/* Reports Table / List */}
          {matchedReports.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  Daftar Project & Work Order ({matchedReports.length} Item)
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Klik baris kartu untuk melihat lembar rincian komplit
                </span>
              </div>

              <div className="space-y-2.5">
                {matchedReports.map((report) => (
                  <div 
                    key={report.id} 
                    onClick={() => setSelectedProjectDetail(report)}
                    className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850/80 transition-all duration-200 cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md active:scale-99"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-cyan-400 font-mono group-hover:text-cyan-300 transition-colors">
                          {report.woNumber}
                        </span>
                        {getStatusBadge(report.statusWo)}
                        <span className="text-xs text-slate-300 font-mono bg-slate-800/90 border border-slate-700/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" /> {report.assignment}
                        </span>
                        <span className="text-xs text-slate-300 font-mono bg-slate-800/90 border border-slate-700/60 px-2 py-0.5 rounded-md">
                          Tim: <strong className="text-white">{report.team}</strong>
                        </span>
                        <span className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                          Rilis: {report.monthReleaseWo}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-100 group-hover:text-white transition-colors">
                        {report.workType}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[11px] text-slate-400 font-mono pt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-cyan-400" /> PIC: <strong className="text-slate-200">{report.pic}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" /> {report.startDate} s/d {report.finishDate} ({report.durationDays} hari kerja)
                        </span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Layers className="w-3.5 h-3.5 text-amber-400" /> Panjang: <strong className="text-white">{report.pathLengthMeters}m</strong> (Est: {report.estimatedDistanceMeters}m)
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectDetail(report);
                        }}
                        className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer group-hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                      >
                        <Info className="w-3.5 h-3.5" /> Rincian
                      </button>

                      <TouchButton
                        variant="outline"
                        size="sm"
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          setActiveTab('daily-report');
                        }}
                      >
                        Buka
                      </TouchButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BAST List */}
          {matchedBast.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Daftar Dokumen BAST Terkait ({matchedBast.length} Item)
              </h3>
              <div className="space-y-2">
                {matchedBast.map((bast) => (
                  <div key={bast.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-cyan-400 font-mono">{bast.woNumber}</span>
                        {getStatusBadge(bast.statusBast)}
                        <span className="text-xs text-slate-400 font-mono">{bast.id}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{bast.workType}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Dokumen: APD ({bast.apdPdf ? 'Tersedia' : '-'}), ABD ({bast.abdPdf ? 'Tersedia' : '-'}), Core Conn ({bast.coreConnectionPdf ? 'Tersedia' : '-'})
                      </p>
                    </div>
                    <TouchButton
                      variant="outline"
                      size="sm"
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                      onClick={() => {
                        onClose();
                        setActiveTab('bast');
                      }}
                    >
                      Buka BAST
                    </TouchButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoice List */}
          {matchedInvoice.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-400" />
                Daftar Invoice Terkait ({matchedInvoice.length} Item)
              </h3>
              <div className="space-y-2">
                {matchedInvoice.map((inv) => (
                  <div key={inv.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-cyan-400 font-mono">{inv.invoiceNumber}</span>
                        {getStatusBadge(inv.statusInvoice)}
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          Rp {inv.amountRupiah.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono">WO Ref: {inv.woNumber} • PO: {inv.poNumber}</p>
                    </div>
                    <TouchButton
                      variant="outline"
                      size="sm"
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                      onClick={() => {
                        onClose();
                        setActiveTab('invoice');
                      }}
                    >
                      Buka Invoice
                    </TouchButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RFS List */}
          {matchedRfs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                Daftar Dokumen RFS Terkait ({matchedRfs.length} Item)
              </h3>
              <div className="space-y-2">
                {matchedRfs.map((rfs) => (
                  <div key={rfs.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-cyan-400 font-mono">{rfs.rfsNumber}</span>
                        {getStatusBadge(rfs.statusRfs)}
                      </div>
                      <p className="text-xs font-semibold text-slate-200">Klien: {rfs.clientInfo.clientCompanyName}</p>
                      <p className="text-[11px] text-slate-400">PIC: {rfs.clientInfo.picName}</p>
                    </div>
                    <TouchButton
                      variant="outline"
                      size="sm"
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                      onClick={() => {
                        onClose();
                        setActiveTab('rfs');
                      }}
                    >
                      Buka RFS
                    </TouchButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Penagihan List */}
          {matchedPenagihan.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                Daftar Paket Penagihan 13 Dokumen ({matchedPenagihan.length} Paket)
              </h3>
              <div className="space-y-2.5">
                {matchedPenagihan.map((penagihan) => (
                  <div key={penagihan.id} className="p-4 bg-slate-950/90 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-purple-400 font-mono">{penagihan.billingCode}</span>
                        {getStatusBadge(penagihan.statusPenagihan)}
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          Rp {penagihan.totalNominalRupiah.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono">WO: {penagihan.woNumber} • Vendor: PT. BELACOM INDONESIA</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Kelengkapan Verifikasi: PO, BOQ, APD, ABD, Core Connection, Faktur Pajak, Surat RFS, Foto Dokumentasi
                      </p>
                    </div>
                    <TouchButton
                      variant="outline"
                      size="sm"
                      icon={<ExternalLink className="w-3.5 h-3.5" />}
                      onClick={() => {
                        onClose();
                        setActiveTab('penagihan');
                      }}
                    >
                      Buka Penagihan
                    </TouchButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedReports.length === 0 && matchedBast.length === 0 && matchedInvoice.length === 0 && matchedRfs.length === 0 && matchedPenagihan.length === 0 && (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">Tidak ada data spesifik untuk filter ini.</p>
              <p className="text-xs text-slate-500 mt-1">Gunakan kotak pencarian atau atur kembali filter data.</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Sistem Informasi Operasional Belacom • Real-Time Data Sync
          </span>
          <TouchButton variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </TouchButton>
        </div>

      </div>

      {/* Comprehensive Project Detail Inspector Sheet (Pop-up inside modal) */}
      {selectedProjectDetail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            
            {/* Inspector Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] text-cyan-400 font-mono uppercase tracking-wider font-semibold">
                    Lembar Rincian Project Detail
                  </div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    {selectedProjectDetail.woNumber}
                    {getStatusBadge(selectedProjectDetail.statusWo)}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedProjectDetail(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inspector Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              
              {/* General Specs */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Spesifikasi Proyek</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div><span className="text-slate-500">Kategori WO:</span> <strong className="text-white">{selectedProjectDetail.woType}</strong></div>
                  <div><span className="text-slate-500">Area Penugasan:</span> <strong className="text-cyan-400">{selectedProjectDetail.assignment}</strong></div>
                  <div><span className="text-slate-500">Tim Pelaksana:</span> <strong className="text-white">{selectedProjectDetail.team}</strong></div>
                  <div><span className="text-slate-500">PIC Penanggung Jawab:</span> <strong className="text-white">{selectedProjectDetail.pic}</strong></div>
                  <div className="sm:col-span-2"><span className="text-slate-500">Uraian Pekerjaan:</span> <p className="text-slate-200 font-sans mt-0.5">{selectedProjectDetail.workType}</p></div>
                </div>
              </div>

              {/* Timeline & Distance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Jadwal & Durasi
                  </h4>
                  <div><span className="text-slate-500">Rilis WO:</span> {selectedProjectDetail.releaseDate} ({selectedProjectDetail.monthReleaseWo})</div>
                  <div><span className="text-slate-500">Mulai Kerja:</span> {selectedProjectDetail.startDate}</div>
                  <div><span className="text-slate-500">Target Selesai:</span> {selectedProjectDetail.finishDate}</div>
                  <div><span className="text-slate-500">Total Durasi:</span> <strong className="text-amber-400">{selectedProjectDetail.durationDays} Hari Kerja</strong></div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" /> Pengukuran Jarak Kabel
                  </h4>
                  <div><span className="text-slate-500">Estimasi Jarak:</span> <strong className="text-white">{selectedProjectDetail.estimatedDistanceMeters} Meter</strong></div>
                  <div><span className="text-slate-500">Total Realisasi:</span> <strong className="text-cyan-400">{selectedProjectDetail.totalDistanceMeters} Meter</strong></div>
                  <div><span className="text-slate-500">Panjang Jalur (Route):</span> <strong className="text-emerald-400">{selectedProjectDetail.pathLengthMeters} Meter</strong></div>
                  <div><span className="text-slate-500">Status Tim Project:</span> {selectedProjectDetail.statusTeamProject}</div>
                </div>
              </div>

              {/* Linked Module Integrations */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Keterhubungan Dokumen Lintas Modul</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  
                  {/* BAST */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Dokumen BAST:</span>
                      {getLinkedBast(selectedProjectDetail.woNumber) ? (
                        <span className="text-emerald-400 font-bold">{getLinkedBast(selectedProjectDetail.woNumber)?.statusBast}</span>
                      ) : (
                        <span className="text-slate-500">Belum ada</span>
                      )}
                    </div>
                  </div>

                  {/* Invoice */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold flex items-center gap-1"><Receipt className="w-3.5 h-3.5 text-amber-400" /> Invoice:</span>
                      {getLinkedInvoice(selectedProjectDetail.woNumber) ? (
                        <span className="text-emerald-400 font-bold">Rp {getLinkedInvoice(selectedProjectDetail.woNumber)?.amountRupiah.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="text-slate-500">Belum ditagihkan</span>
                      )}
                    </div>
                  </div>

                  {/* RFS */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold flex items-center gap-1"><FileCheck2 className="w-3.5 h-3.5 text-cyan-400" /> Dokumen RFS:</span>
                      {getLinkedRfs(selectedProjectDetail.woNumber) ? (
                        <span className="text-cyan-400 font-bold">{getLinkedRfs(selectedProjectDetail.woNumber)?.statusRfs}</span>
                      ) : (
                        <span className="text-slate-500">Belum rilis</span>
                      )}
                    </div>
                  </div>

                  {/* Penagihan */}
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-purple-400" /> Paket Penagihan:</span>
                      {getLinkedPenagihan(selectedProjectDetail.woNumber) ? (
                        <span className="text-purple-400 font-bold">{getLinkedPenagihan(selectedProjectDetail.woNumber)?.statusPenagihan}</span>
                      ) : (
                        <span className="text-slate-500">Belum dibuat</span>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Inspector Footer */}
            <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-end">
              <TouchButton 
                variant="secondary" 
                size="sm" 
                onClick={() => setSelectedProjectDetail(null)}
              >
                Tutup Rincian
              </TouchButton>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
