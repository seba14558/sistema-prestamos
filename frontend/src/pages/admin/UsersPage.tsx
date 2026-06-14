import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Alert, CircularProgress, Card, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, IconButton
} from '@mui/material';
import { Add, Edit, Delete, Person } from '@mui/icons-material';
import { getUsuarios, crearUsuario, editarUsuario, eliminarUsuario } from '../../services/api';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
  rol: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado del diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('cobrador');
  const [formError, setFormError] = useState('');

  // Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });

  const showToast = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  // Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: () => {} });

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUsuarios();
      setUsers(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Error al obtener usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setNombre(user.nombre);
      setApellido(user.apellido);
      setUsuario(user.usuario);
      setPassword('');
      setRol(user.rol);
    } else {
      setEditingUser(null);
      setNombre('');
      setApellido('');
      setUsuario('');
      setPassword('');
      setRol('cobrador');
    }
    setFormError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async () => {
    setFormError('');
    
    if (!nombre || !apellido || !usuario || (!editingUser && !password)) {
      setFormError('Por favor, completa todos los campos requeridos.');
      return;
    }

    try {
      const userData = {
        nombre,
        apellido,
        usuario,
        rol
      };

      if (!editingUser && password) {
        (userData as any).password = password;
      } else if (password) {
        (userData as any).password = password;
      }

      if (editingUser) {
        await editarUsuario(editingUser.id, userData);
        showToast('Usuario actualizado exitosamente', 'success');
      } else {
        await crearUsuario(userData);
        showToast('Usuario creado exitosamente', 'success');
      }

      setDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al guardar usuario');
      showToast('Error al guardar usuario', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    showConfirmDialog(
      'Eliminar Usuario',
      '¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.',
      async () => {
        try {
          await eliminarUsuario(id);
          fetchUsers();
          showToast('Usuario eliminado exitosamente', 'success');
        } catch (err: any) {
          console.error(err);
          setError(err.response?.data?.message || 'Error al eliminar usuario');
          showToast('Error al eliminar usuario', 'error');
        }
      }
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5, letterSpacing: '0.5px' }}>
            Gestión de Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.3px' }}>
            Administra los usuarios del sistema (administradores y cobradores)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)',
              transition: 'all 0.3s ease'
            },
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 'bold',
            minWidth: { xs: 'auto', sm: 'auto' },
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
            letterSpacing: '0.3px'
          }}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          border: '1px solid rgba(99, 102, 241, 0.1)', 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Apellido</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} sx={{ 
                      '&:hover': { 
                        bgcolor: 'rgba(99, 102, 241, 0.05)',
                        transition: 'background-color 0.2s'
                      }, 
                      borderBottom: '1px solid rgba(99, 102, 241, 0.1)' 
                    }}>
                      <TableCell sx={{ fontWeight: 600, color: '#6366f1', letterSpacing: '0.3px' }}>#{user.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#1e293b', letterSpacing: '0.3px' }}>{user.nombre}</TableCell>
                      <TableCell sx={{ color: '#64748b', letterSpacing: '0.3px' }}>{user.apellido}</TableCell>
                      <TableCell sx={{ color: '#64748b', letterSpacing: '0.3px' }}>{user.usuario}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            background: user.rol === 'admin' 
                              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)' 
                              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                            color: user.rol === 'admin' ? '#6366f1' : '#10b981',
                            border: user.rol === 'admin' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                            letterSpacing: '0.3px'
                          }}
                        >
                          {user.rol === 'admin' ? 'Administrador' : 'Cobrador'}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          onClick={() => handleOpenDialog(user)} 
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
                          onClick={() => handleDelete(user.id)} 
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
        </Card>
      )}

      {/* Dialogo para crear/editar usuario */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1 }}>
                    <Person color="action" />
                  </Box>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              helperText={editingUser ? 'Dejar vacío para mantener la contraseña actual' : ''}
            />
            <TextField
              fullWidth
              select
              label="Rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              margin="normal"
            >
              <MenuItem value="cobrador">Cobrador</MenuItem>
              <MenuItem value="admin">Administrador</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingUser ? 'Guardar' : 'Crear'}
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

export default UsersPage;
