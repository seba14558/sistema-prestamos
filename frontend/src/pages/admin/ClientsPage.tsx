import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, IconButton, 
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, 
  InputAdornment, Alert, CircularProgress, Card
} from '@mui/material';
import { Search, Edit, Person, LocationOn, Delete } from '@mui/icons-material';
import api, { editarCliente, eliminarCliente } from '../../services/api';

interface Client {
  id: number;
  nombre: string;
  apellido: string;
  direccion: string;
}

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Estados del modal
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  // Formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [direccion, setDireccion] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Cargar clientes
  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/clientes');
      setClients(res.data);
      setFilteredClients(res.data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener el listado de clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    
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

  // Filtrar clientes en tiempo real
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredClients(clients);
    } else {
      const term = search.toLowerCase();
      const filtered = clients.filter(
        c => 
          c.nombre.toLowerCase().includes(term) || 
          c.apellido.toLowerCase().includes(term) || 
          c.direccion.toLowerCase().includes(term) ||
          String(c.id).includes(term)
      );
      setFilteredClients(filtered);
    }
  }, [search, clients]);

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditMode(true);
      setSelectedClientId(client.id);
      setNombre(client.nombre);
      setApellido(client.apellido);
      setDireccion(client.direccion);
    } else {
      setEditMode(false);
      setSelectedClientId(null);
      setNombre('');
      setApellido('');
      setDireccion('');
    }
    setFormError('');
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !direccion.trim()) {
      setFormError('Por favor, completa todos los campos.');
      return;
    }

    setFormError('');
    setFormSubmitting(true);

    try {
      if (editMode && selectedClientId !== null) {
        // Editar cliente existente
        await editarCliente(selectedClientId, {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          direccion: direccion.trim()
        });
      } else {
        // Crear nuevo cliente
        await api.post('/clientes', {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          direccion: direccion.trim()
        });
      }
      
      // Recargar tabla y cerrar modal
      await fetchClients();
      handleCloseDialog();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al guardar el cliente.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      return;
    }

    try {
      await eliminarCliente(id);
      await fetchClients();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al eliminar el cliente.');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1e293b">
            Gestión de Clientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra, edita y registra nuevos clientes en el sistema
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Person />}
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
          Nuevo Cliente
        </Button>
      </Box>

      {/* Alertas generales */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Contenedor de Búsqueda y Tabla */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
          <TextField
            placeholder="Buscar por nombre, apellido, dirección o ID..."
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
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Nombre Completo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Dirección de Residencia</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: '#475569' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No se encontraron clientes registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow 
                      key={client.id}
                      sx={{ 
                        '&:hover': { bgcolor: '#f8fafc' }, 
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: '#6366f1' }}>#{client.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#1e293b' }}>
                        {client.nombre} {client.apellido}
                      </TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{client.direccion}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(client)}
                          sx={{ 
                            bgcolor: 'rgba(99, 102, 241, 0.08)',
                            '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.15)' }
                          }}
                        >
                          <Edit sx={{ fontSize: 20 }} />
                        </IconButton>
                        {isAdmin && (
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(client.id)}
                            sx={{ 
                            ml: 1,
                            bgcolor: 'rgba(239, 68, 68, 0.08)',
                            '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.15)' }
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

      {/* Modal de Registro / Edición */}
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
          {editMode ? 'Editar Información del Cliente' : 'Registrar Nuevo Cliente'}
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
                  label="Nombre"
                  fullWidth
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={formSubmitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'text.secondary', mr: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Apellido"
                  fullWidth
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  disabled={formSubmitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'text.secondary', mr: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Dirección"
                  fullWidth
                  required
                  multiline
                  rows={2}
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  disabled={formSubmitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: 'text.secondary', mr: 0.5 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
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
              {formSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default ClientsPage;
