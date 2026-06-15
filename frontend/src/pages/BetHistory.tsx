import React, { useState, useEffect } from 'react';
import api from '../api';

interface BetMatch {
  homeTeam: string;
  awayTeam: string;
  date: string;
}

interface Bet {
  _id: string;
  matchId: BetMatch;
  market: 'home' | 'draw' | 'away';
  amount: number;
  odds: number;
  potentialReturn: number;
  status: 'pending' | 'won' | 'lost';
  createdAt: string;
}

const marketLabels: Record<string, string> = {
  home: 'Casa',
  draw: 'Empate',
  away: 'Fora',
};

const statusBadge: Record<string, React.CSSProperties> = {
  pending: { background: '#f39c12', color: '#fff' },
  won: { background: '#27ae60', color: '#fff' },
  lost: { background: '#c0392b', color: '#fff' },
};

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  won: 'Ganhou',
  lost: 'Perdeu',
};

export default function BetHistory() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Bet[]>('/api/bets')
      .then((res) => setBets(res.data))
      .catch(() => setError('Erro ao carregar histórico.'))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) return <div style={styles.centered}>Carregando histórico...</div>;
  if (error) return <div style={{ ...styles.centered, color: '#c0392b' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Histórico de Apostas</h1>
      {bets.length === 0 ? (
        <p style={{ color: '#777' }}>Nenhuma aposta encontrada.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Partida</th>
                <th style={styles.th}>Mercado</th>
                <th style={styles.th}>Valor</th>
                <th style={styles.th}>Odds</th>
                <th style={styles.th}>Retorno Potencial</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Data</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet._id} style={styles.tr}>
                  <td style={styles.td}>
                    {bet.matchId?.homeTeam} vs {bet.matchId?.awayTeam}
                  </td>
                  <td style={styles.td}>{marketLabels[bet.market] || bet.market}</td>
                  <td style={styles.td}>{formatCurrency(bet.amount)}</td>
                  <td style={styles.td}>{bet.odds.toFixed(2)}</td>
                  <td style={styles.td}>{formatCurrency(bet.potentialReturn)}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(statusBadge[bet.status] || { background: '#95a5a6', color: '#fff' }),
                      }}
                    >
                      {statusLabels[bet.status] || bet.status}
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(bet.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 32px',
    maxWidth: 1100,
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
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  theadRow: {
    background: '#1a1a2e',
    color: '#fff',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #eee',
  },
  td: {
    padding: '12px 16px',
    fontSize: 14,
    color: '#333',
    verticalAlign: 'middle',
  },
  badge: {
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    display: 'inline-block',
  },
};
