
import React from 'react';
import { LogOut, Eye, UserCheck, Zap } from 'lucide-react';
import type { Role } from '../types';

interface HeaderProps {
    role: Role;
    onLogout: () => void;
    isTournamentActive: boolean;
}

const roleInfo = {
    admin: { icon: <UserCheck size={12} className="text-emerald-400"/>, text: 'Admin' },
    spectator: { icon: <Eye size={12} className="text-blue-400"/>, text: 'Espectador' },
    simulator: { icon: <Zap size={12} className="text-blue-400"/>, text: 'Simulación' }
};

const Header: React.FC<HeaderProps> = ({ role, onLogout, isTournamentActive }) => {
    const { icon, text } = roleInfo[role];

    return (
        <div className="bg-slate-900 text-white p-5 pb-8 rounded-b-3xl shadow-lg z-10 flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-black text-amber-400 italic tracking-tighter">PADEL 3x9</h1>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    {icon}
                    Modo: {text}
                </p>
            </div>
            <div className="flex flex-col items-end gap-1">
                <button onClick={onLogout} className="text-slate-500 hover:text-white transition p-1">
                    <LogOut size={18} />
                </button>
                {isTournamentActive && (
                    <span className="bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-1 rounded text-[10px] font-bold animate-pulse">
                        EN JUEGO
                    </span>
                )}
            </div>
        </div>
    );
};

export default Header;
