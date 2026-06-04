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
        <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5 }}>
          Control de Clientes Morosos
        </Typography>
        <Typography variant="body2" color="text.secondary">
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
          <Box sx={{ mb: 4, p: 4, bgcolor: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.16)', borderRadius: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ p: 2.5, borderRadius: '50%', bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
              <Warning sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#991b1c">
                Atención: {loans.length} Préstamos en Situación Irregular
              </Typography>
              <Typography variant="body2" color="#b91c1c">
                Estos clientes presentan saldos pendientes vencidos y deben ser contactados para acordar un cobro.
              </Typography>
            </Box>
          </Box>

          {/* Tabla de Morosos */}
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
              <TextField
                placeholder="Buscar por cliente, dirección o préstamo ID..."
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: '#f8fafc',
                    '& fieldset': {
                      borderColor: '#e2e8f0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#cbd5e1',
                    },
                  }
                }}
              />
            </Box>

            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>ID Préstamo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Cliente</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Dirección de Cobro</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Plan</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Monto Prestado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Vencimiento</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Atraso (Días)</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold', color: '#475569' }}>Cobrar</TableCell>
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
                      <TableRow key={loan.id} sx={{ '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.04)' }, borderBottom: '1px solid #f1f5f9' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#ef4444' }}>#{loan.id}</TableCell>
                        <TableCell sx={{ fontWeight: 500, color: '#1e293b' }}>
                          {loan.cliente_nombre && loan.cliente_apellido 
                            ? `${loan.cliente_nombre} ${loan.cliente_apellido}` 
                            : `Cliente #${loan.cliente_id}`}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Home sx={{ color: 'text.secondary', fontSize: 18 }} />
                            <Typography variant="body2" color="#64748b">{loan.cliente_direccion || 'No especificada'}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={loan.plan} size="small" color="error" variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                          ${Number(loan.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell sx={{ color: '#ef4444', fontWeight: 500 }}>
                          {new Date(loan.fecha_vencimiento).toLocaleDateString('es-AR')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#991b1b' }}>
                          <Chip label={`${getDaysOverdue(loan.fecha_vencimiento)} días`} size="small" color="error" />
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
                              bgcolor: '#10b981',
                              '&:hover': { bgcolor: '#059669' }
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
