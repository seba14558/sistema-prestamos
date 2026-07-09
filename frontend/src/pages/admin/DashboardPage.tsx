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
        <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5, letterSpacing: '0.5px' }}>
          Panel de Control Financiero
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.3px' }}>
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
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            border: '1px solid rgba(99, 102, 241, 0.1)', 
            p: 3, 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 30px rgba(99, 102, 241, 0.15)',
              borderColor: 'rgba(99, 102, 241, 0.3)'
            } 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
              }}>
                <AttachMoney sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="#64748b" sx={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  CAPITAL PRESTADO
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ letterSpacing: '0.3px' }}>
                  {formatCurrency(stats.totalPrestado)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            border: '1px solid rgba(16, 185, 129, 0.1)', 
            p: 3, 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 30px rgba(16, 185, 129, 0.15)',
              borderColor: 'rgba(16, 185, 129, 0.3)'
            } 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
              }}>
                <TrendingUp sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="#64748b" sx={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  RECAUDADO
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ letterSpacing: '0.3px' }}>
                  {formatCurrency(stats.totalCobrado)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            border: '1px solid rgba(245, 158, 11, 0.1)', 
            p: 3, 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 30px rgba(245, 158, 11, 0.15)',
              borderColor: 'rgba(245, 158, 11, 0.3)'
            } 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
              }}>
                <Alarm sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="#64748b" sx={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  SALDO EN CALLE
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ letterSpacing: '0.3px' }}>
                  {formatCurrency(stats.totalPendiente)}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            border: '1px solid rgba(239, 68, 68, 0.1)', 
            p: 3, 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            '&:hover': { 
              transform: 'translateY(-4px)', 
              transition: 'all 0.3s ease',
              boxShadow: '0 12px 30px rgba(239, 68, 68, 0.15)',
              borderColor: 'rgba(239, 68, 68, 0.3)'
            } 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
              }}>
                <People sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="#64748b" sx={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  TOTAL CLIENTES
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ letterSpacing: '0.3px' }}>
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
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            border: '1px solid rgba(99, 102, 241, 0.1)', 
            p: 4,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  p: 1, 
                  borderRadius: 1, 
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: 'white'
                }}>
                  <MonetizationOn sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ letterSpacing: '0.3px' }}>
                  Tasa de Recuperación Financiera
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="bold" color="#6366f1" sx={{ letterSpacing: '0.5px' }}>
                {stats.porcentajeRecuperacion.toFixed(1)}% Cobrado
              </Typography>
            </Box>
            
            <Box sx={{ width: '100%', height: 16, bgcolor: '#e2e8f0', borderRadius: 8, overflow: 'hidden', mb: 2, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #6366f1 0%, #10b981 100%)', 
                  borderRadius: 8,
                  width: `${stats.porcentajeRecuperacion}%`,
                  boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
                  transition: 'width 1s ease-in-out'
                }}
              />
            </Box>
            
            <Typography variant="body2" color="#64748b" sx={{ letterSpacing: '0.3px' }}>
              El porcentaje refleja la relación de cobro efectivo de cuotas contra el capital original prestado en circulación.
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            border: '1px solid rgba(99, 102, 241, 0.1)', 
            p: 4, 
            height: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ 
                p: 1, 
                borderRadius: 1, 
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white'
              }}>
                <AccountBalanceWallet sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" color="#1e293b" sx={{ letterSpacing: '0.3px' }}>
                Préstamos por Estado
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', 
                  textAlign: 'center', 
                  border: '1px solid #86efac',
                  boxShadow: '0 2px 8px rgba(22, 163, 74, 0.1)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}>
                  <Typography variant="h5" fontWeight="bold" color="#166534">{stats.prestamosActivos}</Typography>
                  <Typography variant="caption" fontWeight="bold" color="#15803d">Activos</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
                  textAlign: 'center', 
                  border: '1px solid #fde68a',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}>
                  <Typography variant="h5" fontWeight="bold" color="#b45309">{stats.prestamosVencidos}</Typography>
                  <Typography variant="caption" fontWeight="bold" color="#92400e">Vencidos</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', 
                  textAlign: 'center', 
                  border: '1px solid #93c5fd',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.1)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}>
                  <Typography variant="h5" fontWeight="bold" color="#1e40af">{stats.prestamosPagados}</Typography>
                  <Typography variant="caption" fontWeight="bold" color="#1e3a8a">Pagados</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', 
                  textAlign: 'center', 
                  border: '1px solid #fca5a5',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' }
                }}>
                  <Typography variant="h5" fontWeight="bold" color="#b91c1c">{stats.prestamosMorosos}</Typography>
                  <Typography variant="caption" fontWeight="bold" color="#991b1b">Morosos</Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Transacciones recientes */}
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
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1 
        }}>
          <CalendarToday sx={{ color: 'white' }} />
          <Typography variant="h6" fontWeight="bold" color="white" sx={{ letterSpacing: '0.3px' }}>
            Últimos Pagos Registrados (Recaudación)
          </Typography>
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Pago ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { sm: 'table-cell' }, letterSpacing: '0.3px' }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { md: 'table-cell' }, letterSpacing: '0.3px' }}>Préstamo</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Monto Cobrado</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { sm: 'table-cell' }, letterSpacing: '0.3px' }}>Fecha de Pago</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#475569', display: { md: 'table-cell' }, letterSpacing: '0.3px' }}>Registrado por</TableCell>
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
                  <TableRow key={pay.id} sx={{ 
                    '&:hover': { 
                      bgcolor: 'rgba(99, 102, 241, 0.05)',
                      transition: 'bgcolor 0.2s'
                    }, 
                    borderBottom: '1px solid rgba(99, 102, 241, 0.1)' 
                  }}>
                    <TableCell sx={{ fontWeight: 600, color: '#6366f1', letterSpacing: '0.3px' }}>#{pay.id}</TableCell>
                    <TableCell sx={{ fontWeight: 500, display: {sm: 'table-cell' } }}>
                      {pay.cliente_nombre && pay.cliente_apellido 
                        ? `${pay.cliente_nombre} ${pay.cliente_apellido}` 
                        : 'Cliente Desconocido'}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', display: { md: 'table-cell' } }}>Préstamo N°{pay.prestamo_id}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#10b981', letterSpacing: '0.3px' }}>
                      +${Number(pay.monto).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{ display: { sm: 'table-cell' } }}>{new Date(pay.fecha_pago).toLocaleDateString('es-AR')}</TableCell>
                    <TableCell sx={{ display: { md: 'table-cell' } }}>
                      <Box sx={{ 
                        px: 2, 
                        py: 0.5, 
                        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', 
                        borderRadius: 1, 
                        display: 'inline-block', 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold', 
                        color: '#475569', 
                        border: '1px solid #cbd5e1',
                        letterSpacing: '0.3px'
                      }}>
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
