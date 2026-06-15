import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import Matches from './pages/Matches';
import BetHistory from './pages/BetHistory';
import Transactions from './pages/Transactions';
import MatchDetail from './pages/MatchDetail';
import Admin from './pages/Admin';

function PrivateLayout() {
  return (
    <>
      <Header />
      <main style={{ background: '#f4f6f9', minHeight: 'calc(100vh - 60px)' }}>
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private routes with Header layout */}
          <Route
            element={
              <PrivateRoute>
                <PrivateLayout />
              </PrivateRoute>
            }
          >
            <Route path="/" element={<Matches />} />
            <Route path="/bets" element={<BetHistory />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route
              path="/admin"
              element={
                <PrivateRoute requireAdmin>
                  <Admin />
                </PrivateRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
