import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DepositModal from './DepositModal';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDeposit, setShowDeposit] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatBalance = (balance: number) => {
    return balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <>
      <header style={styles.header}>
        <div style={styles.brand}>
          <Link to="/" style={styles.brandLink}>T28Bet</Link>
        </div>

        <nav style={styles.nav}>
          <Link to="/" style={styles.navLink}>Partidas</Link>
          <Link to="/bets" style={styles.navLink}>Histórico</Link>
          <Link to="/transactions" style={styles.navLink}>Extrato</Link>
          {user?.isAdmin && (
            <Link to="/admin" style={{ ...styles.navLink, color: '#f39c12' }}>Admin</Link>
          )}
        </nav>

        <div style={styles.userSection}>
          {user && (
            <>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.balance}>{formatBalance(user.balance)}</span>
              <button
                onClick={() => setShowDeposit(true)}
                style={styles.depositBtn}
              >
                + Créditos
              </button>
            </>
          )}
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sair
          </button>
        </div>
      </header>

      {showDeposit && (
        <DepositModal
          onClose={() => setShowDeposit(false)}
          onSuccess={() => setShowDeposit(false)}
        />
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#1a1a2e',
    color: '#fff',
    padding: '12px 24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  brand: {
    fontWeight: 700,
    fontSize: 22,
  },
  brandLink: {
    color: '#e94560',
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: 22,
  },
  nav: {
    display: 'flex',
    gap: 20,
  },
  navLink: {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: 15,
    transition: 'color 0.2s',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    color: '#eee',
    fontSize: 14,
  },
  balance: {
    color: '#2ecc71',
    fontWeight: 600,
    fontSize: 15,
    background: 'rgba(46,204,113,0.15)',
    padding: '4px 10px',
    borderRadius: 4,
  },
  depositBtn: {
    padding: '6px 14px',
    borderRadius: 4,
    border: 'none',
    background: '#2980b9',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  logoutBtn: {
    padding: '6px 14px',
    borderRadius: 4,
    border: '1px solid #e94560',
    background: 'transparent',
    color: '#e94560',
    cursor: 'pointer',
    fontSize: 13,
  },
};
