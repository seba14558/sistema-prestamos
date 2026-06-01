import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, TextField, Button, Typography, Alert, 
  CircularProgress, Card, InputAdornment, IconButton
} from '@mui/material';
import { 
  Person, Lock, Visibility, VisibilityOff, AccountBalance
} from '@mui/icons-material';
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
  background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
}}>
      {/* Background effects */}
      <Box sx={{ 
        position: 'absolute', 
        top: '-10%', 
        left: '-5%', 
        width: 300, 
        height: 300, 
        bgcolor: 'rgba(99, 102, 241, 0.15)', 
        borderRadius: '50%', 
        filter: 'blur(80px)' 
      }} />
      <Box sx={{ 
        position: 'absolute', 
        bottom: '-10%', 
        right: '-5%', 
        width: 400, 
        height: 400, 
        bgcolor: 'rgba(236, 72, 153, 0.1)', 
        borderRadius: '50%', 
        filter: 'blur(100px)' 
      }} />

      <Box sx={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 320 }}>
        <Card sx={{ 
          bgcolor: 'rgba(30, 41, 59, 0.7)', 
          backdropFilter: 'blur(20px)', 
          border: '1px solid rgba(255, 255, 255, 0.08)', 
          borderRadius: 3, 
          p: 4, 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
        }}>
          {/* Logo */}
         <Box sx={{ 
  width: 64, 
  height: 64, 
  borderRadius: '50%', 
  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'center', 
  mx: 'auto', 
  mb: 3,
  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
}}>
  <AccountBalance sx={{ fontSize: 32, color: 'white' }} />
</Box>

          <Typography variant="h4" fontWeight="bold" align="center" sx={{ 
            background: 'linear-gradient(90deg, #fff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 0.5
          }}>
            NUEVA OPCIÓN
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 4 }}>
            Gestión y Administración de Cobros
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Nombre de Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
              autoComplete="username"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(15, 23, 42, 0.4)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                }
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255, 255, 255, 0.4)' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(15, 23, 42, 0.4)',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(99, 102, 241, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6366f1',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 2.5,
                fontWeight: 'bold',
                borderRadius: 5,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                  transform: 'translateY(-2px)'
                },
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
            </Button>
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginPage;
