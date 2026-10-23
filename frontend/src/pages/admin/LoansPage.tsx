import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid,
  InputAdornment, Alert, CircularProgress, Card, MenuItem, Chip, IconButton
} from '@mui/material';
import { Search, Add, Edit, Delete, AccountBalance, CalendarToday, AttachMoney } from '@mui/icons-material';
import api from '../../services/api';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import TableSkeleton from '../../components/TableSkeleton';
import { calcularFechaVencimientoExcluyendoDomingos } from '../../utils/date';

interface Client {
  id: number;
  nombre: string;
  apellido: string;
}

interface Plan {
  id: number;
  nombre: string;
  dias: number;
  porcentaje_interes: number;
  activo: boolean;
}

interface Collector {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
}

interface Loan {
  id: number;
  cliente_id: number;
  cliente_nombre?: string;
  cliente_apellido?: string;
  plan: string;
  monto: string | number;
  monto_total?: string | number;
  porcentaje_interes?: number;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado: string; // 'activo', 'vencido', 'pagado', 'moroso'
  cobrador_id?: number;
  cobrador_nombre?: string;
}

const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Estados del modal
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);

  // Formulario de Préstamo
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [plan, setPlan] = useState('');
  const [monto, setMonto] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10));
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [estado, setEstado] = useState('activo');
  const [cobradorId, setCobradorId] = useState<number | ''>('');
  const [editPercentage, setEditPercentage] = useState(false); // Para permitir edición manual del porcentaje
  const [customPercentage, setCustomPercentage] = useState(''); // Porcentaje personalizado

  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Confirmación de eliminación
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; loan: Loan | null }>({ open: false, loan: null });
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  const showToast = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  // Calcular la fecha de vencimiento y el monto total con intereses automáticamente
  useEffect(() => {
    if (!fechaInicio || !monto || !plan) return;

    const selectedPlan = plans.find(p => p.nombre === plan);
    if (!selectedPlan) return;

    const dias = selectedPlan.dias;

    // Calcular fecha de vencimiento excluyendo domingos
    const fechaVencimientoCalculada = calcularFechaVencimientoExcluyendoDomingos(fechaInicio, dias);
    setFechaVencimiento(fechaVencimientoCalculada);

    // Calcular monto total con intereses
    const montoNumerico = parseFloat(monto);
    if (!isNaN(montoNumerico)) {
      // Si está en modo edición de porcentaje personalizado, usar ese valor
      // Si estamos editando un préstamo existente, usar el porcentaje guardado en el préstamo
      const porcentaje = editPercentage && customPercentage
        ? parseFloat(customPercentage)
        : (editMode && customPercentage ? parseFloat(customPercentage) : selectedPlan.porcentaje_interes);

      const multiplicador = 1 + (porcentaje / 100);
      setMontoTotal((montoNumerico * multiplicador).toString());
    }
  }, [plan, fechaInicio, monto, plans, editPercentage, customPercentage, editMode]);

  // Cargar préstamos, clientes, planes y cobradores
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [loansRes, clientsRes, plansRes, collectorsRes] = await Promise.all([
        api.get('/prestamos'),
        api.get('/clientes'),
        api.get('/planes'),
        api.get('/usuarios/cobradores')
      ]);
      setLoans(loansRes.data);
      setFilteredLoans(loansRes.data);
      setClients(clientsRes.data);
      setPlans(plansRes.data);
      setCollectors(collectorsRes.data);
      // Establecer el primer plan activo como predeterminado
      const activePlan = plansRes.data.find((p: Plan) => p.activo);
      if (activePlan && !plan) {
        setPlan(activePlan.nombre);
      }
    } catch (err) {
      console.error(err);
      setError('Error al obtener datos del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar préstamos en tiempo real
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredLoans(loans);
    } else {
      const term = search.toLowerCase();
      const filtered = loans.filter(
        l => 
          (l.cliente_nombre && l.cliente_nombre.toLowerCase().includes(term)) ||
          (l.cliente_apellido && l.cliente_apellido.toLowerCase().includes(term)) ||
          l.plan.toLowerCase().includes(term) ||
          l.estado.toLowerCase().includes(term) ||
          String(l.id).includes(term)
      );
      setFilteredLoans(filtered);
    }
  }, [search, loans]);

  const handleOpenDialog = (loan?: Loan) => {
    if (loan) {
      setEditMode(true);
      setSelectedLoanId(loan.id);
      setClienteId(loan.cliente_id);
      setPlan(loan.plan);
      setMonto(String(loan.monto));
      setMontoTotal(loan.monto_total ? String(loan.monto_total) : '');
      // Si el préstamo tiene un porcentaje de interés guardado, usarlo
      if (loan.porcentaje_interes) {
        setCustomPercentage(String(loan.porcentaje_interes));
        setEditPercentage(true);
      } else {
        setEditPercentage(false);
        setCustomPercentage('');
      }
      // Formatear fechas para los inputs
      setFechaInicio(new Date(loan.fecha_inicio).toISOString().slice(0, 10));
      setFechaVencimiento(new Date(loan.fecha_vencimiento).toISOString().slice(0, 10));
      setEstado(loan.estado);
      setCobradorId(loan.cobrador_id || '');
    } else {
      setEditMode(false);
      setSelectedLoanId(null);
      setClienteId('');
      const activePlan = plans.find(p => p.activo);
      setPlan(activePlan ? activePlan.nombre : '');
      setMonto('');
      setMontoTotal('');
      setFechaInicio(new Date().toISOString().slice(0, 10));
      setEstado('activo');
      setCobradorId('');
      setEditPercentage(false);
      setCustomPercentage('');
    }
    setFormError('');
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !plan || !monto || !fechaInicio || !fechaVencimiento) {
      setFormError('Por favor, completa todos los campos requeridos.');
      return;
    }

    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      setFormError('El monto debe ser un número positivo.');
      return;
    }

    setFormError('');
    setFormSubmitting(true);

    try {
      // Calcular el porcentaje de interés usado
      const selectedPlan = plans.find(p => p.nombre === plan);
      const porcentajeInteres = editPercentage && customPercentage
        ? parseFloat(customPercentage)
        : (selectedPlan ? selectedPlan.porcentaje_interes : 0);

      if (editMode && selectedLoanId !== null) {
        // Editar préstamo existente (solo administradores)
        await api.put(`/prestamos/${selectedLoanId}`, {
          plan,
          monto: numMonto,
          monto_total: parseFloat(montoTotal || monto),
          porcentaje_interes: porcentajeInteres,
          fecha_inicio: fechaInicio,
          fecha_vencimiento: fechaVencimiento,
          estado,
          cobrador_id: cobradorId || null
        });
        showToast('Préstamo actualizado exitosamente', 'success');
      } else {
        // Crear nuevo préstamo
        await api.post('/prestamos', {
          cliente_id: Number(clienteId),
          plan,
          monto: numMonto,
          monto_total: parseFloat(montoTotal || monto),
          porcentaje_interes: porcentajeInteres,
          fecha_inicio: fechaInicio,
          fecha_vencimiento: fechaVencimiento,
          estado: 'activo',
          cobrador_id: cobradorId || null
        });
        showToast('Préstamo creado exitosamente', 'success');
      }

      await fetchData();
      handleCloseDialog();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al guardar el préstamo.');
      showToast('Error al guardar el préstamo', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteLoan = async () => {
    if (!deleteDialog.loan) return;
    setDeleting(true);
    try {
      await api.delete(`/prestamos/${deleteDialog.loan.id}`);
      showToast('Préstamo eliminado exitosamente', 'success');
      setDeleteDialog({ open: false, loan: null });
      await fetchData();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error al eliminar el préstamo', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'activo':
        return <Chip label="Activo" size="small" color="success" sx={{ fontWeight: 'bold' }} />;
      case 'vencido':
        return <Chip label="Vencido" size="small" color="warning" sx={{ fontWeight: 'bold' }} />;
      case 'pagado':
        return <Chip label="Pagado" size="small" color="info" sx={{ fontWeight: 'bold' }} />;
      case 'moroso':
        return <Chip label="Moroso" size="small" color="error" sx={{ fontWeight: 'bold' }} />;
      default:
        return <Chip label={status} size="small" color="default" sx={{ fontWeight: 'bold' }} />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ letterSpacing: '0.5px', lineHeight: { xs: 1.4, sm: 1.2 }, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            Control de Préstamos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.3px' }}>
            Administra los planes de financiación, registra préstamos y controla vencimientos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            py: 1.25,
            px: 2.5,
            borderRadius: 2.5,
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
            textTransform: 'none',
            letterSpacing: '0.3px',
            width: { xs: '100%', sm: 'auto' },
            minHeight: { xs: 48, sm: 'auto' },
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)',
              transform: 'translateY(-2px)',
              transition: 'all 0.3s ease'
            }
          }}
        >
          Otorgar Préstamo
        </Button>
      </Box>

      {/* Alertas */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabla y búsqueda */}
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        overflow: 'hidden', 
        border: '1px solid rgba(99, 102, 241, 0.1)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
      }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)' 
        }}>
          <TextField
            placeholder="Buscar por cliente, plan, estado o ID..."
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
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

        {loading ? (
          <TableSkeleton rows={8} columns={8} />
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Préstamo ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Monto Otorgado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Fecha de Otorgamiento</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Vencimiento</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Cobrador</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No se encontraron préstamos otorgados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLoans.map((loan) => (
                    <TableRow 
                      key={loan.id}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: 'rgba(99, 102, 241, 0.05)',
                          transition: 'background-color 0.2s'
                        }, 
                        borderBottom: '1px solid rgba(99, 102, 241, 0.1)'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: '#6366f1', letterSpacing: '0.3px' }}>{loan.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#1e293b', letterSpacing: '0.3px' }}>
                        {loan.cliente_nombre && loan.cliente_apellido 
                          ? `${loan.cliente_nombre} ${loan.cliente_apellido}` 
                          : `Cliente ID: ${loan.cliente_id}`}
                      </TableCell>
                      <TableCell>
                        <Chip label={loan.plan} size="small" variant="outlined" color="primary" sx={{ fontWeight: 'bold' }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#0f172a', letterSpacing: '0.3px' }}>
                        ${Number(loan.monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ letterSpacing: '0.3px' }}>{new Date(loan.fecha_inicio).toLocaleDateString('es-AR')}</TableCell>
                      <TableCell sx={{ letterSpacing: '0.3px' }}>{new Date(loan.fecha_vencimiento).toLocaleDateString('es-AR')}</TableCell>
                      <TableCell sx={{ letterSpacing: '0.3px' }}>
                        {loan.cobrador_nombre ? (
                          <Chip label={loan.cobrador_nombre} size="small" variant="outlined" color="success" sx={{ fontWeight: 'bold' }} />
                        ) : (
                          <Chip label="Sin asignar" size="small" variant="outlined" color="default" sx={{ fontWeight: 'bold' }} />
                        )}
                      </TableCell>
                      <TableCell align="center">{getStatusChip(loan.estado)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(loan)}
                          sx={{ 
                            bgcolor: 'rgba(99, 102, 241, 0.1)',
                            '&:hover': { 
                              bgcolor: 'rgba(99, 102, 241, 0.2)',
                              transform: 'scale(1.1)',
                              transition: 'all 0.2s'
                            }
                          }}
                        >
                          <Edit sx={{ fontSize: 20 }} />
                        </IconButton>
                        {loan.estado === 'pagado' && (
                          <IconButton
                            color="error"
                            onClick={() => setDeleteDialog({ open: true, loan })}
                            sx={{
                              bgcolor: 'rgba(239, 68, 68, 0.1)',
                              ml: 1,
                              '&:hover': {
                                bgcolor: 'rgba(239, 68, 68, 0.2)',
                                transform: 'scale(1.1)',
                                transition: 'all 0.2s'
                              }
                            }}
                          >
                            <Delete sx={{ fontSize: 20 }} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Modal Otorgar / Editar Préstamo */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editMode ? `Editar N º ${selectedLoanId}` : 'Otorgar Nuevo Préstamo'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {formError}
              </Alert>
            )}
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Seleccionar Cliente"
                  fullWidth
                  required
                  value={clienteId}
                  onChange={(e) => setClienteId(Number(e.target.value))}
                  disabled={formSubmitting || editMode}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountBalance sx={{ color: 'text.secondary', mr: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="">Seleccionar cliente...</MenuItem>
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} (N º {c.id})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  select
                  label="Plan de Pago"
                  fullWidth
                  required
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  disabled={formSubmitting}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  {plans.filter(p => p.activo).map((p) => (
                    <MenuItem key={p.id} value={p.nombre}>
                      {p.nombre} ({p.porcentaje_interes}% interés)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  select
                  label="Asignar a Cobrador"
                  fullWidth
                  value={cobradorId}
                  onChange={(e) => setCobradorId(Number(e.target.value))}
                  disabled={formSubmitting}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="">Sin asignar</MenuItem>
                  {collectors.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nombre} {c.apellido}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Monto del Préstamo"
                  fullWidth
                  required
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  disabled={formSubmitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: 'text.secondary', mr: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Editar porcentaje manualmente:
                  </Typography>
                  <Button
                    size="small"
                    variant={editPercentage ? "contained" : "outlined"}
                    onClick={() => {
                      setEditPercentage(!editPercentage);
                      if (!editPercentage) {
                        const selectedPlan = plans.find(p => p.nombre === plan);
                        if (selectedPlan) {
                          setCustomPercentage(selectedPlan.porcentaje_interes.toString());
                        }
                      } else {
                        setCustomPercentage('');
                      }
                    }}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    {editPercentage ? 'Usar plan original' : 'Activar edición'}
                  </Button>
                </Box>
                {editPercentage && (
                  <TextField
                    label="Porcentaje de interés personalizado (%)"
                    fullWidth
                    type="number"
                    value={customPercentage}
                    onChange={(e) => setCustomPercentage(e.target.value)}
                    disabled={formSubmitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney sx={{ color: 'text.secondary', mr: 0.5 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    helperText="Ingresa un porcentaje personalizado diferente al del plan"
                  />
                )}
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Fecha de Otorgamiento"
                  fullWidth
                  required
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
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

              <Grid item xs={6}>
                <TextField
                  label="Fecha de Vencimiento Estimada"
                  fullWidth
                  required
                  type="date"
                  value={fechaVencimiento}
                  disabled
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={{ color: 'text.secondary', mr: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' } }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Monto Total con Intereses"
                  fullWidth
                  type="number"
                  value={montoTotal}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: 'text.secondary', mr: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      borderRadius: 2,
                      bgcolor: 'rgba(99, 102, 241, 0.05)'
                    } 
                  }}
                  helperText="Calculado automáticamente según el plan seleccionado"
                />
              </Grid>

              {editMode && (
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Estado del Préstamo"
                    fullWidth
                    required
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    disabled={formSubmitting}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  >
                    <MenuItem value="activo">Activo</MenuItem>
                    <MenuItem value="vencido">Vencido</MenuItem>
                    <MenuItem value="pagado">Pagado</MenuItem>
                    <MenuItem value="moroso">Moroso</MenuItem>
                  </TextField>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button 
              onClick={handleCloseDialog} 
              color="inherit" 
              disabled={formSubmitting}
              sx={{ fontWeight: 'bold', textTransform: 'none', borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={formSubmitting}
              sx={{ 
                fontWeight: 'bold', 
                textTransform: 'none', 
                borderRadius: 2,
                px: 3,
                bgcolor: '#4f46e5',
                '&:hover': { bgcolor: '#4338ca' }
              }}
            >
              {formSubmitting ? 'Otorgando...' : 'Otorgar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      
      <ConfirmDialog
        open={deleteDialog.open}
        title="Eliminar préstamo"
        message={`¿Seguro que querés eliminar el préstamo Nº ${deleteDialog.loan?.id} de ${deleteDialog.loan?.cliente_nombre || ''} ${deleteDialog.loan?.cliente_apellido || ''}? También se eliminarán sus pagos registrados. Esta acción no se puede deshacer.`}
        confirmText={deleting ? 'Eliminando...' : 'Eliminar'}
        cancelText="Cancelar"
        onConfirm={handleDeleteLoan}
        onCancel={() => setDeleteDialog({ open: false, loan: null })}
        severity="error"
      />

      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </Box>
  );
};

export default LoansPage;
