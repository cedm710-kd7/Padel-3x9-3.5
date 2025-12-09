
import React, { useState, useMemo } from 'react';
import { Trash2, Trophy, ChevronDown } from 'lucide-react';
import type { HistoryEntry, Mutations } from '../../types';

interface RankingTabProps {
    history: HistoryEntry[];
    isAdmin: boolean;
    mutations: Mutations;
    openPasswordConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const RankingTab: React.FC<RankingTabProps> = ({ history, isAdmin, mutations, openPasswordConfirm }) => {
    const [view, setView] = useState<'ranking' | 'history'>('ranking');
    const [rankingType, setRankingType] = useState<'players' | 'pairs'>('players');
    const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

    const rankings = useMemo(() => {
        const playerMap: { [id: string]: any } = {};
        const pairMap: { [key: string]: any } = {};

        const getPairKey = (p1Id: string, p2Id: string, p1Name: string, p2Name: string) => {
            const ids = [p1Id, p2Id].sort();
            const names = ids[0] === p1Id ? [p1Name, p2Name] : [p2Name, p1Name];
            return { key: ids.join('_'), name: names.join(' & ') };
        };

        history.forEach(tourney => {
            tourney.ranking.forEach(r => {
                const pairObj = tourney.pairs.find(p => p.id === r.id);
                if (!pairObj) return;

                const { p1, p2 } = pairObj;
                const isWinner = r.id === tourney.winner.id;

                [p1, p2].forEach(p => {
                    if (!playerMap[p.id]) playerMap[p.id] = { id: p.id, name: p.name, pts: 0, pp: 0, mw: 0, ml: 0, pj: 0, tourneysWon: 0, tourneysPlayed: 0 };
                    Object.assign(playerMap[p.id], { pts: playerMap[p.id].pts + r.pg, pp: playerMap[p.id].pp + r.pp, mw: playerMap[p.id].mw + r.matchesWon, ml: playerMap[p.id].ml + r.matchesLost, pj: playerMap[p.id].pj + r.matchesWon + r.matchesLost, tourneysPlayed: playerMap[p.id].tourneysPlayed + 1, tourneysWon: playerMap[p.id].tourneysWon + (isWinner ? 1 : 0) });
                });

                const { key, name } = getPairKey(p1.id, p2.id, p1.name, p2.name);
                if (!pairMap[key]) pairMap[key] = { id: key, name, pts: 0, pp: 0, mw: 0, ml: 0, pj: 0, tourneysWon: 0, tourneysPlayed: 0 };
                Object.assign(pairMap[key], { pts: pairMap[key].pts + r.pg, pp: pairMap[key].pp + r.pp, mw: pairMap[key].mw + r.matchesWon, ml: pairMap[key].ml + r.matchesLost, pj: pairMap[key].pj + r.matchesWon + r.matchesLost, tourneysPlayed: pairMap[key].tourneysPlayed + 1, tourneysWon: pairMap[key].tourneysWon + (isWinner ? 1 : 0) });
            });
        });

        const sortFn = (a: any, b: any) => b.tourneysWon - a.tourneysWon || b.mw - a.mw || b.pts - a.pts || b.pj - a.pj;
        const process = (map: any) => Object.values(map).map((item: any) => ({ ...item, pct: item.pj > 0 ? Math.round((item.mw / item.pj) * 100) : 0 })).sort(sortFn);

        return { players: process(playerMap), pairs: process(pairMap) };
    }, [history]);

    const handleDeleteHistory = () => {
        openPasswordConfirm(
            "Confirmación de Administrador",
            "Para eliminar todo el historial de torneos, introduce la contraseña de administrador. ¡Esta acción es irreversible!",
            () => mutations.deleteHistory()
        );
    };

    return (
        <div className="p-4 space-y-6 pb-24">
            <h2 className="text-2xl font-bold text-slate-800">Ranking Histórico</h2>

            <div className="flex bg-slate-200 p-1 rounded-xl">
                <button onClick={() => setView('ranking')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${view === 'ranking' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Rankings</button>
                <button onClick={() => setView('history')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${view === 'history' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Historial</button>
            </div>
            
            {view === 'ranking' && (
                <>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => setRankingType('players')} className={`text-sm font-bold px-4 py-1 rounded-full border ${rankingType === 'players' ? 'bg-blue-900 text-white border-blue-900' : 'text-slate-400 border-slate-300'}`}>Jugadores</button>
                        <button onClick={() => setRankingType('pairs')} className={`text-sm font-bold px-4 py-1 rounded-full border ${rankingType === 'pairs' ? 'bg-blue-900 text-white border-blue-900' : 'text-slate-400 border-slate-300'}`}>Parejas</button>
                    </div>
                    <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
                        <div className="grid grid-cols-12 bg-slate-800 text-white text-[10px] font-bold py-3 px-2 text-center uppercase tracking-tighter">
                            <div className="col-span-1">#</div>
                            <div className="col-span-4 text-left pl-2">{rankingType === 'players' ? 'Jugador' : 'Pareja'}</div>
                            <div className="col-span-1 text-emerald-400">TG</div><div className="col-span-1">PG</div><div className="col-span-1 text-red-300">PP</div><div className="col-span-1 text-slate-300">PJ</div><div className="col-span-1 text-amber-400">PTS</div><div className="col-span-2 text-blue-300">%</div>
                        </div>
                        {rankings[rankingType].map((row, idx) => (
                            <div key={row.id} className="grid grid-cols-12 text-xs py-3 px-2 items-center border-b border-slate-100 text-center hover:bg-slate-50">
                                <div className="col-span-1 font-bold text-slate-400">{idx + 1}</div>
                                <div className="col-span-4 text-left pl-2 font-semibold text-slate-800 truncate">{row.name}</div>
                                <div className="col-span-1 font-bold text-emerald-600 bg-emerald-50 rounded py-1">{row.tourneysWon}</div><div className="col-span-1 text-slate-600 font-bold text-base">{row.mw}</div><div className="col-span-1 text-slate-400 font-bold text-base">{row.ml}</div><div className="col-span-1 text-slate-400">{row.pj}</div><div className="col-span-1 font-bold text-amber-600">{row.pts}</div><div className="col-span-2 font-bold text-blue-600">{row.pct}%</div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            
            {view === 'history' && (
                <div className="space-y-4">
                    {history.map(h => (
                        <div key={h.id} className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
                            <button onClick={() => setExpandedHistoryId(h.id === expandedHistoryId ? null : h.id)} className="w-full text-left bg-slate-50 p-3 flex justify-between items-center border-b hover:bg-slate-100 transition">
                                <div>
                                    <span className="text-xs font-bold text-slate-500">{new Date(h.date).toLocaleDateString()}</span>
                                    <div className="text-sm font-black text-slate-800 flex items-center gap-2 mt-1"><Trophy size={16} className="text-amber-500"/> Ganador: {h.winner?.name || 'Desc.'}</div>
                                </div>
                                <ChevronDown size={20} className={`text-slate-400 transition-transform ${h.id === expandedHistoryId ? 'rotate-180' : ''}`} />
                            </button>
                            {h.id === expandedHistoryId && h.matches && (
                                <div className="px-3 pb-3 pt-2 border-t border-slate-100 bg-slate-50">
                                    <h4 className="text-xs font-bold text-slate-700 mb-2">RESULTADOS:</h4>
                                    <div className="space-y-1">
                                        {h.matches.map((m, mIdx) => (
                                            <div key={mIdx} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg shadow-sm">
                                                <span className="text-slate-500 font-medium w-1/4">Ronda {m.round}</span>
                                                <div className="flex-1 text-center font-bold"><span className={m.score1 > m.score2 ? 'text-emerald-600' : 'text-slate-800'}>{m.t1.name.split(' ')[0]}</span><span className="mx-1 text-slate-400 font-normal">vs</span><span className={m.score2 > m.score1 ? 'text-emerald-600' : 'text-slate-800'}>{m.t2.name.split(' ')[0]}</span></div>
                                                <div className="w-1/4 text-right font-black">{m.score1} - {m.score2}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                     {isAdmin && history.length > 0 && (
                        <button onClick={handleDeleteHistory} className="w-full mt-8 py-3 text-red-400 text-xs font-bold hover:text-red-600 flex justify-center items-center gap-2">
                            <Trash2 size={14} /> ELIMINAR HISTORIAL COMPLETO
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default RankingTab;
