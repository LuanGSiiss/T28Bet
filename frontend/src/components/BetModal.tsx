import React, { useState } from 'react';
import api from '../api';

interface Match {
  _id: string;
  homeTeam: string;
  awayTeam: string;
  odds: { home: number; draw: number; away: number };
}

interface BetModalProps {
  match: Match;
  onClose: () => void;
  onSuccess: () => void;
}

type Market = 'home' | 'draw' | 'away';

export default function BetModal({ match, onClose, onSuccess }: BetModalProps) {
  const [market, setMarket] = useState<Market>('home');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const oddsMap: Record<Market, number> = {
    home: match.odds.home,
    draw: match.odds.draw,
    away: match.odds.away,
  };

  const marketLabels: Record<Market, string> = {
    home: 'Casa',
    draw: 'Empate',
    away: 'Fora',
  };

  const selectedOdds = oddsMap[market];
  const numAmount = parseFloat(amount);
  const potentialReturn = !isNaN(numAmount) && numAmount > 0 ? numAmount * selectedOdds : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Informe um valor válido.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/bets', {
        matchId: match._id,
        market,
        amount: numAmount,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao registrar aposta.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={{ marginTop: 0 }}>
          Apostar — {match.homeTeam} vs {match.awayTeam}
        </h2>

        <div style={styles.field}>
          <label style={styles.label}>Mercado</label>
          <div style={styles.radioGroup}>
            {(['home', 'draw', 'away'] as Market[]).map((m) => (
              <label key={m} style={styles.radioLabel}>
                <input
                  type="radio"
                  name="market"
                  value={m}
                  checked={market === m}
                  onChange={() => setMarket(m)}
                  style={{ marginRight: 6 }}
                />
                {marketLabels[m]}
                <span style={styles.odds}> @{oddsMap[m].toFixed(2)}</span>
              </label>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label htmlFor="bet-amount" style={styles.label}>Valor (R$)</label>
            <input
              id="bet-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.input}
              placeholder="0,00"
              required
            />
          </div>

          {potentialReturn > 0 && (
            <div style={styles.returnBox}>
              Retorno potencial:{' '}
              <strong>
                {potentialReturn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Apostando...' : 'Confirmar Aposta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 8,
    padding: 32,
    minWidth: 380,
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontWeight: 600,
    marginBottom: 8,
    fontSize: 14,
  },
  radioGroup: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap' as const,
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: 14,
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: 4,
  },
  odds: {
    color: '#2980b9',
    fontWeight: 600,
    marginLeft: 4,
  },
  input: {
    padding: '8px 12px',
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  returnBox: {
    background: '#eafaf1',
    border: '1px solid #27ae60',
    borderRadius: 4,
    padding: '10px 14px',
    marginBottom: 16,
    fontSize: 15,
  },
  error: {
    color: '#c0392b',
    margin: '0 0 12px',
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelBtn: {
    padding: '8px 20px',
    borderRadius: 4,
    border: '1px solid #ccc',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
  submitBtn: {
    padding: '8px 20px',
    borderRadius: 4,
    border: 'none',
    background: '#e94560',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
};
