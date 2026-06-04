import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  InputAdornment, Alert, CircularProgress, Card, Grid, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { Search, Payment, AttachMoney, CalendarToday, Edit, Delete } from '@mui/icons-material';
import api, { editarPago, eliminarPago } from '../../services/api';

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
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Estado del formulario
  const [prestamoId, setPrestamoId] = useState<number | ''>('');
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().slice(0, 10));
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Estado para edición de pago
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editMonto, setEditMonto] = useState('');
  const [editFechaPago, setEditFechaPago] = useState('');

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
    
    // Detectar si el usuario es admin
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.rol === 'admin');
      } catch (e) {
        console.error('Error al parsear usuario:', e);
      }
    }
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
      setFormError('El monto debe ser un valor positivo.');
      return;
    }

    try {
      await editarPago(editingPayment.id, {
        fecha_pago: editFechaPago,
        monto: numMonto
      });
      setEditDialogOpen(false);
      setEditingPayment(null);
      setFormSuccess('Pago editado exitosamente');
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al editar el pago.');
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      return;
    }

    try {
      await eliminarPago(id);
      setFormSuccess('Pago eliminado exitosamente');
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al eliminar el pago.');
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
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress color="success" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Formulario de registro de pago */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', borderTop: '5px solid #10b981' }}>
              <Box sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Payment sx={{ color: '#10b981', fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="bold" color="#1e293b">
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
                        <MenuItem value="">Seleccionar préstamo...</MenuItem>
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
                              <AttachMoney sx={{ color: '#10b981' }} />
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
                              <CalendarToday sx={{ color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                          bgcolor: '#10b981',
                          '&:hover': { bgcolor: '#059669', boxShadow: '0 6px 16px rgba(16, 185, 129, 0.35)' },
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
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
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                <Typography variant="h6" fontWeight="bold" color="#1e293b">
                  Mi Recaudación Personal Reciente
                </Typography>
                <Typography variant="caption" color="#64748b">
                  Historial de cobros que has registrado tú en el sistema
                </Typography>
              </Box>

              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Cobro ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Cliente</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { xs: 'none', sm: 'table-cell' } }}>ID Préstamo</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Monto Cobrado</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { xs: 'none', sm: 'table-cell' } }}>Fecha de Cobro</TableCell>
                      {isAdmin && (
                        <TableCell sx={{ fontWeight: 'bold', color: '#475569' }} align="center">Acciones</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          Aún no has registrado ningún cobro hoy.
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((p) => (
                        <TableRow key={p.id} sx={{ '&:hover': { bgcolor: '#f8fafc' }, borderBottom: '1px solid #f1f5f9' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#10b981' }}>#{p.id}</TableCell>
                          <TableCell sx={{ fontWeight: 500, color: '#1e293b' }}>
                            {p.cliente_nombre && p.cliente_apellido 
                              ? `${p.cliente_nombre} ${p.cliente_apellido}` 
                              : 'Cliente'}
                          </TableCell>
                          <TableCell sx={{ color: '#64748b', display: { xs: 'none', sm: 'table-cell' } }}>#{p.prestamo_id}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', color: '#10b981' }}>
                            +${Number(p.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{new Date(p.fecha_pago).toLocaleDateString('es-AR')}</TableCell>
                          {isAdmin && (
                            <TableCell align="center">
                              <IconButton onClick={() => handleEditPayment(p)} size="small" sx={{ color: '#6366f1' }}>
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton onClick={() => handleDeletePayment(p.id)} size="small" sx={{ color: '#ef4444' }}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </TableCell>
                          )}
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

      {/* Dialogo para editar pago */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Pago #{editingPayment?.id}</DialogTitle>
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
    </Box>
  );
};

export default CollectionPage;
