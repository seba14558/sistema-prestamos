import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Alert,
  CircularProgress, Card
} from '@mui/material';
import { MonetizationOn } from '@mui/icons-material';
import api from '../services/api';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.rol === 'admin') navigate('/admin/dashboard');
        else if (user.rol === 'cobrador') navigate('/cobrador/collection');
      } catch (e) {
        localStorage.clear();
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Llamada corregida al backend usando nuestro servicio de API centralizado
      const res = await api.post('/auth/login', {
        usuario: username,
        password
      });

      const { token, usuario, rol } = res.data;

      // Guardar sesión
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ usuario, rol }));

      // Redirección corregida según el rol retornado ('rol')
      if (rol === 'admin') {
        navigate('/admin/dashboard');
      } else if (rol === 'cobrador') {
        navigate('/cobrador/collection');
      } else {
        setError('Rol de usuario no reconocido.');
        localStorage.clear();
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error al conectar con el servidor. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      background: 'radial-gradient(circle at top, rgba(79, 70, 229, 0.22) 0%, transparent 35%), linear-gradient(135deg, #0f172a 0%, #111827 50%, #0f172a 100%)',
      px: 2,
    }}>
      {/* Background effects */}
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: 300,
        height: 300,
        bgcolor: 'rgba(79, 70, 229, 0.16)',
        borderRadius: '50%',
        filter: 'blur(80px)'
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: 400,
        height: 400,
        bgcolor: 'rgba(16, 185, 129, 0.08)',
        borderRadius: '50%',
        filter: 'blur(100px)'
      }} />

      <Box sx={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 460 }}>
        <Card sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          borderRadius: 4,
          p: { xs: 3, sm: 4.5 },
          boxShadow: '0 32px 70px -20px rgba(0, 0, 0, 0.55)'
        }}>
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.14) 0%, rgba(16, 185, 129, 0.05) 100%)', pointerEvents: 'none' }} />
          {/* Logo */}
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{
              width: 72,
              height: 72,
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 16px 35px -10px rgba(79, 70, 229, 0.55)'
            }}>
              <MonetizationOn sx={{ fontSize: 34, color: 'white' }} />
            </Box>

            <Typography variant="h4" fontWeight="bold" align="center" sx={{
              color: 'white',
              mb: 0.75,
              letterSpacing: '-0.03em'
            }}>
              NUEVA OPCIÓN
            </Typography>
            <Typography variant="body2" align="center" sx={{ color: 'rgba(226, 232, 240, 0.78)', mb: 3 }}>
              Gestión y administración de préstamos y cobros
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.24)' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
              <div className="space-y-4 mb-6">
                <div className="space-y-1.5 text-left">
                  <label className="block text-sm font-medium text-gray-200">
                    Nombre de usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      required
                      autoComplete="username"
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all text-sm"
                      placeholder="Ingresá tu usuario"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="block text-sm font-medium text-gray-200">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1] transition-all text-sm"
                      placeholder="Ingresá tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-[#818cf8] transition-colors cursor-pointer z-20 focus:outline-none"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#818cf8]">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hover:text-[#818cf8]">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.7,
                  fontWeight: 800,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #059669 100%)',
                    boxShadow: '0 16px 30px -12px rgba(79, 70, 229, 0.55)',
                    transform: 'translateY(-2px)'
                  },
                  boxShadow: '0 14px 28px -12px rgba(79, 70, 229, 0.45)',
                  transition: 'all 0.2s',
                  letterSpacing: '0.02em'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginPage;
