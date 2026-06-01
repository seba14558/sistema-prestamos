import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CircularProgress, 
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, LinearProgress, Chip, useTheme
} from '@mui/material';
import { 
  TrendingUp, AttachMoney, PeopleAlt, AccountBalance, 
  ShowChart, ReceiptLong, AssignmentTurnedIn
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
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-3px)' }
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(99, 102, 241, 0.08)', color: '#6366f1' }}>
                <AccountBalance sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="600" color="text.secondary">
                  CAPITAL PRESTADO
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#1e293b">
                  {formatCurrency(stats.totalPrestado)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-3px)' }
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
                <TrendingUp sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="600" color="text.secondary">
                  RECAUDADO
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#1e293b">
                  {formatCurrency(stats.totalCobrado)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-3px)' }
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
                <AttachMoney sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="600" color="text.secondary">
                  SALDO EN CALLE
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#1e293b">
                  {formatCurrency(stats.totalPendiente)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid #f1f5f9',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-3px)' }
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>
                <PeopleAlt sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="600" color="text.secondary">
                  TOTAL CLIENTES
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="#1e293b">
                  {loans.length} Préstamos
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Porcentaje de recuperación */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShowChart color="primary" />
                <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">
                  Tasa de Recuperación Financiera
                </Typography>
              </Box>
              <Typography variant="subtitle2" fontWeight="bold" color="#6366f1">
                {stats.porcentajeRecuperacion.toFixed(1)}% Cobrado
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={stats.porcentajeRecuperacion} 
              sx={{ 
                height: 12, 
                borderRadius: 6, 
                bgcolor: '#e2e8f0',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)',
                }
              }}
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              El porcentaje refleja la relación de cobro efectivo de cuotas contra el capital original prestado en circulación.
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, p: 3, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <AssignmentTurnedIn color="primary" />
              <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">
                Préstamos por Estado
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#f0fdf4', textAlign: 'center', border: '1px solid #dcfce7' }}>
                  <Typography variant="h6" fontWeight="bold" color="#15803d">{stats.prestamosActivos}</Typography>
                  <Typography variant="caption" fontWeight="600" color="#166534">Activos</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fffbeb', textAlign: 'center', border: '1px solid #fef3c7' }}>
                  <Typography variant="h6" fontWeight="bold" color="#b45309">{stats.prestamosVencidos}</Typography>
                  <Typography variant="caption" fontWeight="600" color="#92400e">Vencidos</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#eff6ff', textAlign: 'center', border: '1px solid #dbeafe' }}>
                  <Typography variant="h6" fontWeight="bold" color="#1d4ed8">{stats.prestamosPagados}</Typography>
                  <Typography variant="caption" fontWeight="600" color="#1e40af">Pagados</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#fef2f2', textAlign: 'center', border: '1px solid #fee2e2' }}>
                  <Typography variant="h6" fontWeight="bold" color="#b91c1c">{stats.prestamosMorosos}</Typography>
                  <Typography variant="caption" fontWeight="600" color="#991b1b">Morosos</Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Transacciones recientes */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptLong color="primary" />
          <Typography variant="subtitle1" fontWeight="bold" color="#1e293b">
            Últimos Pagos Registrados (Recaudación)
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Pago ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Préstamo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Monto Cobrado</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Fecha de Pago</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569' }}>Registrado por (Cobrador)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    No se han registrado pagos en el sistema aún.
                  </TableCell>
                </TableRow>
              ) : (
                payments.slice(0, 5).map((pay) => (
                  <TableRow key={pay.id} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell sx={{ fontWeight: 600, color: '#6366f1' }}>#{pay.id}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {pay.cliente_nombre && pay.cliente_apellido 
                        ? `${pay.cliente_nombre} ${pay.cliente_apellido}` 
                        : 'Cliente Desconocido'}
                    </TableCell>
                    <TableCell sx={{ color: '#475569' }}>Préstamo #{pay.prestamo_id}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#10b981' }}>
                      +${Number(pay.monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>{new Date(pay.fecha_pago).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={pay.cobrador_usuario || 'Admin'} 
                        size="small" 
                        color="secondary"
                        variant="outlined" 
                        sx={{ fontWeight: 'bold' }} 
                      />
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
