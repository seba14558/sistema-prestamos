import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Alert, Card, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, IconButton,
  Grid, MenuItem, InputAdornment, Divider, useMediaQuery, useTheme
} from '@mui/material';
import { Edit, Delete, Payment, AttachMoney, CalendarToday } from '@mui/icons-material';
import api, { editarPago, eliminarPago } from '../../services/api';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import TableSkeleton from '../../components/TableSkeleton';

interface Loan {
  id: number;
  cliente_id: number;
  cliente_nombre?: string;
  cliente_apellido?: string;
  monto: string | number;
  estado: string;
  plan?: string;
  fecha_vencimiento?: string;
}

interface Payment {
  id: number;
  prestamo_id: number;
  monto: string | number;
  fecha_pago: string;
  cliente_nombre?: string;
  cliente_apellido?: string;
  cobrador_usuario?: string;
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [cobradorFilter, setCobradorFilter] = useState('all');
  const [loanFilter, setLoanFilter] = useState('all');

  const [prestamoId, setPrestamoId] = useState<number | ''>('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editMonto, setEditMonto] = useState('');
  const [editFechaPago, setEditFechaPago] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  const showToast = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const [loansRes, paymentsRes] = await Promise.all([
        api.get('/prestamos'),
        api.get('/pagos/recaudacion')
      ]);

      const activeLoans = loansRes.data.filter((loan: Loan) => loan.estado !== 'pagado');
      setLoans(activeLoans);
      setPayments(paymentsRes.data);
    } catch (err: any) {
      console.error(err);
      setError('Error al obtener pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
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
      setSelectedLoan(null);
      setMonto('');
      setFechaPago(new Date().toISOString().slice(0, 10));
      showToast('Cobro registrado exitosamente', 'success');
      await fetchPayments();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al registrar el cobro.');
      showToast('Error al registrar el cobro', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setEditMonto(String(payment.monto));
    setEditFechaPago(payment.fecha_pago);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPayment) return;

    const numMonto = parseFloat(editMonto);
    if (isNaN(numMonto) || numMonto <= 0) {
      setError('El monto debe ser un valor positivo.');
      return;
    }

    try {
      await editarPago(editingPayment.id, {
        fecha_pago: editFechaPago,
        monto: numMonto
      });
      setEditDialogOpen(false);
      setEditingPayment(null);
      setError('');
      await fetchPayments();
      showToast('Pago actualizado exitosamente', 'success');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al editar el pago.');
      showToast('Error al editar el pago', 'error');
    }
  };

  const handleDeletePayment = async (id: number) => {
    showConfirmDialog(
      'Eliminar Pago',
      '¿Estás seguro de que quieres eliminar este pago? Esta acción no se puede deshacer.',
      async () => {
        try {
          await eliminarPago(id);
          await fetchPayments();
          showToast('Pago eliminado exitosamente', 'success');
        } catch (err: any) {
          console.error(err);
          setError(err.response?.data?.message || 'Error al eliminar el pago.');
          showToast('Error al eliminar el pago', 'error');
        }
      }
    );
  };

  const uniqueCobradores = Array.from(
    new Set(
      payments
        .map((payment) => payment.cobrador_usuario)
        .filter((value): value is string => Boolean(value))
    )
  );

  const filteredPayments = payments.filter((payment) => {
    const clientName = `${payment.cliente_nombre || ''} ${payment.cliente_apellido || ''}`.toLowerCase();
    const cobradorName = (payment.cobrador_usuario || '').toLowerCase();
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !term ||
      clientName.includes(term) ||
      cobradorName.includes(term) ||
      String(payment.id).includes(term) ||
      String(payment.prestamo_id).includes(term);
    const matchesDate = !dateFilter || payment.fecha_pago === dateFilter;
    const matchesCobrador = cobradorFilter === 'all' || payment.cobrador_usuario === cobradorFilter;
    const matchesLoan = loanFilter === 'all' || String(payment.prestamo_id) === loanFilter;

    return matchesSearch && matchesDate && matchesCobrador && matchesLoan;
  });

  const filteredTotal = filteredPayments.reduce((sum, payment) => sum + Number(payment.monto || 0), 0);
  const filteredCount = filteredPayments.length;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5, letterSpacing: '0.5px', lineHeight: { xs: 1.4, sm: 1.2 }, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Gestión de Cobros
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.3px' }}>
          Registra pagos de clientes, revisa el historial y administra los cobros del sistema
        </Typography>
      </Box>
      <Card sx={{
        mb: 3,
        borderRadius: 3,
        border: '1px solid rgba(99, 102, 241, 0.12)',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 55%, #eef2ff 100%)',
        overflow: 'hidden'
      }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#1e293b" sx={{ letterSpacing: '0.2px' }}>
                Buscar y filtrar cobros
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filtra por cliente, préstamo, cobrador o fecha en una vista limpia.
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={2} alignItems="stretch">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar por cliente, cobrador, préstamo o ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#ffffff',
                    minHeight: 56,
                    '& fieldset': { borderColor: 'rgba(99, 102, 241, 0.18)' },
                    '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.35)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                select
                fullWidth
                label="Préstamo"
                value={loanFilter}
                onChange={(e) => setLoanFilter(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#ffffff',
                    minHeight: 56,
                    '& fieldset': { borderColor: 'rgba(99, 102, 241, 0.18)' },
                    '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.35)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                  }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                        {loans.map((loan) => (
                  <MenuItem key={loan.id} value={String(loan.id)}>
                    N º {loan.id} - {loan.cliente_nombre} {loan.cliente_apellido}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2.5}>
              <TextField
                select
                fullWidth
                label="Cobrador"
                value={cobradorFilter}
                onChange={(e) => setCobradorFilter(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#ffffff',
                    minHeight: 56,
                    '& fieldset': { borderColor: 'rgba(99, 102, 241, 0.18)' },
                    '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.35)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                  }
                }}
              >
                <MenuItem value="all">Todos</MenuItem>
                {uniqueCobradores.map((cobrador) => (
                  <MenuItem key={cobrador} value={cobrador}>
                    {cobrador}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Fecha"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#ffffff',
                    minHeight: 56,
                    '& fieldset': { borderColor: 'rgba(99, 102, 241, 0.18)' },
                    '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.35)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' }
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={1} sx={{ display: 'flex', alignItems: 'stretch' }}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                  setCobradorFilter('all');
                  setLoanFilter('all');
                }}
                sx={{
                  minHeight: 56,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: '0 6px 16px rgba(99, 102, 241, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
                  }
                }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2, borderColor: 'rgba(99, 102, 241, 0.12)' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Mostrando {filteredCount} de {payments.length} cobros
            </Typography>
            <Typography variant="body2" fontWeight={700} color="#059669">
              Total filtrado: ${filteredTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Box>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <TableSkeleton rows={8} columns={7} />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              borderTop: '5px solid #10b981',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
              <Box sx={{ p: { xs: 3, sm: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}>
                    <Payment sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ letterSpacing: '0.3px' }}>
                    Registrar Cobro Nuevo
                  </Typography>
                </Box>

                {formError && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {formError}
                  </Alert>
                )}

                {formSuccess && (
                  <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                    {formSuccess}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={{ xs: 3, sm: 2.5 }}>
                    <Grid item xs={12}>
                      <TextField
                        select
                        label="Seleccionar Cliente"
                        fullWidth
                        required
                        value={prestamoId}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setPrestamoId(value);
                          setSelectedLoan(loans.find((loan) => loan.id === value) || null);
                        }}
                        disabled={formSubmitting}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            minHeight: { xs: 48, sm: 'auto' }
                          }
                        }}
                      >
                        <MenuItem value="">Seleccionar préstamo...</MenuItem>
                        {loans.map((loan) => (
                          <MenuItem key={loan.id} value={loan.id}>
                            {loan.cliente_nombre} {loan.cliente_apellido} (N º {loan.id})
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {selectedLoan && (
                      <Grid item xs={12}>
                        <Box sx={{
                          p: 2.5,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          mb: 1
                        }}>
                          <Typography variant="subtitle2" fontWeight="bold" color="#6366f1" sx={{ mb: 1.5, letterSpacing: '0.3px' }}>
                            Información del Préstamo
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" color="#64748b" sx={{ display: 'block', mb: 0.5 }}>
                                Monto Total
                              </Typography>
                              <Typography variant="body2" fontWeight="600" color="#1e293b">
                                ${Number(selectedLoan.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" color="#64748b" sx={{ display: 'block', mb: 0.5 }}>
                                Estado
                              </Typography>
                              <Typography variant="body2" fontWeight="600" color="#1e293b">
                                {selectedLoan.estado}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" color="#64748b" sx={{ display: 'block', mb: 0.5 }}>
                                Plan
                              </Typography>
                              <Typography variant="body2" fontWeight="600" color="#1e293b">
                                {selectedLoan.plan || 'N/A'}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                              <Typography variant="caption" color="#64748b" sx={{ display: 'block', mb: 0.5 }}>
                                Vencimiento
                              </Typography>
                              <Typography variant="body2" fontWeight="600" color="#1e293b">
                                {selectedLoan.fecha_vencimiento ? new Date(selectedLoan.fecha_vencimiento).toLocaleDateString('es-AR') : 'N/A'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <TextField
                        label="Monto Cobrado"
                        fullWidth
                        required
                        type="number"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        disabled={formSubmitting}
                        helperText="Ingresa el monto que estás cobrando hoy"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney sx={{ color: '#10b981' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            minHeight: { xs: 48, sm: 'auto' }
                          }
                        }}
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
                              <CalendarToday sx={{ color: '#10b981' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            minHeight: { xs: 48, sm: 'auto' }
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={formSubmitting}
                        sx={{
                          py: 1.5,
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
                        {formSubmitting ? 'Registrando...' : 'Registrar Cobro'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Card sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
              <Box sx={{
                p: 3,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                borderBottom: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <Typography variant="h6" fontWeight="bold" color="white" sx={{ letterSpacing: '0.3px' }}>
                  Todos los Cobros Registrados
                </Typography>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.8)" sx={{ letterSpacing: '0.3px' }}>
                  Historial de cobros registrados por todos los usuarios del sistema
                </Typography>
              </Box>

                {isMobile ? (
                  <Box sx={{ p: 2.5 }}>
                    {filteredPayments.length === 0 ? (
                      <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                        No hay cobros que coincidan con los filtros actuales.
                      </Box>
                    ) : (
                      filteredPayments.map((payment) => {
                        return (
                          <Card key={payment.id} sx={{
                            mb: 2,
                            p: 2,
                            borderRadius: 2.5,
                            border: '1px solid rgba(99, 102, 241, 0.18)',
                            borderTop: '4px solid #6366f1',
                            boxShadow: '0 8px 22px rgba(15, 23, 42, 0.06)',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 1.5 }}>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={800} color="#1e293b">N º {payment.id}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {payment.cliente_nombre && payment.cliente_apellido ? `${payment.cliente_nombre} ${payment.cliente_apellido}` : 'Cliente'}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5, mb: 2 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Préstamo</Typography>
                                <Typography variant="body2" fontWeight={700}>N º {payment.prestamo_id}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Monto</Typography>
                                <Typography variant="body2" fontWeight={800} color="#059669">
                                  +${Number(payment.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Fecha</Typography>
                                <Typography variant="body2" fontWeight={600}>{new Date(payment.fecha_pago).toLocaleDateString('es-AR')}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">Cobrador</Typography>
                                <Typography variant="body2" fontWeight={600}>{payment.cobrador_usuario || 'Cobrador'}</Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                onClick={() => handleEditPayment(payment)}
                                sx={{ borderRadius: 2, fontWeight: 700 }}
                              >
                                Editar
                              </Button>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeletePayment(payment.id)}
                                sx={{ borderRadius: 2, fontWeight: 700 }}
                              >
                                Eliminar
                              </Button>
                            </Box>
                          </Card>
                        );
                      })
                    )}
                  </Box>
                ) : (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Cobro ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Cliente</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Cobrador</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>ID Préstamo</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Monto Cobrado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Fecha de Cobro</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }} align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          No hay cobros que coincidan con los filtros actuales.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((p) => (
                        <TableRow key={p.id} sx={{
                          '&:hover': {
                            bgcolor: 'rgba(99, 102, 241, 0.05)',
                            transition: 'background-color 0.2s'
                          },
                          borderBottom: '1px solid rgba(99, 102, 241, 0.1)'
                        }}>
                          <TableCell sx={{ fontWeight: 600, color: '#10b981', letterSpacing: '0.3px' }}>{p.id}</TableCell>
                          <TableCell sx={{ fontWeight: 500, color: '#1e293b', letterSpacing: '0.3px' }}>
                            {p.cliente_nombre && p.cliente_apellido
                              ? `${p.cliente_nombre} ${p.cliente_apellido}`
                              : 'Cliente'}
                          </TableCell>
                          <TableCell sx={{ color: '#64748b', letterSpacing: '0.3px' }}>
                            {p.cobrador_usuario || 'Cobrador'}
                          </TableCell>
                          <TableCell sx={{ color: '#64748b', letterSpacing: '0.3px' }}>N º {p.prestamo_id}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#10b981', letterSpacing: '0.3px' }}>
                            +${Number(p.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell sx={{ letterSpacing: '0.3px' }}>{new Date(p.fecha_pago).toLocaleDateString('es-AR')}</TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={() => handleEditPayment(p)}
                              size="small"
                              sx={{
                                color: '#6366f1',
                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(99, 102, 241, 0.2)',
                                  transform: 'scale(1.1)',
                                  transition: 'all 0.2s'
                                }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleDeletePayment(p.id)}
                              size="small"
                              sx={{
                                color: '#ef4444',
                                bgcolor: 'rgba(239, 68, 68, 0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(239, 68, 68, 0.2)',
                                  transform: 'scale(1.1)',
                                  transition: 'all 0.2s'
                                }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Dialogo para editar pago */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Pago {editingPayment?.id}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Monto"
              type="number"
              value={editMonto}
              onChange={(e) => setEditMonto(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Fecha de Pago"
              type="date"
              value={editFechaPago}
              onChange={(e) => setEditFechaPago(e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
      
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
      
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={handleCloseConfirmDialog}
        severity="warning"
      />
    </Box>
  );
};

export default PaymentsPage;
