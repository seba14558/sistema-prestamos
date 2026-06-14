import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Dialog, 
  DialogTitle, DialogContent, DialogActions, Grid, 
  InputAdornment, Alert, CircularProgress, Card, MenuItem, Chip, IconButton
} from '@mui/material';
import { Search, Add, Edit, AccountBalance, CalendarToday, AttachMoney } from '@mui/icons-material';
import api from '../../services/api';
import Toast from '../../components/Toast';
import TableSkeleton from '../../components/TableSkeleton';

interface Client {
  id: number;
  nombre: string;
  apellido: string;
}

interface Loan {
  id: number;
  cliente_id: number;
  cliente_nombre?: string;
  cliente_apellido?: string;
  plan: string;
  monto: string | number;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado: string; // 'activo', 'vencido', 'pagado', 'moroso'
}

const LoansPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Estados del modal
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);

  // Formulario de Préstamo
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [plan, setPlan] = useState('30 dias');
  const [monto, setMonto] = useState('');
  const [montoTotal, setMontoTotal] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10));
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [estado, setEstado] = useState('activo');
  
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

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
    if (!fechaInicio || !monto) return;
    
    const date = new Date(fechaInicio + 'T12:00:00'); // Evitar problemas de huso horario
    if (isNaN(date.getTime())) return;

    let dias = 0;
    let multiplicador = 1;

    if (plan === '30 dias') {
      dias = 30;
      multiplicador = 1.30; // 30% de interés
    } else if (plan === '40 dias') {
      dias = 40;
      multiplicador = 1.35; // 35% de interés
    } else if (plan === '50 dias') {
      dias = 50;
      multiplicador = 1.40; // 40% de interés
    }

    date.setDate(date.getDate() + dias);
    setFechaVencimiento(date.toISOString().slice(0, 10));
    
    // Calcular monto total con intereses
    const montoNumerico = parseFloat(monto);
    if (!isNaN(montoNumerico)) {
      setMontoTotal((montoNumerico * multiplicador).toString());
    }
  }, [plan, fechaInicio, monto]);

  // Cargar préstamos y clientes
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [loansRes, clientsRes] = await Promise.all([
        api.get('/prestamos'),
        api.get('/clientes')
      ]);
      setLoans(loansRes.data);
      setFilteredLoans(loansRes.data);
      setClients(clientsRes.data);
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
      // Formatear fechas para los inputs
      setFechaInicio(new Date(loan.fecha_inicio).toISOString().slice(0, 10));
      setFechaVencimiento(new Date(loan.fecha_vencimiento).toISOString().slice(0, 10));
      setEstado(loan.estado);
    } else {
      setEditMode(false);
      setSelectedLoanId(null);
      setClienteId('');
      setPlan('30 dias');
      setMonto('');
      setMontoTotal('');
      setFechaInicio(new Date().toISOString().slice(0, 10));
      setEstado('activo');
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
      if (editMode && selectedLoanId !== null) {
        // Editar préstamo existente (solo administradores)
        await api.put(`/prestamos/${selectedLoanId}`, {
          plan,
          monto: numMonto,
          fecha_inicio: fechaInicio,
          fecha_vencimiento: fechaVencimiento,
          estado
        });
        showToast('Préstamo actualizado exitosamente', 'success');
      } else {
        // Crear nuevo préstamo
        await api.post('/prestamos', {
          cliente_id: Number(clienteId),
          plan,
          monto: numMonto,
          fecha_inicio: fechaInicio,
          fecha_vencimiento: fechaVencimiento,
          estado: 'activo'
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
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
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
                      <TableCell sx={{ fontWeight: 600, color: '#6366f1', letterSpacing: '0.3px' }}>#{loan.id}</TableCell>
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
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editMode ? `Editar Préstamo #${selectedLoanId}` : 'Otorgar Nuevo Préstamo'}
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
                      {c.nombre} {c.apellido} (#{c.id})
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
                  <MenuItem value="30 dias">30 días (30% interés)</MenuItem>
                  <MenuItem value="40 dias">40 días (35% interés)</MenuItem>
                  <MenuItem value="50 dias">50 días (40% interés)</MenuItem>
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
