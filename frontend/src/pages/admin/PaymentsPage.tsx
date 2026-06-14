import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Alert, CircularProgress, Card, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, IconButton
} from '@mui/material';
import { Edit, Delete, Payment, AttachMoney, CalendarToday } from '@mui/icons-material';
import api, { editarPago, eliminarPago } from '../../services/api';
import Toast from '../../components/Toast';
import ConfirmDialog from '../../components/ConfirmDialog';
import TableSkeleton from '../../components/TableSkeleton';

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

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5, letterSpacing: '0.5px', lineHeight: { xs: 1.4, sm: 1.2 }, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Gestión de Cobros
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.3px' }}>
          Visualiza, edita y elimina los cobros registrados por los cobradores
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <TableSkeleton rows={8} columns={7} />
      ) : (
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
              Historial de cobros registrados por todos los cobradores
            </Typography>
          </Box>

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
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      No hay cobros registrados.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id} sx={{ 
                      '&:hover': { 
                        bgcolor: 'rgba(99, 102, 241, 0.05)',
                        transition: 'background-color 0.2s'
                      }, 
                      borderBottom: '1px solid rgba(99, 102, 241, 0.1)' 
                    }}>
                      <TableCell sx={{ fontWeight: 600, color: '#10b981', letterSpacing: '0.3px' }}>#{p.id}</TableCell>
                      <TableCell sx={{ fontWeight: 500, color: '#1e293b', letterSpacing: '0.3px' }}>
                        {p.cliente_nombre && p.cliente_apellido 
                          ? `${p.cliente_nombre} ${p.cliente_apellido}` 
                          : 'Cliente'}
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', letterSpacing: '0.3px' }}>
                        {p.cobrador_nombre && p.cobrador_apellido 
                          ? `${p.cobrador_nombre} ${p.cobrador_apellido}` 
                          : 'Cobrador'}
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', letterSpacing: '0.3px' }}>#{p.prestamo_id}</TableCell>
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
