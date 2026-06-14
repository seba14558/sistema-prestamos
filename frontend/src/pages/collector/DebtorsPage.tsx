import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Alert, CircularProgress, Card, Chip, TextField
} from '@mui/material';
import { Warning, Home, Payment } from '@mui/icons-material';
import api from '../../services/api';

interface Loan {
  id: number;
  cliente_id: number;
  cliente_nombre?: string;
  cliente_apellido?: string;
  cliente_direccion?: string;
  plan: string;
  monto: string | number;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado: string;
}

const DebtorsPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchDebtors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/prestamos');
      // Filtrar por morosos o vencidos
      const debtors = res.data.filter((l: Loan) => l.estado === 'moroso' || l.estado === 'vencido');
      setLoans(debtors);
      setFilteredLoans(debtors);
    } catch (err) {
      console.error(err);
      setError('Error al obtener la lista de morosos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtors();
  }, []);

  // Filtrar morosos en tiempo real
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredLoans(loans);
    } else {
      const term = search.toLowerCase();
      const filtered = loans.filter(
        l => 
          (l.cliente_nombre && l.cliente_nombre.toLowerCase().includes(term)) ||
          (l.cliente_apellido && l.cliente_apellido.toLowerCase().includes(term)) ||
          (l.cliente_direccion && l.cliente_direccion.toLowerCase().includes(term)) ||
          String(l.id).includes(term)
      );
      setFilteredLoans(filtered);
    }
  }, [search, loans]);

  const getDaysOverdue = (dueDateStr: string) => {
    const due = new Date(dueDateStr + 'T12:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);
    
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5, letterSpacing: '0.5px' }}>
          Control de Clientes Morosos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.3px' }}>
          Lista de préstamos con cuotas vencidas o calificados en mora. Organiza tu ruta de visitas a domicilio.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress color="error" />
        </Box>
      ) : (
        <>
          {/* Tarjeta Resumen de Alerta */}
          <Box sx={{ 
            mb: 4, 
            p: 4, 
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.04) 100%)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: 3, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 3,
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)'
          }}>
            <Box sx={{ 
              p: 2.5, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)', 
              color: '#ef4444',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
            }}>
              <Warning sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#991b1c" sx={{ letterSpacing: '0.3px' }}>
                Atención: {loans.length} Préstamos en Situación Irregular
              </Typography>
              <Typography variant="body2" color="#b91c1c" sx={{ letterSpacing: '0.3px' }}>
                Estos clientes presentan saldos pendientes vencidos y deben ser contactados para acordar un cobro.
              </Typography>
            </Box>
          </Box>

          {/* Tabla de Morosos */}
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            border: '1px solid rgba(239, 68, 68, 0.1)', 
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }}>
            <Box sx={{ 
              p: 3, 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
              borderBottom: '1px solid rgba(239, 68, 68, 0.2)' 
            }}>
              <TextField
                placeholder="Buscar por cliente, dirección o préstamo ID..."
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  sx: {
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    }
                  }
                }}
              />
            </Box>

            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'rgba(239, 68, 68, 0.05)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>ID Préstamo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Dirección de Cobro</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Monto Prestado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Vencimiento</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Atraso (Días)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Cobrar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLoans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        ¡Excelente! No hay clientes con deudas morosas registradas.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLoans.map((loan) => (
                      <TableRow key={loan.id} sx={{ 
                        '&:hover': { 
                          bgcolor: 'rgba(239, 68, 68, 0.05)',
                          transition: 'background-color 0.2s'
                        }, 
                        borderBottom: '1px solid rgba(239, 68, 68, 0.1)' 
                      }}>
                        <TableCell sx={{ fontWeight: 600, color: '#ef4444', letterSpacing: '0.3px' }}>#{loan.id}</TableCell>
                        <TableCell sx={{ fontWeight: 500, color: '#1e293b', letterSpacing: '0.3px' }}>
                          {loan.cliente_nombre && loan.cliente_apellido 
                            ? `${loan.cliente_nombre} ${loan.cliente_apellido}` 
                            : `Cliente #${loan.cliente_id}`}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Home sx={{ color: 'text.secondary', fontSize: 18 }} />
                            <Typography variant="body2" color="#64748b" sx={{ letterSpacing: '0.3px' }}>{loan.cliente_direccion || 'No especificada'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={loan.plan} size="small" color="error" variant="outlined" sx={{ fontWeight: 'bold' }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#0f172a', letterSpacing: '0.3px' }}>
                          ${Number(loan.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell sx={{ color: '#ef4444', fontWeight: 500, letterSpacing: '0.3px' }}>
                          {new Date(loan.fecha_vencimiento).toLocaleDateString('es-AR')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#991b1b', letterSpacing: '0.3px' }}>
                          <Chip label={`${getDaysOverdue(loan.fecha_vencimiento)} días`} size="small" color="error" sx={{ fontWeight: 'bold' }} />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Payment />}
                            onClick={() => navigate('/cobrador/collection')}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 'bold',
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              '&:hover': { 
                                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)',
                                transition: 'all 0.3s ease'
                              },
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                              letterSpacing: '0.3px'
                            }}
                          >
                            Cobrar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </Box>
  );
};

export default DebtorsPage;
