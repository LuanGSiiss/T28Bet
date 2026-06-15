import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import BetModal from '../components/BetModal';

interface Odds {
  home: number;
  draw: number;
  away: number;
}

interface Match {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  status: 'scheduled' | 'live' | 'finished';
  odds: Odds;
  result?: 'home' | 'draw' | 'away';
  oddsHistory?: Array<{ odds: Odds; recordedAt: string }>;
}

const statusColors: Record<string, React.CSSProperties> = {
  scheduled: { background: '#2980b9', color: '#fff' },
  live: { background: '#e67e22', color: '#fff' },
  finished: { background: '#7f8c8d', color: '#fff' },
};

const statusLabels: Record<string, string> = {
  scheduled: 'Agendado',
  live: 'Ao vivo',
  finished: 'Encerrado',
};

export default function Matches() {
  const { token, updateBalance } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await api.get<Match[]>('/api/matches');
      setMatches(res.data);
    } catch {
      setError('Erro ao carregar partidas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  useWebSocket(token, {
    onOddsUpdate: (data) => {
      setMatches((prev) =>
        prev.map((m) =>
          m._id === data.matchId ? { ...m, odds: data.odds } : m
        )
      );
    },
    onBalanceUpdate: (data) => {
      updateBalance(data.balance);
    },
    onOddsSnapshot: (data) => {
      setMatches((prev) =>
        prev.map((m) => {
          const updated = data.matches.find((u) => u.matchId === m._id);
          return updated ? { ...m, odds: updated.odds } : m;
        })
      );
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <div style={styles.centered}>Carregando partidas...</div>;
  if (error) return <div style={{ ...styles.centered, color: '#c0392b' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Partidas — Copa do Mundo 2026</h1>
      {matches.length === 0 ? (
        <p style={{ color: '#777' }}>Nenhuma partida disponível.</p>
      ) : (
        <div style={styles.matchList}>
          {matches.map((match) => (
            <div key={match._id} style={styles.matchCard}>
              <div style={styles.matchHeader}>
                <div style={styles.teams}>
                  <span style={styles.teamName}>{match.homeTeam}</span>
                  <span style={styles.vs}>vs</span>
                  <span style={styles.teamName}>{match.awayTeam}</span>
                </div>
                <span
                  style={{
                    ...styles.badge,
                    ...statusColors[match.status],
                  }}
                >
                  {statusLabels[match.status]}
                </span>
              </div>
              <div style={styles.matchInfo}>
                <span style={styles.dateText}>{formatDate(match.date)}</span>
              </div>
              <div style={styles.oddsRow}>
                <div style={styles.oddItem}>
                  <span style={styles.oddLabel}>Casa</span>
                  <span style={styles.oddValue}>{match.odds.home.toFixed(2)}</span>
                </div>
                <div style={styles.oddItem}>
                  <span style={styles.oddLabel}>Empate</span>
                  <span style={styles.oddValue}>{match.odds.draw.toFixed(2)}</span>
                </div>
                <div style={styles.oddItem}>
                  <span style={styles.oddLabel}>Fora</span>
                  <span style={styles.oddValue}>{match.odds.away.toFixed(2)}</span>
                </div>
              </div>
              <div style={styles.cardActions}>
                <Link to={`/matches/${match._id}`} style={styles.detailLink}>
                  Ver detalhe
                </Link>
                {match.status === 'scheduled' && (
                  <button
                    style={styles.betBtn}
                    onClick={() => setSelectedMatch(match)}
                  >
                    Apostar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedMatch && (
        <BetModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSuccess={() => {
            setSelectedMatch(null);
          }}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 32px',
    maxWidth: 900,
    margin: '0 auto',
  },
  centered: {
    textAlign: 'center',
    padding: 60,
    fontSize: 18,
    color: '#555',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 24,
  },
  matchList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  matchCard: {
    background: '#fff',
    borderRadius: 8,
    padding: 20,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
  },
  matchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teams: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  teamName: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1a1a2e',
  },
  vs: {
    color: '#999',
    fontSize: 13,
  },
  badge: {
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  matchInfo: {
    marginBottom: 12,
  },
  dateText: {
    color: '#888',
    fontSize: 13,
  },
  oddsRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 14,
  },
  oddItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#f8f9fa',
    borderRadius: 6,
    padding: '8px 20px',
    minWidth: 70,
  },
  oddLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  oddValue: {
    fontSize: 18,
    fontWeight: 700,
    color: '#2980b9',
  },
  cardActions: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
  },
  detailLink: {
    color: '#2980b9',
    textDecoration: 'none',
    fontSize: 14,
    padding: '6px 14px',
    border: '1px solid #2980b9',
    borderRadius: 4,
  },
  betBtn: {
    padding: '6px 18px',
    borderRadius: 4,
    border: 'none',
    background: '#e94560',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
