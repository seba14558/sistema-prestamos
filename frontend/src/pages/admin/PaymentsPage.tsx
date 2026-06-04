import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Alert, CircularProgress, Card, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, IconButton
} from '@mui/material';
import { Edit, Delete, Payment, AttachMoney, CalendarToday } from '@mui/icons-material';
import api, { editarPago, eliminarPago } from '../../services/api';

interface Payment {
  id: number;
  prestamo_id: number;
  monto: string | number;
  fecha_pago: string;
  cliente_nombre?: string;
  cliente_apellido?: string;
  cobrador_nombre?: string;
  cobrador_apellido?: string;
}

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para edición de pago
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editMonto, setEditMonto] = useState('');
  const [editFechaPago, setEditFechaPago] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/pagos/recaudacion');
      setPayments(res.data);
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
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al editar el pago.');
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      return;
    }

    try {
      await eliminarPago(id);
      await fetchPayments();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al eliminar el pago.');
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5 }}>
          Gestión de Cobros
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Visualiza, edita y elimina los cobros registrados por los cobradores
        </Typography>
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
          <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight="bold" color="#1e293b">
              Todos los Cobros Registrados
            </Typography>
            <Typography variant="caption" color="#64748b">
              Historial de cobros registrados por todos los cobradores
            </Typography>
          </Box>

          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Cobro ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Cobrador</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { xs: 'none', sm: 'table-cell' } }}>ID Préstamo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Monto Cobrado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { xs: 'none', sm: 'table-cell' } }}>Fecha de Cobro</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#475569' }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No hay cobros registrados.
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
                      <TableCell sx={{ color: '#64748b' }}>
                        {p.cobrador_nombre && p.cobrador_apellido 
                          ? `${p.cobrador_nombre} ${p.cobrador_apellido}` 
                          : 'Cobrador'}
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', display: { xs: 'none', sm: 'table-cell' } }}>#{p.prestamo_id}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#10b981' }}>
                        +${Number(p.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{new Date(p.fecha_pago).toLocaleDateString('es-AR')}</TableCell>
                      <TableCell align="center">
                        <IconButton onClick={() => handleEditPayment(p)} size="small" sx={{ color: '#6366f1' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleDeletePayment(p.id)} size="small" sx={{ color: '#ef4444' }}>
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
                  <Box sx={{ mr: 1 }}>
                    <AttachMoney color="action" />
                  </Box>
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
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1 }}>
                    <CalendarToday color="action" />
                  </Box>
                ),
              }}
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

export default PaymentsPage;
