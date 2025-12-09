import { 
  collection, doc, setDoc, deleteDoc, addDoc, writeBatch 
} from 'firebase/firestore';
import { db, appId } from './firebase';
import type { Player, Pair, Match, TournamentState, HistoryEntry, RankingStat, H2HStats } from '../types';

const paths = {
    players: `artifacts/${appId}/public/data/players`,
    tournamentActive: `artifacts/${appId}/public/data/tournament_data/active`,
    history: `artifacts/${appId}/public/data/history`
};

const ensureDb = () => {
    if (!db) {
        throw new Error("Firestore DB is not initialized. Cannot perform Firestore operation.");
    }
};

// Player Mutations
export const addPlayer = async (name: string): Promise<void> => {
    ensureDb();
    if (!name.trim()) return;
    await addDoc(collection(db, paths.players), { name: name.trim() });
};

export const deletePlayer = async (playerId: string): Promise<void> => {
    ensureDb();
    await deleteDoc(doc(db, paths.players, playerId));
};

export const updatePlayer = async (id: string, newName: string): Promise<void> => {
    ensureDb();
    if (!newName.trim()) return;
    await setDoc(doc(db, paths.players, id), { name: newName.trim() }, { merge: true });
};

// Tournament Mutations
export const startTournament = async (pairs: Pair[], matches: Match[]): Promise<void> => {
    ensureDb();
    const newTournamentState: TournamentState = {
        active: true,
        startTime: new Date().toISOString(),
        pairs: pairs,
        matches: matches
    };
    await setDoc(doc(db, paths.tournamentActive), newTournamentState);
};

export const updateScore = async (currentState: TournamentState, matchIndex: number, team: 1 | 2, score: number): Promise<void> => {
    ensureDb();
    const matches = [...currentState.matches];
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

    const newDoc = { ...currentState, matches };
    await setDoc(doc(db, paths.tournamentActive), newDoc);
};

export const finishTournament = async (currentState: TournamentState, winner: RankingStat, stats: RankingStat[], h2hStats: H2HStats): Promise<void> => {
    ensureDb();
    const tournamentRecord = {
        date: new Date().toISOString(),
        winner: winner,
        ranking: stats,
        h2hMatches: h2hStats,
        matches: currentState.matches,
        pairs: currentState.pairs
    };
    const batch = writeBatch(db);
    const historyRef = doc(collection(db, paths.history));
    batch.set(historyRef, tournamentRecord);
    const currentRef = doc(db, paths.tournamentActive);
    batch.delete(currentRef);
    await batch.commit();
};

export const suspendTournament = async (): Promise<void> => {
    ensureDb();
    await deleteDoc(doc(db, paths.tournamentActive));
};

export const deleteHistory = async (history: HistoryEntry[]): Promise<void> => {
    ensureDb();
    const batch = writeBatch(db);
    history.forEach(h => {
        batch.delete(doc(db, paths.history, h.id));
    });
    await batch.commit();
};
