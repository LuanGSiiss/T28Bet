import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

interface FieldError {
  field: string;
  message: string;
}

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 400 && data?.errors) {
        const errs: Record<string, string> = {};
        (data.errors as FieldError[]).forEach((fe) => {
          errs[fe.field] = fe.message;
        });
        setFieldErrors(errs);
      } else if (status === 409) {
        setGeneralError(data?.message || 'E-mail já cadastrado.');
      } else {
        setGeneralError('Erro ao cadastrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>T28Bet</h1>
        <h2 style={styles.subtitle}>Criar Conta</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label htmlFor="name" style={styles.label}>Nome</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
              autoComplete="name"
            />
            {fieldErrors.name && <span style={styles.fieldError}>{fieldErrors.name}</span>}
          </div>
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
            {fieldErrors.email && <span style={styles.fieldError}>{fieldErrors.email}</span>}
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
              autoComplete="new-password"
            />
            {fieldErrors.password && <span style={styles.fieldError}>{fieldErrors.password}</span>}
          </div>
          {generalError && <p style={styles.error}>{generalError}</p>}
          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Criar Conta'}
          </button>
        </form>
        <p style={styles.loginLink}>
          Já tem conta?{' '}
          <Link to="/login" style={styles.link}>Entrar</Link>
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
  fieldError: {
    color: '#c0392b',
    fontSize: 12,
    marginTop: 4,
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
  loginLink: {
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
