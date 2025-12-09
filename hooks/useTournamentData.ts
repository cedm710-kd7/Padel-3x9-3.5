import { useState, useEffect, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, appId, isFirebaseInitialized } from '../services/firebase';
import * as firestoreService from '../services/firestoreService';
import type { Role, Player, Pair, Match, TournamentState, HistoryEntry, RankingStat, H2HStats, UseTournamentDataReturn } from '../types';

export const useTournamentData = (role: Role | null, user: User | null): UseTournamentDataReturn => {
    const isSimulating = role === 'simulator';

    // Real data from Firestore
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentState, setCurrentState] = useState<TournamentState | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Simulated data
    const [simPlayers, setSimPlayers] = useState<Player[]>([]);
    const [simCurrentState, setSimCurrentState] = useState<TournamentState | null>(null);

    // Firestore listeners for real data
    useEffect(() => {
        if (isSimulating || !user || !isFirebaseInitialized || !db) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const playersPath = `artifacts/${appId}/public/data/players`;
        const qPlayers = query(collection(db, playersPath));
        const unsubPlayers = onSnapshot(qPlayers, (snapshot) => {
            const pData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Player));
            setPlayers(pData.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
            setLoading(false);
        }, (err) => {
            console.error("Error fetching players", err);
            setLoading(false);
        });

        const currentPath = `artifacts/${appId}/public/data/tournament_data/active`;
        const docCurrent = doc(db, currentPath);
        const unsubCurrent = onSnapshot(docCurrent, (snapshot) => {
            setCurrentState(snapshot.exists() ? snapshot.data() as TournamentState : null);
        }, (err) => console.error("Error fetching current state", err));

        const historyPath = `artifacts/${appId}/public/data/history`;
        const qHistory = query(collection(db, historyPath), orderBy('date', 'desc'));
        const unsubHistory = onSnapshot(qHistory, (snapshot) => {
            const hData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HistoryEntry));
            setHistory(hData);
        }, (err) => console.error("Error fetching history", err));

        return () => {
            unsubPlayers();
            unsubCurrent();
            unsubHistory();
        };
    }, [user, isSimulating]);

    // Mutations for simulation mode
    const simMutations = useMemo(() => ({
        addPlayer: async (name: string) => {
            const newPlayer = { id: `sim_${Date.now()}_${simPlayers.length}`, name: name.trim() };
            setSimPlayers(prev => [...prev, newPlayer].sort((a, b) => a.name.localeCompare(b.name)));
        },
        deletePlayer: async (playerId: string) => {
            setSimPlayers(prev => prev.filter(p => p.id !== playerId));
            setSimCurrentState(null); 
        },
        updatePlayer: async (id: string, newName: string) => {
            setSimPlayers(prev => prev.map(p => p.id === id ? { ...p, name: newName.trim() } : p));
            setSimCurrentState(null);
        },
        startTournament: async (pairs: Pair[], matches: Match[]) => {
            setSimCurrentState({
                active: true,
                startTime: new Date().toISOString(),
                pairs: pairs,
                matches: matches
            });
        },
        updateScore: async (matchIndex: number, team: 1 | 2, score: number) => {
            setSimCurrentState(prev => {
                if (!prev) return null;
                const matches = [...prev.matches];
                const match = { ...matches[matchIndex] };
                
                if (team === 1) match.score1 = score;
                if (team === 2) match.score2 = score;

                if (match.score1 !== null && match.score2 !== null) {
                    const isInvalid = (match.score1 === 0 && match.score2 === 0) || (match.score1 === 3 && match.score2 === 3) || (match.score1 === match.score2);
                    match.played = !isInvalid;
                } else {
                    match.played = false;
                }
                matches[matchIndex] = match;
                return { ...prev, matches };
            });
        },
        finishTournament: async () => { 
            setSimCurrentState(null);
        },
        suspendTournament: async () => { 
            setSimCurrentState(null); 
        },
        deleteHistory: async () => { 
            console.log("Operation not permitted in simulation mode."); 
        }
    }), [simPlayers]);

    // Mutations for Firestore
    const firestoreMutations = useMemo(() => ({
        addPlayer: (name: string) => firestoreService.addPlayer(name),
        deletePlayer: (playerId: string) => firestoreService.deletePlayer(playerId),
        updatePlayer: (id: string, newName: string) => firestoreService.updatePlayer(id, newName),
        startTournament: (pairs: Pair[], matches: Match[]) => firestoreService.startTournament(pairs, matches),
        updateScore: (matchIndex: number, team: 1 | 2, score: number) => {
            if (!currentState) return Promise.resolve();
            return firestoreService.updateScore(currentState, matchIndex, team, score);
        },
        finishTournament: (winner: RankingStat, stats: RankingStat[], h2hStats: H2HStats) => {
            if (!currentState) return Promise.resolve();
            return firestoreService.finishTournament(currentState, winner, stats, h2hStats);
        },
        suspendTournament: () => firestoreService.suspendTournament(),
        deleteHistory: () => firestoreService.deleteHistory(history),
    }), [currentState, history]);

    return {
        players: isSimulating ? simPlayers : players,
        currentState: isSimulating ? simCurrentState : currentState,
        history, // History is only ever real
        mutations: isSimulating ? simMutations : firestoreMutations,
        isSimulating,
        loading
    };
};
