
import type { TournamentState, HistoryEntry, RankingStat, H2HStats, Pair } from '../types';

export const calculateLiveStats = (currentState: TournamentState): RankingStat[] => {
    const map: { [key: string]: RankingStat } = {};
    
    currentState.pairs.forEach(p => {
        map[p.id] = { 
            id: p.id, 
            name: p.name, 
            pg: 0, 
            pp: 0, 
            matchesWon: 0, 
            matchesLost: 0,
        };
    });

    currentState.matches.forEach(m => {
        if (m.played && m.score1 !== null && m.score2 !== null) {
            map[m.t1.id].pg += m.score1;
            map[m.t1.id].pp += m.score2;
            map[m.t2.id].pg += m.score2;
            map[m.t2.id].pp += m.score1;

            if (m.score1 > m.score2) {
                map[m.t1.id].matchesWon += 1;
                map[m.t2.id].matchesLost += 1;
            } else if (m.score2 > m.score1) {
                map[m.t2.id].matchesWon += 1;
                map[m.t1.id].matchesLost += 1;
            }
        }
    });

    return Object.values(map).sort((a, b) => b.pg - a.pg || b.matchesWon - a.matchesWon);
};

export const calculateH2HStats = (currentState: TournamentState): H2HStats => {
    const h2h: H2HStats = {};
    const pairIds = currentState.pairs.map(p => p.id);

    pairIds.forEach(id1 => {
        h2h[id1] = {};
        pairIds.forEach(id2 => {
            if (id1 !== id2) {
                h2h[id1][id2] = { matchesWon: 0, matchesLost: 0 }; 
            }
        });
    });

    currentState.matches.forEach(m => {
        if (m.played && m.score1 !== null && m.score2 !== null) {
            const id1 = m.t1.id; 
            const id2 = m.t2.id; 
            
            if (!h2h[id1] || !h2h[id2]) return;

            if (m.score1 > m.score2) {
                h2h[id1][id2].matchesWon += 1;
                h2h[id2][id1].matchesLost += 1;
            } else if (m.score2 > m.score1) {
                h2h[id2][id1].matchesWon += 1;
                h2h[id1][id2].matchesLost += 1;
            }
        }
    });

    return h2h;
};
