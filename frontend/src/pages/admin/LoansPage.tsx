import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, 
  InputAdornment, Alert, CircularProgress, Card, MenuItem, Chip
} from '@mui/material';
import { Add, Edit, Search, CalendarToday, AttachMoney, Person } from '@mui/icons-material';
import api from '../../services/api';

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
  const [plan, setPlan] = useState('Diario');
  const [monto, setMonto] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().slice(0, 10));
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [estado, setEstado] = useState('activo');
  
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Calcular la fecha de vencimiento automáticamente
  useEffect(() => {
    if (!fechaInicio) return;
    
    const date = new Date(fechaInicio + 'T12:00:00'); // Evitar problemas de huso horario
    if (isNaN(date.getTime())) return;

    if (plan === 'Diario') {
      date.setDate(date.getDate() + 30); // 30 días
    } else if (plan === 'Semanal') {
      date.setDate(date.getDate() + 60); // 60 días
    } else if (plan === 'Mensual') {
      date.setMonth(date.getMonth() + 6); // 6 meses
    }

    setFechaVencimiento(date.toISOString().slice(0, 10));
  }, [plan, fechaInicio]);

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
      setPlan('Diario');
      setMonto('');
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
      }
      
      await fetchData();
      handleCloseDialog();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al guardar el préstamo.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'activo':
        return <Chip label="Activo" color="success" size="small" sx={{ fontWeight: 'bold', minWidth: 80 }} />;
      case 'vencido':
        return <Chip label="Vencido" color="warning" size="small" sx={{ fontWeight: 'bold', minWidth: 80 }} />;
      case 'pagado':
        return <Chip label="Pagado" color="info" size="small" sx={{ fontWeight: 'bold', minWidth: 80 }} />;
      case 'moroso':
        return <Chip label="Moroso" color="error" size="small" sx={{ fontWeight: 'bold', minWidth: 80 }} />;
      default:
        return <Chip label={status} size="small" sx={{ fontWeight: 'bold', minWidth: 80 }} />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1e293b">
            Control de Préstamos
          </Typography>
          <Typography variant="body2" color="text.secondary">
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
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)',
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
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
          <TextField
            placeholder="Buscar por cliente, plan, estado o ID..."
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
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

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Préstamo ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Monto Otorgado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Fecha de Otorgamiento</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Vencimiento</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#475569' }}>Estado</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#475569' }}>Acciones</TableCell>
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
                        '&:hover': { bgcolor: '#f8fafc' }, 
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: '#6366f1' }}>#{loan.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#1e293b' }}>
                        {loan.cliente_nombre && loan.cliente_apellido 
                          ? `${loan.cliente_nombre} ${loan.cliente_apellido}` 
                          : `Cliente ID: ${loan.cliente_id}`}
                      </TableCell>
                      <TableCell>
                        <Chip label={loan.plan} variant="outlined" size="small" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#0f172a' }}>
                        ${Number(loan.monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{new Date(loan.fecha_inicio).toLocaleDateString('es-AR')}</TableCell>
                      <TableCell>{new Date(loan.fecha_vencimiento).toLocaleDateString('es-AR')}</TableCell>
                      <TableCell align="center">{getStatusChip(loan.estado)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(loan)}
                          sx={{ 
                            bgcolor: 'rgba(99, 102, 241, 0.08)',
                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' }
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
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
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
                        <Person sx={{ color: 'text.secondary', mr: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} (#{c.id})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
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
                  <MenuItem value="Diario">Diario (+30 días)</MenuItem>
                  <MenuItem value="Semanal">Semanal (+60 días)</MenuItem>
                  <MenuItem value="Mensual">Mensual (+6 meses)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
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
                        <AttachMoney sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
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

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fecha de Vencimiento Estimada"
                  fullWidth
                  required
                  type="date"
                  value={fechaVencimiento}
                  disabled // Campo automatizado para evitar inconsistencias
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={{ color: 'text.secondary', mr: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8fafc' }
                  }}
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
    </Box>
  );
};

export default LoansPage;
