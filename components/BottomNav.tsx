
import React from 'react';
import { Users, Trophy, List, Activity } from 'lucide-react';
import type { Tab } from '../types';

interface BottomNavProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    isAdmin: boolean;
    isSimulating: boolean;
}

const NavButton: React.FC<{
    label: string;
    icon: React.ElementType;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon: Icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition ${isActive ? 'text-blue-900 scale-110' : 'hover:text-slate-600'}`}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        {label}
    </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, isAdmin, isSimulating }) => {
    const isRankingVisible = !isSimulating;

    return (
        <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 flex justify-around py-3 pb-5 z-20 text-[10px] font-bold text-slate-400 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            {(isAdmin || isSimulating) && (
                <NavButton label="AGREGAR" icon={Users} isActive={activeTab === 'agregar'} onClick={() => setActiveTab('agregar')} />
            )}
            <NavButton label="TORNEO" icon={Activity} isActive={activeTab === 'torneo'} onClick={() => setActiveTab('torneo')} />
            <NavButton label="CLASIFIC." icon={List} isActive={activeTab === 'live'} onClick={() => setActiveTab('live')} />
            {isRankingVisible && (
                <NavButton label="RANKING" icon={Trophy} isActive={activeTab === 'ranking'} onClick={() => setActiveTab('ranking')} />
            )}
        </div>
    );
};

export default BottomNav;
