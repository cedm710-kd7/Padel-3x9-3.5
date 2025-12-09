
import React, { useState, useMemo } from 'react';
import { Loader2, Sparkles, Save, Trash2, Trophy, ChevronDown, Volume2 } from 'lucide-react';
import { calculateLiveStats, calculateH2HStats } from '../../utils/rankingUtils';
import { generateTournamentSummary, announceTournamentWinner } from '../../services/geminiService';
import type { TournamentState, Tab, Mutations } from '../../types';
import TournamentTab from './TournamentTab';

interface ClassificationTabProps {
    currentState: TournamentState | null;
    mutations: Mutations;
    setActiveTab: (tab: Tab) => void;
    isAdmin: boolean;
    isSimulating: boolean;
    openConfirm: (message: string, onConfirm: () => void) => void;
}

const ClassificationTab: React.FC<ClassificationTabProps> = (props) => {
    const { currentState, mutations, setActiveTab, isAdmin, isSimulating, openConfirm } = props;
    
    const [summaryText, setSummaryText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnnouncing, setIsAnnouncing] = useState(false);
    const [expandedPairId, setExpandedPairId] = useState<string | null>(null);

    const stats = useMemo(() => {
        if (!currentState?.active) return [];
        return calculateLiveStats(currentState);
    }, [currentState]);

    const h2hStats = useMemo(() => {
        if (!currentState?.active) return {};
        return calculateH2HStats(currentState);
    }, [currentState]);

    if (!currentState?.active) {
        return <TournamentTab {...props} />;
    }

    const generateSummary = async () => {
        setIsGenerating(true);
        setSummaryText('');
        const context = stats.map((row, idx) => 
            `#${idx + 1}: Pareja ${row.name} - ${row.pg} games ganados, ${row.matchesWon} partidos ganados.`
        ).join('\n');
        const result = await generateTournamentSummary(context);
        setSummaryText(result);
        setIsGenerating(false);
    };

    const suspendTournament = () => {
        const message = isSimulating 
            ? "¿SUSPENDER SIMULACIÓN?\nEl progreso se perderá." 
            : "¿SUSPENDER TORNEO?\nSe perderá el progreso actual y no se guardará en el ranking.";
        openConfirm(message, async () => {
            await mutations.suspendTournament();
            if (isSimulating) setActiveTab('agregar');
        });
    };

    const finishTournament = () => {
        const message = isSimulating 
            ? "¿FINALIZAR SIMULACIÓN?\nLos resultados no se guardarán."
            : "¿FINALIZAR Y GUARDAR?\nEsto archivará el torneo en el Ranking y no se podrá editar.";
        openConfirm(message, async () => {
            if (isSimulating) {
                await mutations.finishTournament(stats[0], stats, h2hStats);
                setActiveTab('torneo');
            } else {
                const winner = stats[0];
                setIsAnnouncing(true);
                await mutations.finishTournament(winner, stats, h2hStats);
                await announceTournamentWinner(winner.name);
                setIsAnnouncing(false);
                setActiveTab('ranking');
            }
        });
    };

    const canFinish = isAdmin || isSimulating;

    return (
        <div className="p-4 space-y-6 pb-24">
            <h2 className="text-2xl font-bold text-slate-800">Clasificación Live</h2>
            {/* Live Standings */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-800 text-white text-xs font-bold py-3 px-2 text-center uppercase">
                    <div className="col-span-1">#</div>
                    <div className="col-span-5 text-left pl-2">Pareja</div>
                    <div className="col-span-2">PG</div>
                    <div className="col-span-2">PP</div>
                    <div className="col-span-2 text-amber-400">GAME</div>
                </div>
                {stats.map((row, idx) => (
                    <div key={row.id} className={`grid grid-cols-12 text-sm py-4 px-2 items-center border-b border-slate-100 text-center ${idx === 0 ? 'bg-yellow-50/50' : ''}`}>
                        <div className="col-span-1 font-bold text-slate-400">{idx + 1}</div>
                        <div className="col-span-5 text-left pl-2 font-semibold text-slate-800 truncate">{row.name}</div>
                        <div className="col-span-2 font-medium text-emerald-600">{row.matchesWon}</div>
                        <div className="col-span-2 font-medium text-red-400">{row.matchesLost}</div>
                        <div className="col-span-2 font-bold text-xl text-slate-900">{row.pg}</div>
                    </div>
                ))}
            </div>
            {/* H2H Stats */}
             <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden divide-y divide-slate-100">
                <h3 className="text-lg font-bold text-slate-800 p-4">Enfrentamiento Directo</h3>
                {currentState.pairs.map(pRow => (
                    <div key={pRow.id}>
                        <button onClick={() => setExpandedPairId(pRow.id === expandedPairId ? null : pRow.id)} className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-50 transition">
                            <span className="font-bold text-slate-800 text-base">{pRow.name}</span>
                            <ChevronDown size={20} className={`text-slate-500 transition-transform ${expandedPairId === pRow.id ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedPairId === pRow.id && (
                            <div className="px-4 pb-4 space-y-2 bg-slate-50 border-t border-slate-100">
                                {currentState.pairs.filter(pCol => pRow.id !== pCol.id).map(pCol => {
                                    const record = h2hStats[pRow.id]?.[pCol.id];
                                    const [matchesWon, matchesLost] = [record?.matchesWon || 0, record?.matchesLost || 0];
                                    return (
                                        <div key={pCol.id} className="flex justify-between items-center text-sm p-2 rounded-lg border border-white bg-white shadow-sm">
                                            <span className="text-slate-600 font-medium">vs {pCol.name}</span>
                                            {matchesWon + matchesLost > 0 ? (
                                                <span className="font-bold"><span className={`${matchesWon > matchesLost ? 'text-emerald-600' : 'text-slate-800'}`}>PG {matchesWon}</span><span className="text-slate-400 mx-1">/</span><span className={`${matchesWon < matchesLost ? 'text-red-600' : 'text-slate-800'}`}>PP {matchesLost}</span></span>
                                            ) : <span className="text-slate-400 italic text-xs">Aún no se han enfrentado</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {/* Gemini Report */}
            <button onClick={generateSummary} disabled={isGenerating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-95">
                {isGenerating ? <><Loader2 className="animate-spin" size={20} /> Consultando a la IA...</> : <><Sparkles size={20} /> COMENTARIO IA ✨</>}
            </button>
            {summaryText && <div className="bg-white p-4 rounded-xl shadow border-l-4 border-l-indigo-400"><p className="text-sm italic text-slate-700">{summaryText}</p></div>}
            {/* Provisional Winner */}
            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 bg-white/5 rounded-full blur-2xl"></div>
                <Trophy size={56} className="text-amber-400 mb-2 animate-bounce" />
                <span className="text-amber-200 text-xs font-bold tracking-widest uppercase mb-1">Liderando</span>
                <h3 className="text-2xl font-black text-center">{stats[0].name}</h3>
            </div>
            {/* Admin/Simulator Controls */}
            {canFinish && (
                <>
                    <div className="pt-4">
                        <button onClick={finishTournament} disabled={isAnnouncing} className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${isSimulating ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'}`}>
                            {isAnnouncing ? <><Volume2 className="animate-pulse" size={20} /> ANUNCIANDO...</> : <><Save size={20} /> {isSimulating ? 'FINALIZAR SIMULACIÓN' : 'FINALIZAR Y GUARDAR'}</>}
                        </button>
                    </div>
                    <div className="pt-2">
                        <button onClick={suspendTournament} className="w-full py-3 border-2 border-red-100 text-red-500 font-bold rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2">
                            <Trash2 size={16}/> {isSimulating ? 'Suspender Simulación' : 'Suspender Torneo'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ClassificationTab;
