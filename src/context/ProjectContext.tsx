import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  DailyReportItem, 
  BASTItem, 
  InvoiceItem, 
  RFSItem, 
  PenagihanItem, 
  ActiveTab,
  FilterState
} from '../types';
import { 
  INITIAL_DAILY_REPORTS, 
  INITIAL_BAST_LIST, 
  INITIAL_INVOICE_LIST, 
  INITIAL_RFS_LIST, 
  INITIAL_PENAGIHAN_LIST 
} from '../data/mockData';
import { ToastMessage, ToastContainer } from '../components/Toast';

export interface DrilldownFilter {
  title: string;
  category: 'wo' | 'project' | 'statusWo' | 'statusProject' | 'bast' | 'rfs' | 'invoice';
  value: string;
}

interface ProjectContextType {
  // Auth
  isLoggedIn: boolean;
  currentUserEmail: string;
  login: (email: string, pass: string) => boolean;
  logout: () => void;

  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // Auto-save Status
  autoSaveStatus: 'saved' | 'saving' | 'idle';
  lastSavedTime: string;

  // Data
  dailyReports: DailyReportItem[];
  bastList: BASTItem[];
  invoices: InvoiceItem[];
  rfsList: RFSItem[];
  penagihanList: PenagihanItem[];

  // Toast Notifications
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  dismissToast: (id: string) => void;

  // CRUD Daily Report
  addDailyReport: (item: Omit<DailyReportItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDailyReport: (id: string, item: Partial<DailyReportItem>) => void;
  deleteDailyReport: (id: string) => void;

  // CRUD BAST
  addBAST: (item: Omit<BASTItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBAST: (id: string, item: Partial<BASTItem>) => void;
  deleteBAST: (id: string) => void;

  // CRUD Invoice
  addInvoice: (item: Omit<InvoiceItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (id: string, item: Partial<InvoiceItem>) => void;
  deleteInvoice: (id: string) => void;

  // CRUD RFS
  addRFS: (item: Omit<RFSItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRFS: (id: string, item: Partial<RFSItem>) => void;
  deleteRFS: (id: string) => void;

  // CRUD Penagihan
  addPenagihan: (item: Omit<PenagihanItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePenagihan: (id: string, item: Partial<PenagihanItem>) => void;
  deletePenagihan: (id: string) => void;

  // Global Search & Filters
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Drilldown Modal
  drilldownFilter: DrilldownFilter | null;
  setDrilldownFilter: (filter: DrilldownFilter | null) => void;

  // Reset
  resetAllData: () => void;
}

const STORAGE_KEYS = {
  AUTH: 'belacom_auth',
  DAILY_REPORTS: 'belacom_daily_reports_v2',
  BAST: 'belacom_bast_list_v2',
  INVOICE: 'belacom_invoice_list_v2',
  RFS: 'belacom_rfs_list_v2',
  PENAGIHAN: 'belacom_penagihan_list_v2'
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem('belacom_user_email') || '';
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Auto-save State
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>(
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);

    // Auto dismiss after 3.5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Datasets
  const [dailyReports, setDailyReports] = useState<DailyReportItem[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.DAILY_REPORTS);
    return local ? JSON.parse(local) : INITIAL_DAILY_REPORTS;
  });

  const [bastList, setBastList] = useState<BASTItem[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.BAST);
    return local ? JSON.parse(local) : INITIAL_BAST_LIST;
  });

  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.INVOICE);
    return local ? JSON.parse(local) : INITIAL_INVOICE_LIST;
  });

  const [rfsList, setRfsList] = useState<RFSItem[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.RFS);
    return local ? JSON.parse(local) : INITIAL_RFS_LIST;
  });

  const [penagihanList, setPenagihanList] = useState<PenagihanItem[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.PENAGIHAN);
    return local ? JSON.parse(local) : INITIAL_PENAGIHAN_LIST;
  });

  // Global Filters
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    assignmentFilter: 'ALL',
    statusFilter: 'ALL',
    teamFilter: 'ALL',
    dateRangeStart: '',
    dateRangeEnd: ''
  });

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      assignmentFilter: 'ALL',
      statusFilter: 'ALL',
      teamFilter: 'ALL',
      dateRangeStart: '',
      dateRangeEnd: ''
    });
  }, []);

  // Drilldown Filter Modal
  const [drilldownFilter, setDrilldownFilter] = useState<DrilldownFilter | null>(null);

  // Trigger Real-time Auto-save with debouncing & indicator
  const triggerAutoSave = useCallback(() => {
    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.DAILY_REPORTS, JSON.stringify(dailyReports));
      localStorage.setItem(STORAGE_KEYS.BAST, JSON.stringify(bastList));
      localStorage.setItem(STORAGE_KEYS.INVOICE, JSON.stringify(invoices));
      localStorage.setItem(STORAGE_KEYS.RFS, JSON.stringify(rfsList));
      localStorage.setItem(STORAGE_KEYS.PENAGIHAN, JSON.stringify(penagihanList));

      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSavedTime(now);
      setAutoSaveStatus('saved');
    }, 300);

    return () => clearTimeout(timer);
  }, [dailyReports, bastList, invoices, rfsList, penagihanList]);

  useEffect(() => {
    triggerAutoSave();
  }, [dailyReports, bastList, invoices, rfsList, penagihanList, triggerAutoSave]);

  // Auth Methods
  const login = (email: string, pass: string): boolean => {
    if (pass === 'belacom' && email.trim().length > 0) {
      setIsLoggedIn(true);
      setCurrentUserEmail(email);
      localStorage.setItem(STORAGE_KEYS.AUTH, 'true');
      localStorage.setItem('belacom_user_email', email);
      showToast('success', 'Berhasil Masuk', `Selamat datang kembali, ${email}`);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUserEmail('');
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem('belacom_user_email');
    showToast('info', 'Sesi Berakhir', 'Anda telah keluar dari sistem.');
  };

  // CRUD Daily Report
  const addDailyReport = (item: Omit<DailyReportItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecord: DailyReportItem = {
      ...item,
      id: 'DR-' + Math.floor(100 + Math.random() * 900),
      createdAt: now,
      updatedAt: now
    };
    setDailyReports(prev => [newRecord, ...prev]);
    showToast('success', 'Daily Report Disimpan', `WO No. ${newRecord.woNumber} berhasil ditambahkan!`);
  };

  const updateDailyReport = (id: string, item: Partial<DailyReportItem>) => {
    const now = new Date().toISOString();
    setDailyReports(prev => prev.map(r => r.id === id ? { ...r, ...item, updatedAt: now } : r));
    showToast('success', 'Daily Report Diperbarui', `Perubahan data ID: ${id} tersimpan otomatis.`);
  };

  const deleteDailyReport = (id: string) => {
    const target = dailyReports.find(r => r.id === id);
    setDailyReports(prev => prev.filter(r => r.id !== id));
    showToast('error', 'Daily Report Dihapus', `Data WO ${target?.woNumber || id} telah dihapus.`);
  };

  // CRUD BAST
  const addBAST = (item: Omit<BASTItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecord: BASTItem = {
      ...item,
      id: 'BAST-' + Math.floor(200 + Math.random() * 900),
      createdAt: now,
      updatedAt: now
    };
    setBastList(prev => [newRecord, ...prev]);
    showToast('success', 'Dokumen BAST Dibuat', `BAST untuk WO ${newRecord.woNumber} berhasil dibuat!`);
  };

  const updateBAST = (id: string, item: Partial<BASTItem>) => {
    const now = new Date().toISOString();
    setBastList(prev => prev.map(b => b.id === id ? { ...b, ...item, updatedAt: now } : b));
    showToast('success', 'Dokumen BAST Diperbarui', `Perubahan BAST ID: ${id} tersimpan otomatis.`);
  };

  const deleteBAST = (id: string) => {
    setBastList(prev => prev.filter(b => b.id !== id));
    showToast('error', 'Dokumen BAST Dihapus', `Dokumen BAST ${id} telah dihapus.`);
  };

  // CRUD Invoice
  const addInvoice = (item: Omit<InvoiceItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecord: InvoiceItem = {
      ...item,
      id: 'INV-' + Math.floor(300 + Math.random() * 900),
      createdAt: now,
      updatedAt: now
    };
    setInvoices(prev => [newRecord, ...prev]);
    showToast('success', 'Invoice Diterbitkan', `No Invoice: ${newRecord.invoiceNumber} berhasil dibuat!`);
  };

  const updateInvoice = (id: string, item: Partial<InvoiceItem>) => {
    const now = new Date().toISOString();
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...item, updatedAt: now } : inv));
    showToast('success', 'Invoice Diperbarui', `Perubahan Invoice ID: ${id} tersimpan otomatis.`);
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    showToast('error', 'Invoice Dihapus', `Invoice ID: ${id} telah dihapus.`);
  };

  // CRUD RFS
  const addRFS = (item: Omit<RFSItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecord: RFSItem = {
      ...item,
      id: 'RFS-' + Math.floor(400 + Math.random() * 900),
      createdAt: now,
      updatedAt: now
    };
    setRfsList(prev => [newRecord, ...prev]);
    showToast('success', 'Dokumen RFS Dibuat', `No RFS: ${newRecord.rfsNumber} telah dibuat!`);
  };

  const updateRFS = (id: string, item: Partial<RFSItem>) => {
    const now = new Date().toISOString();
    setRfsList(prev => prev.map(r => r.id === id ? { ...r, ...item, updatedAt: now } : r));
    showToast('success', 'Dokumen RFS Diperbarui', `Perubahan Surat RFS ID: ${id} tersimpan otomatis.`);
  };

  const deleteRFS = (id: string) => {
    setRfsList(prev => prev.filter(r => r.id !== id));
    showToast('error', 'Dokumen RFS Dihapus', `Surat RFS ID: ${id} telah dihapus.`);
  };

  // CRUD Penagihan
  const addPenagihan = (item: Omit<PenagihanItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecord: PenagihanItem = {
      ...item,
      id: 'PNG-' + Math.floor(500 + Math.random() * 900),
      createdAt: now,
      updatedAt: now
    };
    setPenagihanList(prev => [newRecord, ...prev]);
    showToast('success', 'Paket Penagihan Dibuat', `Kode Penagihan: ${newRecord.billingCode} tersimpan!`);
  };

  const updatePenagihan = (id: string, item: Partial<PenagihanItem>) => {
    const now = new Date().toISOString();
    setPenagihanList(prev => prev.map(p => p.id === id ? { ...p, ...item, updatedAt: now } : p));
    showToast('success', 'Paket Penagihan Diperbarui', `Checklist berkas penagihan ID: ${id} diperbarui.`);
  };

  const deletePenagihan = (id: string) => {
    setPenagihanList(prev => prev.filter(p => p.id !== id));
    showToast('error', 'Paket Penagihan Dihapus', `Paket penagihan ID: ${id} telah dihapus.`);
  };

  const resetAllData = () => {
    setDailyReports(INITIAL_DAILY_REPORTS);
    setBastList(INITIAL_BAST_LIST);
    setInvoices(INITIAL_INVOICE_LIST);
    setRfsList(INITIAL_RFS_LIST);
    setPenagihanList(INITIAL_PENAGIHAN_LIST);
    localStorage.removeItem(STORAGE_KEYS.DAILY_REPORTS);
    localStorage.removeItem(STORAGE_KEYS.BAST);
    localStorage.removeItem(STORAGE_KEYS.INVOICE);
    localStorage.removeItem(STORAGE_KEYS.RFS);
    localStorage.removeItem(STORAGE_KEYS.PENAGIHAN);
    showToast('info', 'Data Direset', 'Seluruh data telah diatur ulang ke sampel awal Belacom.');
  };

  return (
    <ProjectContext.Provider
      value={{
        isLoggedIn,
        currentUserEmail,
        login,
        logout,
        activeTab,
        setActiveTab,
        autoSaveStatus,
        lastSavedTime,
        dailyReports,
        bastList,
        invoices,
        rfsList,
        penagihanList,
        toasts,
        showToast,
        dismissToast,
        addDailyReport,
        updateDailyReport,
        deleteDailyReport,
        addBAST,
        updateBAST,
        deleteBAST,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addRFS,
        updateRFS,
        deleteRFS,
        addPenagihan,
        updatePenagihan,
        deletePenagihan,
        filters,
        setFilters,
        resetFilters,
        drilldownFilter,
        setDrilldownFilter,
        resetAllData
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};
