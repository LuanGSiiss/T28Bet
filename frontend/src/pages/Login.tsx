import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError(err.response.data?.message || 'Credenciais inválidas.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>T28Bet</h1>
        <h2 style={styles.subtitle}>Entrar</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="email" style={styles.label}>E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              autoComplete="email"
            />
          </div>
          <div style={styles.field}>
            <label htmlFor="password" style={styles.label}>Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p style={styles.registerLink}>
          Não tem conta?{' '}
          <Link to="/register" style={styles.link}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1a1a2e',
  },
  card: {
    background: '#fff',
    borderRadius: 8,
    padding: 40,
    width: 360,
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  },
  title: {
    textAlign: 'center',
    color: '#e94560',
    marginTop: 0,
    fontSize: 32,
    fontWeight: 800,
  },
  subtitle: {
    textAlign: 'center',
    color: '#333',
    marginTop: 0,
    marginBottom: 24,
    fontSize: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
    color: '#555',
  },
  input: {
    padding: '10px 12px',
    fontSize: 15,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  error: {
    color: '#c0392b',
    margin: '0 0 12px',
    fontSize: 14,
  },
  submitBtn: {
    padding: '12px',
    borderRadius: 4,
    border: 'none',
    background: '#e94560',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 4,
  },
  registerLink: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#555',
  },
  link: {
    color: '#e94560',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
