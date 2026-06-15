import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

interface DepositModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function DepositModal({ onClose, onSuccess }: DepositModalProps) {
  const { updateBalance } = useAuth();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Informe um valor válido.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/wallet/deposit', { amount: numAmount });
      updateBalance(res.data.balance);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao depositar.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={{ marginTop: 0 }}>Adicionar Créditos</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label htmlFor="deposit-amount">Valor (R$)</label>
            <input
              id="deposit-amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={styles.input}
              placeholder="0,00"
              required
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Depositando...' : 'Depositar'}
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
    minWidth: 320,
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginBottom: 16,
  },
  input: {
    padding: '8px 12px',
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc',
    marginTop: 4,
  },
  error: {
    color: '#c0392b',
    margin: '0 0 12px',
  },
  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'flex-end',
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
    background: '#27ae60',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
  },
};
