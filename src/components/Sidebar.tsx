import React from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  CheckSquare, 
  Receipt, 
  FileCheck2, 
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { useProjectContext } from '../context/ProjectContext';
import { ActiveTab } from '../types';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    dailyReports, 
    bastList, 
    invoices, 
    rfsList, 
    penagihanList 
  } = useProjectContext();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="w-5 h-5" />,
      count: dailyReports.length
    },
    {
      id: 'daily-report',
      label: 'Daily Report',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      count: dailyReports.length
    },
    {
      id: 'bast',
      label: 'BAST',
      icon: <CheckSquare className="w-5 h-5" />,
      count: bastList.length
    },
    {
      id: 'invoice',
      label: 'Invoice',
      icon: <Receipt className="w-5 h-5" />,
      count: invoices.length
    },
    {
      id: 'rfs',
      label: 'RFS',
      icon: <FileCheck2 className="w-5 h-5" />,
      count: rfsList.length
    },
    {
      id: 'penagihan',
      label: 'Penagihan',
      icon: <CreditCard className="w-5 h-5" />,
      count: penagihanList.length
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0">
      <div className="p-3 lg:p-4">
        
        {/* Mobile horizontal scroll / Desktop vertical stack */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl font-medium text-xs lg:text-sm transition-all duration-200 select-none cursor-pointer whitespace-nowrap lg:whitespace-normal group active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}>
                    {item.count}
                  </span>
                  <ChevronRight className={`w-4 h-4 hidden lg:block transition-transform ${
                    isActive ? 'text-white translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                  }`} />
                </div>
              </button>
            );
          })}
        </nav>

      </div>
    </aside>
  );
};
