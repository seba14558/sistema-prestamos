import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Dialog, 
  DialogTitle, DialogContent, DialogActions, Grid, 
  Alert, CircularProgress, Card, MenuItem, Chip, IconButton,
  Switch, FormControlLabel
} from '@mui/material';
import { Search, Add, Edit, Delete, Percent, CalendarToday } from '@mui/icons-material';
import api from '../../services/api';
import Toast from '../../components/Toast';
import TableSkeleton from '../../components/TableSkeleton';

interface Plan {
  id: number;
  nombre: string;
  dias: number;
  porcentaje_interes: number;
  activo: boolean;
}

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Estados del modal
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  // Formulario de Plan
  const [nombre, setNombre] = useState('');
  const [dias, setDias] = useState('');
  const [porcentajeInteres, setPorcentajeInteres] = useState('');
  const [activo, setActivo] = useState(true);
  
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

  // Cargar planes
  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/planes');
      setPlans(res.data);
      setFilteredPlans(res.data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener datos del servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Filtrar planes en tiempo real
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredPlans(plans);
    } else {
      const term = search.toLowerCase();
      const filtered = plans.filter(
        p => 
          p.nombre.toLowerCase().includes(term) ||
          String(p.dias).includes(term) ||
          String(p.porcentaje_interes).includes(term)
      );
      setFilteredPlans(filtered);
    }
  }, [search, plans]);

  const handleOpenDialog = (plan?: Plan) => {
    if (plan) {
      setEditMode(true);
      setSelectedPlanId(plan.id);
      setNombre(plan.nombre);
      setDias(String(plan.dias));
      setPorcentajeInteres(String(plan.porcentaje_interes));
      setActivo(plan.activo);
    } else {
      setEditMode(false);
      setSelectedPlanId(null);
      setNombre('');
      setDias('');
      setPorcentajeInteres('');
      setActivo(true);
    }
    setFormError('');
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !dias || !porcentajeInteres) {
      setFormError('Por favor, completa todos los campos requeridos.');
      return;
    }

    const numDias = parseInt(dias);
    const numPorcentaje = parseFloat(porcentajeInteres);

    if (isNaN(numDias) || numDias <= 0) {
      setFormError('Los días deben ser un número positivo.');
      return;
    }

    if (isNaN(numPorcentaje) || numPorcentaje <= 0) {
      setFormError('El porcentaje debe ser un número positivo.');
      return;
    }

    setFormError('');
    setFormSubmitting(true);

    try {
      if (editMode && selectedPlanId !== null) {
        await api.put(`/planes/${selectedPlanId}`, {
          nombre,
          dias: numDias,
          porcentaje_interes: numPorcentaje,
          activo
        });
        showToast('Plan actualizado exitosamente', 'success');
      } else {
        await api.post('/planes', {
          nombre,
          dias: numDias,
          porcentaje_interes: numPorcentaje,
          activo
        });
        showToast('Plan creado exitosamente', 'success');
      }
      
      await fetchPlans();
      handleCloseDialog();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al guardar el plan.');
      showToast('Error al guardar el plan', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este plan?')) {
      return;
    }

    try {
      await api.delete(`/planes/${id}`);
      showToast('Plan eliminado exitosamente', 'success');
      await fetchPlans();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error al eliminar el plan', 'error');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ letterSpacing: '0.5px', lineHeight: { xs: 1.4, sm: 1.2 }, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            Gestión de Planes
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mt: 1 }}>
            Administra los planes de préstamo con sus días y porcentajes de interés
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: '#0f766e',
            '&:hover': { backgroundColor: '#0d5f56' },
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Nuevo Plan
        </Button>
      </Box>

      {/* Tarjeta principal */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        {/* Barra de búsqueda */}
        <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, días o porcentaje..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#94a3b8' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                '&:hover': { backgroundColor: '#f1f5f9' },
                '&.Mui-focused': { backgroundColor: '#ffffff' },
              },
            }}
          />
        </Box>

        {/* Tabla */}
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Días</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Interés (%)</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <TableSkeleton rows={5} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {error}
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : filteredPlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body1" color="#64748b">
                      No se encontraron planes
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlans.map((plan) => (
                  <TableRow key={plan.id} hover sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                    <TableCell sx={{ fontWeight: 500 }}>{plan.nombre}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: '#64748b' }} />
                        {plan.dias}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Percent sx={{ fontSize: 16, color: '#64748b' }} />
                        {plan.porcentaje_interes}%
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plan.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={plan.activo ? 'success' : 'default'}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenDialog(plan)}
                        size="small"
                        sx={{ color: '#0f766e', '&:hover': { backgroundColor: '#f0fdfa' } }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(plan.id)}
                        size="small"
                        sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal de Crear/Editar Plan */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            {editMode ? 'Editar Plan' : 'Nuevo Plan'}
          </Typography>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {formError}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre del Plan"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Días"
                  type="number"
                  value={dias}
                  onChange={(e) => setDias(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={{ fontSize: 16, color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Porcentaje de Interés"
                  type="number"
                  value={porcentajeInteres}
                  onChange={(e) => setPorcentajeInteres(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Percent sx={{ fontSize: 16, color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                      color="success"
                    />
                  }
                  label="Plan Activo"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleCloseDialog} disabled={formSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formSubmitting}
              sx={{
                backgroundColor: '#0f766e',
                '&:hover': { backgroundColor: '#0d5f56' },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {formSubmitting ? <CircularProgress size={24} color="inherit" /> : (editMode ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Toast */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </Box>
  );
};

export default PlansPage;
