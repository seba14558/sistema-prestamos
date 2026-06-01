import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Grid, 
  InputAdornment, Alert, CircularProgress, Card, MenuItem, Chip
} from '@mui/material';
import { AccountBalanceWallet, AttachMoney, CalendarToday, CheckCircle } from '@mui/icons-material';
import api from '../../services/api';

interface Loan {
  id: number;
  cliente_id: number;
  cliente_nombre?: string;
  cliente_apellido?: string;
  monto: string | number;
  estado: string;
}

interface Payment {
  id: number;
  prestamo_id: number;
  monto: string | number;
  fecha_pago: string;
  cliente_nombre?: string;
  cliente_apellido?: string;
}

const CollectionPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado del formulario
  const [prestamoId, setPrestamoId] = useState<number | ''>('');
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [loansRes, paymentsRes] = await Promise.all([
        api.get('/prestamos'),
        api.get('/pagos/recaudacion')
      ]);
      
      // Filtrar préstamos activos, morosos o vencidos (no pagados)
      const activeLoans = loansRes.data.filter((l: Loan) => l.estado !== 'pagado');
      setLoans(activeLoans);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener información de cobros del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!prestamoId || !monto || !fechaPago) {
      setFormError('Por favor, completa todos los campos.');
      return;
    }

    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      setFormError('El monto debe ser un valor positivo.');
      return;
    }

    setFormSubmitting(true);
    try {
      await api.post('/pagos', {
        prestamo_id: Number(prestamoId),
        fecha_pago: fechaPago,
        monto: numMonto
      });

      setFormSuccess('¡Cobro registrado exitosamente en el sistema!');
      setPrestamoId('');
      setMonto('');
      setFechaPago(new Date().toISOString().slice(0, 10));
      
      // Recargar listados
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al registrar el cobro.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5 }}>
          Registro de Cobros y Recaudación
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Registra nuevos cobros en la calle y consulta tu historial de recaudación personal
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress color="success" />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* Formulario de registro de pago */}
          <Grid item xs={12} lg={4}>
            <Card 
              sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)', 
                border: '1px solid #e2e8f0',
                borderTop: '5px solid #00b159' 
              }}
            >
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceWallet sx={{ color: '#00b159' }} />
                  Registrar Cobro Nuevo
                </Typography>

                {formError && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                    {formError}
                  </Alert>
                )}

                {formSuccess && (
                  <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2.5, borderRadius: 2 }}>
                    {formSuccess}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Seleccionar Préstamo / Cliente"
                        fullWidth
                        required
                        value={prestamoId}
                        onChange={(e) => setPrestamoId(Number(e.target.value))}
                        disabled={formSubmitting}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      >
                        {loans.map((l) => (
                          <MenuItem key={l.id} value={l.id}>
                            Préstamo #{l.id} - {l.cliente_nombre} {l.cliente_apellido} (Monto: ${Number(l.monto)})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Monto Cobrado"
                        fullWidth
                        required
                        type="number"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        disabled={formSubmitting}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney sx={{ color: '#00b159' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Fecha del Cobro"
                        fullWidth
                        required
                        type="date"
                        value={fechaPago}
                        onChange={(e) => setFechaPago(e.target.value)}
                        disabled={formSubmitting}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday sx={{ color: 'text.secondary', mr: 0.5 }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={formSubmitting}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          textTransform: 'none',
                          bgcolor: '#00b159',
                          boxShadow: '0 4px 12px rgba(0, 177, 89, 0.25)',
                          '&:hover': {
                            bgcolor: '#009048',
                            boxShadow: '0 6px 16px rgba(0, 177, 89, 0.35)',
                          }
                        }}
                      >
                        {formSubmitting ? 'Registrando...' : 'Registrar Cobro'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Historial de cobros personales */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b">
                  Mi Recaudación Personal Reciente
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Historial de cobros que has registrado tú en el sistema
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Cobro ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>ID Préstamo</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Monto Cobrado</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Fecha de Cobro</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          Aún no has registrado ningún cobro hoy.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((p) => (
                        <TableRow key={p.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                          <TableCell sx={{ fontWeight: 600, color: '#00b159' }}>#{p.id}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {p.cliente_nombre && p.cliente_apellido 
                              ? `${p.cliente_nombre} ${p.cliente_apellido}` 
                              : 'Cliente'}
                          </TableCell>
                          <TableCell sx={{ color: '#475569' }}>#{p.prestamo_id}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#00b159' }}>
                            +${Number(p.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>{new Date(p.fecha_pago).toLocaleDateString('es-AR')}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CollectionPage;
