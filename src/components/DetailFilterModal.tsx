import React from 'react';
import { X, ExternalLink, Calendar, MapPin, User, FileText, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { useProjectContext, DrilldownFilter } from '../context/ProjectContext';
import { TouchButton } from './TouchButton';

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
    setActiveTab 
  } = useProjectContext();

  if (!filter) return null;

  // Compute matched items depending on category and value
  const matchedReports = dailyReports.filter(r => {
    if (filter.category === 'wo') return true; // All WO
    if (filter.category === 'statusWo') return r.statusWo.toLowerCase() === filter.value.toLowerCase();
    if (filter.category === 'statusProject') return r.statusWo.toLowerCase() === filter.value.toLowerCase();
    if (filter.category === 'project') return true;
    return false;
  });

  const matchedBast = bastList.filter(b => {
    if (filter.category === 'bast') return b.statusBast.toLowerCase() === filter.value.toLowerCase();
    return false;
  });

  const matchedInvoice = invoices.filter(i => {
    if (filter.category === 'invoice') return i.statusInvoice.toLowerCase() === filter.value.toLowerCase();
    return false;
  });

  const matchedRfs = rfsList.filter(r => {
    if (filter.category === 'rfs') return r.statusRfs.toLowerCase() === filter.value.toLowerCase();
    return false;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'done' || s === 'lunas') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> {status}
        </span>
      );
    }
    if (s === 'in progress' || s === 'submit' || s === 'dalam review') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Clock className="w-3 h-3" /> {status}
        </span>
      );
    }
    if (s === 'revision' || s === 'waiting schedule') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3" /> {status}
        </span>
      );
    }
    if (s === 'cancel' || s === 'ditolak') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3 h-3" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider font-semibold">
              <span>Detail Informasi Akurat</span>
              <span>·</span>
              <span>Kategori: {filter.category.toUpperCase()}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {filter.title}: <span className="text-cyan-400 font-mono">{filter.value}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Reports Table / List */}
          {matchedReports.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Daftar Daily Report & WO Terkait ({matchedReports.length} Item)
              </h3>
              <div className="space-y-2">
                {matchedReports.map((report) => (
                  <div key={report.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-cyan-400 font-mono">{report.woNumber}</span>
                        {getStatusBadge(report.statusWo)}
                        <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                          {report.assignment}
                        </span>
                        <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                          Tim: {report.team}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{report.workType}</p>
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" /> Release: {report.monthReleaseWo}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-cyan-400" /> PIC: {report.pic}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-cyan-400" /> {report.startDate} s/d {report.finishDate} ({report.durationDays} hari)
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <TouchButton
                        variant="outline"
                        size="sm"
                        icon={<ExternalLink className="w-3.5 h-3.5" />}
                        onClick={() => {
                          onClose();
                          setActiveTab('daily-report');
                        }}
                      >
                        Buka Daily Report
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
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                Daftar Dokumen BAST Terkait ({matchedBast.length} Item)
              </h3>
              <div className="space-y-2">
                {matchedBast.map((bast) => (
                  <div key={bast.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-cyan-400 font-mono">{bast.woNumber}</span>
                        {getStatusBadge(bast.statusBast)}
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{bast.workType}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Dokumen: APD ({bast.apdPdf ? 'Ada' : '-'}), ABD ({bast.abdPdf ? 'Ada' : '-'}), Core Conn ({bast.coreConnectionPdf ? 'Ada' : '-'})
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
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
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
                      <p className="text-xs text-slate-300 font-mono">WO Ref: {inv.woNumber} · PO: {inv.poNumber}</p>
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
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
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

          {matchedReports.length === 0 && matchedBast.length === 0 && matchedInvoice.length === 0 && matchedRfs.length === 0 && (
            <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">Tidak ada data spesifik untuk filter ini.</p>
              <p className="text-xs text-slate-500 mt-1">Anda dapat menambahkan data baru pada menu terkait.</p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-end">
          <TouchButton variant="secondary" size="sm" onClick={onClose}>
            Tutup
          </TouchButton>
        </div>

      </div>
    </div>
  );
};
