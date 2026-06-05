import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, Grid, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, CircularProgress 
} from '@mui/material';
import { 
  AccountBalanceWallet, TrendingUp, Alarm, People, 
  MonetizationOn, AttachMoney, CalendarToday 
} from '@mui/icons-material';
import api from '../../services/api';

interface Loan {
  id: number;
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
  cobrador_usuario?: string;
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Datos financieros
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    totalPrestado: 0,
    totalCobrado: 0,
    totalPendiente: 0,
    prestamosActivos: 0,
    prestamosVencidos: 0,
    prestamosPagados: 0,
    prestamosMorosos: 0,
    porcentajeRecuperacion: 0
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [loansRes, paymentsRes] = await Promise.all([
        api.get('/prestamos'),
        api.get('/pagos/recaudacion')
      ]);

      const fetchedLoans: Loan[] = loansRes.data;
      const fetchedPayments: Payment[] = paymentsRes.data;

      setLoans(fetchedLoans);
      setPayments(fetchedPayments);

      // Calcular estadísticas
      const totalPrestado = fetchedLoans.reduce((sum, l) => sum + Number(l.monto), 0);
      const totalCobrado = fetchedPayments.reduce((sum, p) => sum + Number(p.monto), 0);
      const totalPendiente = Math.max(0, totalPrestado - totalCobrado);
      
      const prestamosActivos = fetchedLoans.filter(l => l.estado === 'activo').length;
      const prestamosVencidos = fetchedLoans.filter(l => l.estado === 'vencido').length;
      const prestamosPagados = fetchedLoans.filter(l => l.estado === 'pagado').length;
      const prestamosMorosos = fetchedLoans.filter(l => l.estado === 'moroso').length;

      const porcentajeRecuperacion = totalPrestado > 0 ? (totalCobrado / totalPrestado) * 100 : 0;

      setStats({
        totalPrestado,
        totalCobrado,
        totalPendiente,
        prestamosActivos,
        prestamosVencidos,
        prestamosPagados,
        prestamosMorosos,
        porcentajeRecuperacion
      });

    } catch (err) {
      console.error(err);
      setError('Error al cargar la información del Dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const formatCurrency = (val: number) => {
    return val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5 }}>
          Panel de Control Financiero
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitorea en tiempo real el capital activo, ingresos por cobranza y rendimiento general
        </Typography>
      </Box>

      {error && (
        <Box sx={{ mb: 3, p: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
          {error}
        </Box>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', p: 3, '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.08)', color: '#6366f1' }}>
                <AttachMoney sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="#64748b" sx={{ fontSize: '0.75rem' }}>
                  CAPITAL PRESTADO
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#1e293b">
                  {formatCurrency(stats.totalPrestado)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', p: 3, '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                <TrendingUp sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="#64748b" sx={{ fontSize: '0.75rem' }}>
                  RECAUDADO
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#1e293b">
                  {formatCurrency(stats.totalCobrado)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', p: 3, '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
                <Alarm sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="#64748b" sx={{ fontSize: '0.75rem' }}>
                  SALDO EN CALLE
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#1e293b">
                  {formatCurrency(stats.totalPendiente)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', p: 3, '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>
                <People sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="#64748b" sx={{ fontSize: '0.75rem' }}>
                  TOTAL CLIENTES
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#1e293b">
                  {loans.length} Préstamos
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Porcentaje de recuperación */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonetizationOn sx={{ color: '#6366f1' }} />
                <Typography variant="h6" fontWeight="bold" color="#1e293b">
                  Tasa de Recuperación Financiera
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="bold" color="#6366f1">
                {stats.porcentajeRecuperacion.toFixed(1)}% Cobrado
              </Typography>
            </Box>
            
            <Box sx={{ width: '100%', height: 12, bgcolor: '#e2e8f0', borderRadius: 6, overflow: 'hidden', mb: 2 }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  bgcolor: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)', 
                  borderRadius: 6,
                  width: `${stats.porcentajeRecuperacion}%`
                }}
              />
            </Box>
            
            <Typography variant="body2" color="#64748b">
              El porcentaje refleja la relación de cobro efectivo de cuotas contra el capital original prestado en circulación.
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <AccountBalanceWallet sx={{ color: '#6366f1' }} />
              <Typography variant="h6" fontWeight="bold" color="#1e293b">
                Préstamos por Estado
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#dcfce7', textAlign: 'center', border: '1px solid #86efac' }}>
                  <Typography variant="h5" fontWeight="bold" color="#166534">{stats.prestamosActivos}</Typography>
                  <Typography variant="caption" fontWeight="bold" color="#15803d">Activos</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fef3c7', textAlign: 'center', border: '1px solid #fde68a' }}>
                  <Typography variant="h5" fontWeight="bold" color="#b45309">{stats.prestamosVencidos}</Typography>
                  <Typography variant="caption" fontWeight="bold" color="#92400e">Vencidos</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#dbeafe', textAlign: 'center', border: '1px solid #93c5fd' }}>
                  <Typography variant="h5" fontWeight="bold" color="#1e40af">{stats.prestamosPagados}</Typography>
                  <Typography variant="caption" fontWeight="bold" color="#1e3a8a">Pagados</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fee2e2', textAlign: 'center', border: '1px solid #fca5a5' }}>
                  <Typography variant="h5" fontWeight="bold" color="#b91c1c">{stats.prestamosMorosos}</Typography>
                  <Typography variant="caption" fontWeight="bold" color="#991b1b">Morosos</Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Transacciones recientes */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarToday sx={{ color: '#6366f1' }} />
          <Typography variant="h6" fontWeight="bold" color="#1e293b">
            Últimos Pagos Registrados (Recaudación)
          </Typography>
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Pago ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { sm: 'table-cell' } }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { md: 'table-cell' } }}>Préstamo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Monto Cobrado</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { sm: 'table-cell' } }}>Fecha de Pago</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { md: 'table-cell' } }}>Registrado por</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No se han registrado pagos en el sistema aún.
                  </TableCell>
                </TableRow>
              ) : (
                payments.slice(0, 5).map((pay) => (
                  <TableRow key={pay.id} sx={{ '&:hover': { bgcolor: '#f8fafc' }, borderBottom: '1px solid #f1f5f9' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#6366f1' }}>#{pay.id}</TableCell>
                    <TableCell sx={{ fontWeight: 500, display: {sm: 'table-cell' } }}>
                      {pay.cliente_nombre && pay.cliente_apellido 
                        ? `${pay.cliente_nombre} ${pay.cliente_apellido}` 
                        : 'Cliente Desconocido'}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', display: { md: 'table-cell' } }}>Préstamo #{pay.prestamo_id}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#10b981' }}>
                      +${Number(pay.monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{ display: { sm: 'table-cell' } }}>{new Date(pay.fecha_pago).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell sx={{ display: { md: 'table-cell' } }}>
                      <Box sx={{ px: 2, py: 0.5, bgcolor: '#f1f5f9', borderRadius: 1, display: 'inline-block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', border: '1px solid #e2e8f0' }}>
                        {pay.cobrador_usuario || 'Admin'}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default DashboardPage;
