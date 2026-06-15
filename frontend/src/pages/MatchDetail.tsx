import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

interface Odds {
  home: number;
  draw: number;
  away: number;
}

interface OddsHistoryEntry {
  odds: Odds;
  recordedAt: string;
}

interface Match {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  status: 'scheduled' | 'live' | 'finished';
  odds: Odds;
  result?: 'home' | 'draw' | 'away';
  oddsHistory: OddsHistoryEntry[];
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

const resultLabels: Record<string, string> = {
  home: 'Casa',
  draw: 'Empate',
  away: 'Fora',
};

const resultColors: Record<string, React.CSSProperties> = {
  home: { background: '#27ae60', color: '#fff' },
  draw: { background: '#f39c12', color: '#fff' },
  away: { background: '#e94560', color: '#fff' },
};

export default function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get<Match>(`/api/matches/${id}`)
      .then((res) => setMatch(res.data))
      .catch(() => setError('Erro ao carregar partida.'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) return <div style={styles.centered}>Carregando partida...</div>;
  if (error || !match) {
    return (
      <div style={{ ...styles.centered, color: '#c0392b' }}>
        {error || 'Partida não encontrada.'}
        <br />
        <Link to="/" style={{ color: '#2980b9', marginTop: 12, display: 'inline-block' }}>
          Voltar para Partidas
        </Link>
      </div>
    );
  }

  const sortedHistory = [...(match.oddsHistory || [])].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>← Voltar para Partidas</Link>

      <div style={styles.card}>
        <div style={styles.matchHeader}>
          <div style={styles.teams}>
            <span style={styles.teamName}>{match.homeTeam}</span>
            <span style={styles.vsText}>vs</span>
            <span style={styles.teamName}>{match.awayTeam}</span>
          </div>
          <div style={styles.badges}>
            <span style={{ ...styles.badge, ...(statusColors[match.status] || {}) }}>
              {statusLabels[match.status] || match.status}
            </span>
            {match.status === 'finished' && match.result && (
              <span style={{ ...styles.badge, ...(resultColors[match.result] || {}) }}>
                Resultado: {resultLabels[match.result]}
              </span>
            )}
          </div>
        </div>

        <div style={styles.dateRow}>
          <span style={styles.dateText}>{formatDate(match.date)}</span>
        </div>

        <h3 style={styles.sectionTitle}>Odds Atuais</h3>
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
      </div>

      {sortedHistory.length > 0 && (
        <div style={styles.historySection}>
          <h2 style={styles.sectionTitle}>Histórico de Odds</h2>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Data / Hora</th>
                  <th style={styles.th}>Casa</th>
                  <th style={styles.th}>Empate</th>
                  <th style={styles.th}>Fora</th>
                </tr>
              </thead>
              <tbody>
                {sortedHistory.map((entry, idx) => (
                  <tr key={idx} style={styles.tr}>
                    <td style={styles.td}>{formatDate(entry.recordedAt)}</td>
                    <td style={styles.td}>{entry.odds.home.toFixed(2)}</td>
                    <td style={styles.td}>{entry.odds.draw.toFixed(2)}</td>
                    <td style={styles.td}>{entry.odds.away.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sortedHistory.length === 0 && (
        <p style={{ color: '#888', marginTop: 20 }}>Nenhum histórico de odds disponível.</p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 32px',
    maxWidth: 800,
    margin: '0 auto',
  },
  centered: {
    textAlign: 'center',
    padding: 60,
    fontSize: 18,
    color: '#555',
  },
  backLink: {
    color: '#2980b9',
    textDecoration: 'none',
    fontSize: 14,
    display: 'inline-block',
    marginBottom: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
    marginBottom: 24,
  },
  matchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  teams: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  teamName: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a1a2e',
  },
  vsText: {
    color: '#aaa',
    fontSize: 15,
  },
  badges: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  badge: {
    padding: '4px 12px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-block',
  },
  dateRow: {
    marginBottom: 16,
  },
  dateText: {
    color: '#888',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: 12,
    marginTop: 0,
  },
  oddsRow: {
    display: 'flex',
    gap: 12,
  },
  oddItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#f8f9fa',
    borderRadius: 6,
    padding: '10px 24px',
    minWidth: 80,
  },
  oddLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  oddValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#2980b9',
  },
  historySection: {
    background: '#fff',
    borderRadius: 8,
    padding: 24,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #eee',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  theadRow: {
    background: '#1a1a2e',
  },
  th: {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '10px 16px',
    fontSize: 14,
    color: '#333',
  },
};
