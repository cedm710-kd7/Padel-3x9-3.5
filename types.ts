
import type { User } from 'firebase/auth';

export type Role = 'admin' | 'spectator' | 'simulator';
export type Tab = 'agregar' | 'torneo' | 'live' | 'ranking';

export interface Player {
    id: string;
    name: string;
}

export interface Pair {
    id: string;
    p1: Player;
    p2: Player;
    name: string;
}

export interface Match {
    id: string;
    t1: Pair;
    t2: Pair;
    score1: number | null;
    score2: number | null;
    played: boolean;
    round: number;
}

export interface TournamentState {
    active: boolean;
    startTime: string;
    pairs: Pair[];
    matches: Match[];
}

export interface RankingStat {
    id: string;
    name: string;
    pg: number;
    pp: number;
    matchesWon: number;
    matchesLost: number;
}

export interface H2HStats {
    [pairId1: string]: {
        [pairId2: string]: {
            matchesWon: number;
            matchesLost: number;
        };
    };
}

export interface HistoryEntry {
    id: string;
    date: string;
    winner: RankingStat;
    ranking: RankingStat[];
    h2hMatches: H2HStats;
    matches: Match[];
    pairs: Pair[];
}

export interface Mutations {
    addPlayer: (name: string) => Promise<void>;
    deletePlayer: (playerId: string) => Promise<void>;
    updatePlayer: (id: string, newName: string) => Promise<void>;
    startTournament: (pairs: Pair[], matches: Match[]) => Promise<void>;
    updateScore: (matchIndex: number, team: 1 | 2, score: number) => Promise<void>;
    finishTournament: (winner: RankingStat, stats: RankingStat[], h2hStats: H2HStats) => Promise<void>;
    suspendTournament: () => Promise<void>;
    deleteHistory: () => Promise<void>;
}

export interface UseTournamentDataReturn {
    players: Player[];
    currentState: TournamentState | null;
    history: HistoryEntry[];
    mutations: Mutations;
    isSimulating: boolean;
    loading: boolean;
}

export interface UseAuthReturn {
  user: User | null;
  role: Role | null;
  loading: boolean;
  login: (selectedRole: Role) => Promise<void>;
  logout: () => Promise<void>;
}
