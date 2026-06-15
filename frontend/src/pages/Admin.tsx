import React, { useState, useEffect } from 'react';
import api from '../api';

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
}

type Winner = 'home' | 'draw' | 'away';

const winnerLabels: Record<Winner, string> = {
  home: 'Casa',
  draw: 'Empate',
  away: 'Fora',
};

const resultColors: Record<string, React.CSSProperties> = {
  home: { background: '#27ae60', color: '#fff' },
  draw: { background: '#f39c12', color: '#fff' },
  away: { background: '#e94560', color: '#fff' },
};

export default function Admin() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Per-match state for winner selection and odds editing
  const [winners, setWinners] = useState<Record<string, Winner>>({});
  const [oddsEdits, setOddsEdits] = useState<Record<string, Odds>>({});
  const [submittingResult, setSubmittingResult] = useState<Record<string, boolean>>({});
  const [submittingOdds, setSubmittingOdds] = useState<Record<string, boolean>>({});

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    api.get<Match[]>('/api/matches')
      .then((res) => {
        setMatches(res.data);
        const initialOdds: Record<string, Odds> = {};
        res.data.forEach((m) => {
          initialOdds[m._id] = { ...m.odds };
        });
        setOddsEdits(initialOdds);
      })
      .catch(() => setError('Erro ao carregar partidas.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRegisterResult = async (matchId: string) => {
    const winner = winners[matchId];
    if (!winner) {
      showToast('Selecione o vencedor antes de registrar.');
      return;
    }
    setSubmittingResult((prev) => ({ ...prev, [matchId]: true }));
    try {
      const res = await api.post(`/api/admin/matches/${matchId}/result`, { winner });
      const msg = res.data?.message || 'Resultado registrado.';
      showToast(msg);
      // Refresh match list
      const updated = await api.get<Match[]>('/api/matches');
      setMatches(updated.data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Erro ao registrar resultado.');
    } finally {
      setSubmittingResult((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  const handleSaveOdds = async (matchId: string) => {
    const odds = oddsEdits[matchId];
    if (!odds) return;
    setSubmittingOdds((prev) => ({ ...prev, [matchId]: true }));
    try {
      await api.patch(`/api/admin/matches/${matchId}/odds`, { odds });
      showToast('Odds atualizadas');
      // Update local match
      setMatches((prev) =>
        prev.map((m) => (m._id === matchId ? { ...m, odds } : m))
      );
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Erro ao salvar odds.');
    } finally {
      setSubmittingOdds((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  const updateOddsField = (matchId: string, field: keyof Odds, value: string) => {
    const num = parseFloat(value);
    setOddsEdits((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: isNaN(num) ? 0 : num,
      },
    }));
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) return <div style={styles.centered}>Carregando...</div>;
  if (error) return <div style={{ ...styles.centered, color: '#c0392b' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Painel Admin — Partidas</h1>

      {toast && (
        <div style={styles.toast}>{toast}</div>
      )}

      {matches.length === 0 ? (
        <p style={{ color: '#777' }}>Nenhuma partida disponível.</p>
      ) : (
        <div style={styles.matchList}>
          {matches.map((match) => (
            <div key={match._id} style={styles.matchCard}>
              <div style={styles.matchHeader}>
                <div>
                  <span style={styles.teamName}>{match.homeTeam}</span>
                  <span style={styles.vs}> vs </span>
                  <span style={styles.teamName}>{match.awayTeam}</span>
                </div>
                <span style={styles.date}>{formatDate(match.date)}</span>
              </div>

              {/* Result section */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Resultado</h4>
                {match.status === 'finished' && match.result ? (
                  <span style={{ ...styles.badge, ...(resultColors[match.result] || {}) }}>
                    {winnerLabels[match.result as Winner] || match.result}
                  </span>
                ) : (
                  <div style={styles.resultRow}>
                    <select
                      value={winners[match._id] || ''}
                      onChange={(e) =>
                        setWinners((prev) => ({
                          ...prev,
                          [match._id]: e.target.value as Winner,
                        }))
                      }
                      style={styles.select}
                    >
                      <option value="">Selecionar vencedor...</option>
                      <option value="home">Casa</option>
                      <option value="draw">Empate</option>
                      <option value="away">Fora</option>
                    </select>
                    <button
                      style={styles.primaryBtn}
                      onClick={() => handleRegisterResult(match._id)}
                      disabled={submittingResult[match._id]}
                    >
                      {submittingResult[match._id] ? 'Registrando...' : 'Registrar Resultado'}
                    </button>
                  </div>
                )}
              </div>

              {/* Odds editing section */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Editar Odds</h4>
                <div style={styles.oddsEditRow}>
                  <div style={styles.oddsField}>
                    <label style={styles.oddsLabel}>Casa</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={oddsEdits[match._id]?.home ?? match.odds.home}
                      onChange={(e) => updateOddsField(match._id, 'home', e.target.value)}
                      style={styles.oddsInput}
                    />
                  </div>
                  <div style={styles.oddsField}>
                    <label style={styles.oddsLabel}>Empate</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={oddsEdits[match._id]?.draw ?? match.odds.draw}
                      onChange={(e) => updateOddsField(match._id, 'draw', e.target.value)}
                      style={styles.oddsInput}
                    />
                  </div>
                  <div style={styles.oddsField}>
                    <label style={styles.oddsLabel}>Fora</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={oddsEdits[match._id]?.away ?? match.odds.away}
                      onChange={(e) => updateOddsField(match._id, 'away', e.target.value)}
                      style={styles.oddsInput}
                    />
                  </div>
                  <button
                    style={styles.secondaryBtn}
                    onClick={() => handleSaveOdds(match._id)}
                    disabled={submittingOdds[match._id]}
                  >
                    {submittingOdds[match._id] ? 'Salvando...' : 'Salvar Odds'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
  toast: {
    position: 'fixed' as const,
    top: 20,
    right: 20,
    background: '#27ae60',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: 6,
    fontSize: 15,
    fontWeight: 600,
    zIndex: 2000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
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
    marginBottom: 16,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1a1a2e',
  },
  vs: {
    color: '#aaa',
    fontSize: 14,
  },
  date: {
    color: '#888',
    fontSize: 13,
  },
  section: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottom: '1px solid #f0f0f0',
  },
  sectionTitle: {
    margin: '0 0 10px',
    fontSize: 13,
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  badge: {
    padding: '4px 14px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    display: 'inline-block',
  },
  resultRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  select: {
    padding: '7px 12px',
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #ccc',
    minWidth: 180,
  },
  primaryBtn: {
    padding: '7px 18px',
    borderRadius: 4,
    border: 'none',
    background: '#e94560',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  oddsEditRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-end',
    flexWrap: 'wrap' as const,
  },
  oddsField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  oddsLabel: {
    fontSize: 12,
    color: '#888',
  },
  oddsInput: {
    padding: '6px 10px',
    fontSize: 14,
    borderRadius: 4,
    border: '1px solid #ccc',
    width: 80,
  },
  secondaryBtn: {
    padding: '7px 18px',
    borderRadius: 4,
    border: 'none',
    background: '#2980b9',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
};
