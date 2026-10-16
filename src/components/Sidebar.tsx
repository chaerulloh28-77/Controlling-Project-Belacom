import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  ShieldCheck, 
  ReceiptText, 
  RadioTower, 
  WalletCards,
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

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; count: number; accentColor: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      count: dailyReports.length,
      accentColor: 'text-cyan-400'
    },
    {
      id: 'daily-report',
      label: 'Daily Report',
      icon: <ClipboardList className="w-5 h-5" />,
      count: dailyReports.length,
      accentColor: 'text-blue-400'
    },
    {
      id: 'bast',
      label: 'BAST',
      icon: <ShieldCheck className="w-5 h-5" />,
      count: bastList.length,
      accentColor: 'text-emerald-400'
    },
    {
      id: 'invoice',
      label: 'Invoice',
      icon: <ReceiptText className="w-5 h-5" />,
      count: invoices.length,
      accentColor: 'text-amber-400'
    },
    {
      id: 'rfs',
      label: 'RFS',
      icon: <RadioTower className="w-5 h-5" />,
      count: rfsList.length,
      accentColor: 'text-cyan-400'
    },
    {
      id: 'penagihan',
      label: 'Penagihan',
      icon: <WalletCards className="w-5 h-5" />,
      count: penagihanList.length,
      accentColor: 'text-purple-400'
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 shrink-0 select-none">
      <div className="p-3 lg:p-4">
        
        {/* Mobile horizontal scroll / Desktop vertical stack */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl font-medium text-xs lg:text-sm transition-all duration-200 select-none cursor-pointer whitespace-nowrap lg:whitespace-normal group active:scale-95 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 via-cyan-700 to-blue-700 text-white shadow-lg shadow-cyan-950/60 font-bold border border-cyan-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                {/* Active Left indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-1 bg-white rounded-r-full shadow-glow"></div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-lg transition-transform duration-200 ease-out group-hover:scale-110 group-hover:rotate-3 ${
                    isActive ? 'text-white' : `${item.accentColor} group-hover:text-white`
                  }`}>
                    {item.icon}
                  </div>
                  <span className="tracking-wide">{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all ${
                    isActive 
                      ? 'bg-white/20 text-white shadow-sm' 
                      : 'bg-slate-950/80 text-slate-400 group-hover:text-slate-200 border border-slate-800'
                  }`}>
                    {item.count}
                  </span>
                  <ChevronRight className={`w-4 h-4 hidden lg:block transition-all duration-200 ${
                    isActive ? 'text-white translate-x-0.5' : 'text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5'
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
