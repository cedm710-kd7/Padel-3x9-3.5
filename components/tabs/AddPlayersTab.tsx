
import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, X } from 'lucide-react';
import type { Player, Pair, Tab, Mutations } from '../../types';

interface AddPlayersTabProps {
    players: Player[];
    mutations: Mutations;
    isSimulating: boolean;
    openConfirm: (message: string, onConfirm: () => void) => void;
    setActiveTab: (tab: Tab) => void;
}

const AddPlayersTab: React.FC<AddPlayersTabProps> = ({ players, mutations, isSimulating, openConfirm, setActiveTab }) => {
    const [newPlayerName, setNewPlayerName] = useState('');
    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
    const [confirmedPairs, setConfirmedPairs] = useState<Pair[]>([]);
    const [showMenu, setShowMenu] = useState<string | null>(null); 
    const [isEditing, setIsEditing] = useState<string | null>(null); 
    const [editName, setEditName] = useState('');

    useEffect(() => {
        setConfirmedPairs([]);
        setSelectedPlayers([]);
    }, [players, isSimulating]);

    const handleAddPlayer = () => {
        if (!newPlayerName.trim()) return;
        mutations.addPlayer(newPlayerName.trim());
        setNewPlayerName('');
    };

    const handleDeletePlayer = (player: Player) => {
        openConfirm(`¿Estás seguro de que quieres eliminar a "${player.name}"? Esta acción no se puede deshacer.`, () => {
            mutations.deletePlayer(player.id);
            setShowMenu(null);
            closeConfirm();
        });
    };
    
    const closeConfirm = () => {
      setShowMenu(null);
    }

    const handleUpdatePlayer = (id: string) => {
        if (!editName.trim()) return;
        mutations.updatePlayer(id, editName);
        setIsEditing(null);
        setShowMenu(null);
    };

    const toggleSelectPlayer = (player: Player) => {
      if (confirmedPairs.some(p => p.p1.id === player.id || p.p2.id === player.id)) return;
      if (selectedPlayers.find(p => p.id === player.id)) {
        setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
      } else if (selectedPlayers.length < 2) {
        setSelectedPlayers([...selectedPlayers, player]);
      }
    };

    const createPair = () => {
      if (selectedPlayers.length === 2) {
        const newPair = {
          id: `pair_${Date.now()}`,
          p1: selectedPlayers[0],
          p2: selectedPlayers[1],
          name: `${selectedPlayers[0].name} & ${selectedPlayers[1].name}`
        };
        setConfirmedPairs([...confirmedPairs, newPair]);
        setSelectedPlayers([]);
      }
    };

    const removePair = (pairId: string) => {
      setConfirmedPairs(confirmedPairs.filter(p => p.id !== pairId));
    };

    const startTournament = async () => {
      if (confirmedPairs.length !== 3) return;
      
      const p = confirmedPairs;
      const matchupsTemplate = [
        { t1: p[0], t2: p[1] }, { t1: p[0], t2: p[2] }, { t1: p[1], t2: p[2] },
      ];

      const matches = Array.from({ length: 3 }).flatMap((_, roundIdx) => 
        matchupsTemplate.map((match, matchIdx) => ({
          id: `match_${roundIdx + 1}_${matchIdx}`,
          t1: match.t1,
          t2: match.t2,
          score1: null,
          score2: null,
          played: false,
          round: roundIdx + 1
        }))
      );

      await mutations.startTournament(confirmedPairs, matches);
      setActiveTab('torneo');
    };

    return (
      <div className="p-4 space-y-6 pb-24">
        <h2 className="text-2xl font-bold text-slate-800">
            {isSimulating ? 'Simulación: Jugadores' : 'Gestionar Jugadores'}
        </h2>
        
        <div className="flex gap-2">
          <input 
            value={newPlayerName}
            onChange={e => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            placeholder="Nuevo Jugador..." 
            className="flex-1 p-3 rounded-xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
          <button onClick={handleAddPlayer} className="bg-blue-900 text-white p-3 rounded-xl shadow-lg active:scale-95 transition">
            <Plus />
          </button>
        </div>

        <div>
           <div className="flex justify-between items-end mb-2">
             <h3 className="font-semibold text-slate-600">SELECCIONAR JUGADORES ({selectedPlayers.length}/2)</h3>
             {selectedPlayers.length === 2 && (
               <button onClick={createPair} className="text-sm bg-emerald-500 text-white px-3 py-1 rounded-full font-bold animate-pulse">
                 Crear Pareja
               </button>
             )}
           </div>
           
           <div className="grid grid-cols-2 gap-3">
             {players.map(player => {
               const isSelected = selectedPlayers.find(p => p.id === player.id);
               const hasPair = confirmedPairs.some(p => p.p1.id === player.id || p.p2.id === player.id);
               
               return (
                 <div key={player.id} 
                   className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer select-none
                     ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-white bg-white shadow-sm'}
                     ${hasPair ? 'opacity-50 grayscale' : ''}
                   `}
                   onClick={() => !hasPair && !isEditing && toggleSelectPlayer(player)}
                 >
                    {isEditing === player.id ? (
                        <div className="flex flex-col gap-2 z-20 relative">
                            <input autoFocus value={editName} onChange={e=>setEditName(e.target.value)} className="w-full text-sm p-1 border rounded" />
                            <div className="flex gap-1">
                                <button onClick={() => handleUpdatePlayer(player.id)} className="bg-green-500 text-white text-xs px-2 py-1 rounded">Ok</button>
                                <button onClick={() => setIsEditing(null)} className="bg-red-400 text-white text-xs px-2 py-1 rounded">X</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-800 truncate">{player.name}</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowMenu(showMenu === player.id ? null : player.id); }} 
                                className="p-1 text-slate-400"
                            >
                                <MoreVertical size={16} />
                            </button>
                        </div>
                    )}
                    
                    {showMenu === player.id && !isEditing && (
                        <div className="absolute right-2 top-8 bg-white shadow-xl rounded-lg border z-10 flex flex-col p-1 w-24">
                            <button 
                                onClick={(e)=>{e.stopPropagation(); setEditName(player.name); setIsEditing(player.id); setShowMenu(null);}} 
                                className="text-xs text-left p-2 hover:bg-slate-100 rounded"
                            >
                                Editar
                            </button>
                            <button 
                                onClick={(e)=>{e.stopPropagation(); handleDeletePlayer(player);}} 
                                className="text-xs text-left p-2 text-red-500 hover:bg-red-50 rounded"
                            >
                                Eliminar
                            </button>
                        </div>
                    )}
                 </div>
               );
             })}
           </div>
        </div>

        <div>
            <h3 className="font-semibold text-slate-600 mb-2">PAREJAS CONFIRMADAS ({confirmedPairs.length}/3)</h3>
            <div className="space-y-3">
                {confirmedPairs.map((pair, idx) => (
                    <div key={pair.id} className="bg-white p-4 rounded-xl shadow border-l-4 border-l-amber-400 flex justify-between items-center">
                        <div>
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">Pareja {idx + 1}</span>
                            <div className="font-bold text-lg text-slate-800">{pair.name}</div>
                        </div>
                        <button onClick={() => removePair(pair.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-full">
                            <X size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        <div className="pt-4">
            <button 
                onClick={startTournament}
                disabled={confirmedPairs.length !== 3}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all
                    ${confirmedPairs.length === 3 ? 'bg-blue-900 text-white active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                `}
            >
                INICIAR TORNEO
            </button>
        </div>
      </div>
    );
};

export default AddPlayersTab;
