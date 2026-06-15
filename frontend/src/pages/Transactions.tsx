import React, { useState, useEffect } from 'react';
import api from '../api';

interface Transaction {
  _id: string;
  type: 'bet' | 'deposit' | 'prize';
  amount: number;
  description: string;
  createdAt: string;
}

const typeBadge: Record<string, React.CSSProperties> = {
  bet: { background: '#2980b9', color: '#fff' },
  deposit: { background: '#27ae60', color: '#fff' },
  prize: { background: '#f39c12', color: '#fff' },
};

const typeLabels: Record<string, string> = {
  bet: 'Aposta',
  deposit: 'Depósito',
  prize: 'Prêmio',
};

const amountColor: Record<string, string> = {
  bet: '#c0392b',
  deposit: '#27ae60',
  prize: '#27ae60',
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Transaction[]>('/api/wallet/transactions')
      .then((res) => setTransactions(res.data))
      .catch(() => setError('Erro ao carregar extrato.'))
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

  if (loading) return <div style={styles.centered}>Carregando extrato...</div>;
  if (error) return <div style={{ ...styles.centered, color: '#c0392b' }}>{error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.pageTitle}>Extrato</h1>
      {transactions.length === 0 ? (
        <p style={{ color: '#777' }}>Nenhuma transação encontrada.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Tipo</th>
                <th style={styles.th}>Descrição</th>
                <th style={styles.th}>Valor</th>
                <th style={styles.th}>Data</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} style={styles.tr}>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(typeBadge[tx.type] || { background: '#95a5a6', color: '#fff' }),
                      }}
                    >
                      {typeLabels[tx.type] || tx.type}
                    </span>
                  </td>
                  <td style={styles.td}>{tx.description}</td>
                  <td
                    style={{
                      ...styles.td,
                      color: amountColor[tx.type] || '#333',
                      fontWeight: 600,
                    }}
                  >
                    {tx.type === 'bet' ? '-' : '+'}
                    {formatCurrency(Math.abs(tx.amount))}
                  </td>
                  <td style={styles.td}>{formatDate(tx.createdAt)}</td>
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
