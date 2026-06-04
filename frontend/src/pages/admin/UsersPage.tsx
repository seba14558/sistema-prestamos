import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Alert, CircularProgress, Card, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, IconButton
} from '@mui/material';
import { Add, Edit, Delete, Person } from '@mui/icons-material';
import { getUsuarios, crearUsuario, editarUsuario, eliminarUsuario } from '../../services/api';

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
      } else {
        await crearUsuario(userData);
      }

      setDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      await eliminarUsuario(id);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5 }}>
            Gestión de Usuarios
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra los usuarios del sistema (administradores y cobradores)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#6366f1',
            '&:hover': { bgcolor: '#4f46e5' }
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
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Apellido</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Usuario</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Rol</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }} align="center">Acciones</TableCell>
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
                    <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#f8fafc' }, borderBottom: '1px solid #f1f5f9' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#6366f1' }}>#{user.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#1e293b' }}>{user.nombre}</TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{user.apellido}</TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{user.usuario}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            bgcolor: user.rol === 'admin' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: user.rol === 'admin' ? '#6366f1' : '#10b981'
                          }}
                        >
                          {user.rol === 'admin' ? 'Administrador' : 'Cobrador'}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleOpenDialog(user)} size="small" sx={{ color: '#6366f1' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(user.id)} size="small" sx={{ color: '#ef4444' }}>
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
    </Box>
  );
};

export default UsersPage;
