
import React from 'react';
import { Trophy } from 'lucide-react';
import type { TournamentState, Tab, Mutations } from '../../types';

interface TournamentTabProps {
    currentState: TournamentState | null;
    mutations: Mutations;
    setActiveTab: (tab: Tab) => void;
    isAdmin: boolean;
    isSimulating: boolean;
}

const ScoreButton: React.FC<{ score: number, currentScore: number | null, onClick: () => void }> = ({ score, currentScore, onClick }) => (
    <button
        onClick={onClick}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
            ${currentScore === score
                ? 'bg-blue-600 text-white scale-110 shadow-lg'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}
        `}
    >
        {score}
    </button>
);

const TournamentTab: React.FC<TournamentTabProps> = ({ currentState, mutations, setActiveTab, isAdmin, isSimulating }) => {
    if (!currentState || !currentState.active) {
        const isReadyToStart = !isSimulating && isAdmin;
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center pb-24">
                <div className="bg-blue-50 p-6 rounded-full mb-4">
                    <Trophy size={48} className="text-blue-900 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-slate-700">No hay torneo activo</h3>
                {isReadyToStart ? (
                    <>
                        <p className="text-slate-500 mt-2">Ve a la pestaña "Agregar" para crear parejas e iniciar un nuevo torneo.</p>
                        <button onClick={() => setActiveTab('agregar')} className="mt-6 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold shadow">
                            Crear Torneo
                        </button>
                    </>
                ) : (
                    <p className="text-slate-500 mt-2">El organizador aún no ha iniciado el torneo.</p>
                )}
            </div>
        );
    }

    const canEditScore = isAdmin || isSimulating;

    return (
        <div className="p-4 space-y-6 pb-24">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Partidos</h2>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">EN JUEGO</span>
            </div>
            
            <div className="space-y-6">
                {currentState.matches.map((match, idx) => {
                    const isInvalid = (match.score1 !== null && match.score2 !== null) && ((match.score1 === 0 && match.score2 === 0) || (match.score1 === 3 && match.score2 === 3) || (match.score1 === match.score2));
                    
                    return (
                        <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100">
                            <div className="bg-slate-800 px-4 py-2 flex justify-between items-center">
                                <span className="text-white text-xs font-bold uppercase tracking-wider">Partido {idx + 1}</span>
                                <span className="text-amber-400 text-xs font-bold">Ronda {match.round}</span>
                            </div>
                            
                            <div className="p-4 space-y-4">
                                {/* Team 1 */}
                                <div className="flex justify-between items-center">
                                    <div className={`font-semibold text-sm ${match.score1 !== null && match.score2 !== null && match.score1 > match.score2 ? 'text-emerald-600' : 'text-slate-700'}`}>
                                        {match.t1.name}
                                    </div>
                                    <div className="flex gap-2">
                                        {canEditScore ? [0, 1, 2, 3].map(s => (
                                            <ScoreButton key={s} score={s} currentScore={match.score1} onClick={() => mutations.updateScore(idx, 1, s)} />
                                        )) : (
                                            <span className={`w-8 h-8 flex items-center justify-center font-bold text-lg ${match.score1 !== null ? 'text-slate-800' : 'text-slate-300'}`}>
                                                {match.score1 ?? '-'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 w-full"></div>

                                {/* Team 2 */}
                                <div className="flex justify-between items-center">
                                    <div className={`font-semibold text-sm ${match.score2 !== null && match.score1 !== null && match.score2 > match.score1 ? 'text-emerald-600' : 'text-slate-700'}`}>
                                        {match.t2.name}
                                    </div>
                                    <div className="flex gap-2">
                                        {canEditScore ? [0, 1, 2, 3].map(s => (
                                            <ScoreButton key={s} score={s} currentScore={match.score2} onClick={() => mutations.updateScore(idx, 2, s)} />
                                        )) : (
                                            <span className={`w-8 h-8 flex items-center justify-center font-bold text-lg ${match.score2 !== null ? 'text-slate-800' : 'text-slate-300'}`}>
                                                {match.score2 ?? '-'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {isInvalid && canEditScore && (
                                    <div className="text-center text-red-500 text-xs font-bold bg-red-50 p-1 rounded">
                                        Marcador no válido
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TournamentTab;
