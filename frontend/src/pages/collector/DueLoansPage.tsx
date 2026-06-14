import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Card, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Tabs, Tab, Alert, CircularProgress, Chip, Button
} from '@mui/material';
import { AccessTime, Warning, Home, Payments } from '@mui/icons-material';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import TableSkeleton from '../../components/TableSkeleton';

interface Loan {
  id: number;
  cliente_id: number;
  cliente_nombre?: string;
  cliente_apellido?: string;
  cliente_direccion?: string;
  plan: string;
  monto: string | number;
  fecha_inicio: string;
  fecha_vencimiento: string;
  estado: string;
}

const DueLoansPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [upcomingLoans, setUpcomingLoans] = useState<Loan[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<Loan[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchDueData = async () => {
    setLoading(true);
    setError('');
    try {
      const [upcomingRes, overdueRes] = await Promise.all([
        api.get('/prestamos/proximos-vencer'),
        api.get('/prestamos/vencimientos')
      ]);
      setUpcomingLoans(upcomingRes.data);
      setOverdueLoans(overdueRes.data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener la información de vencimientos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getDaysRemainingOrOverdue = (dueDateStr: string, isOverdue: boolean) => {
    const due = new Date(dueDateStr + 'T12:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);
    
    const diffTime = Math.abs(due.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (isOverdue) {
      return `${diffDays} días de retraso`;
    } else {
      if (today.getTime() === due.getTime()) return 'Vence hoy';
      return `Vence en ${diffDays} días`;
    }
  };

  const renderLoansTable = (loansList: Loan[], isOverdue: boolean) => {
    if (loansList.length === 0) {
      return (
        <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
          {isOverdue 
            ? '¡Excelente! No hay préstamos con vencimientos impagos históricos.' 
            : 'No hay préstamos programados para vencer en los próximos 3 días.'}
        </Box>
      );
    }

    return (
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>ID Préstamo</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Cliente</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Dirección de Cobro</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Monto Pendiente</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Fecha de Vencimiento</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Plazo / Alerta</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', color: '#475569', letterSpacing: '0.3px' }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loansList.map((loan) => (
              <TableRow 
                key={loan.id} 
                sx={{ 
                  '&:hover': { 
                    bgcolor: isOverdue ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                    transition: 'background-color 0.2s'
                  }, 
                  borderBottom: isOverdue ? '1px solid rgba(239, 68, 68, 0.1)' : '1px solid rgba(16, 185, 129, 0.1)'
                }}
              >
                <TableCell sx={{ fontWeight: 600, color: isOverdue ? '#ef4444' : '#10b981', letterSpacing: '0.3px' }}>#{loan.id}</TableCell>
                <TableCell sx={{ fontWeight: 500, color: '#1e293b', letterSpacing: '0.3px' }}>
                  {loan.cliente_nombre && loan.cliente_apellido 
                    ? `${loan.cliente_nombre} ${loan.cliente_apellido}` 
                    : `Cliente #${loan.cliente_id}`}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Home sx={{ color: 'text.secondary', fontSize: 18 }} />
                    <Typography variant="body2" color="#64748b" sx={{ letterSpacing: '0.3px' }}>{loan.cliente_direccion || 'No especificada'}</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#0f172a', letterSpacing: '0.3px' }}>
                  ${Number(loan.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell sx={{ fontWeight: 500, color: '#64748b', letterSpacing: '0.3px' }}>
                  {new Date(loan.fecha_vencimiento).toLocaleDateString('es-AR')}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getDaysRemainingOrOverdue(loan.fecha_vencimiento, isOverdue)} 
                    color={isOverdue ? 'error' : 'warning'} 
                    size="small" 
                    sx={{ fontWeight: 'bold' }} 
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="contained"
                    color={isOverdue ? 'error' : 'success'}
                    size="small"
                    startIcon={<Payments />}
                    onClick={() => navigate('/cobrador/collection')}
                    sx={{ 
                      textTransform: 'none', 
                      fontWeight: 'bold',
                      background: isOverdue 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      '&:hover': { 
                        background: isOverdue 
                          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                          : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: isOverdue 
                          ? '0 6px 16px rgba(239, 68, 68, 0.35)'
                          : '0 6px 16px rgba(16, 185, 129, 0.35)',
                        transition: 'all 0.3s ease'
                      },
                      boxShadow: isOverdue 
                        ? '0 4px 12px rgba(239, 68, 68, 0.25)'
                        : '0 4px 12px rgba(16, 185, 129, 0.25)',
                      letterSpacing: '0.3px'
                    }}
                  >
                    Registrar Cobro
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="#1e293b" sx={{ mb: 0.5, letterSpacing: '0.5px', lineHeight: { xs: 1.4, sm: 1.2 }, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Vencimientos de Préstamos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ letterSpacing: '0.3px' }}>
          Supervisa los préstamos próximos a expirar en el corto plazo y aquellos vencimientos históricos pendientes.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : (
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          border: '1px solid rgba(99, 102, 241, 0.1)', 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
        }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: '1px solid rgba(99, 102, 241, 0.1)', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ 
                '& .MuiTab-root': { 
                  textTransform: 'none', 
                  fontWeight: 'bold',
                  minHeight: 60,
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: 'white'
                  },
                  '&:hover': {
                    color: 'rgba(255, 255, 255, 0.9)'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white'
                }
              }}
            >
              <Tab 
                icon={<AccessTime />} 
                label={`Próximos a Vencer (${upcomingLoans.length})`}
                iconPosition="start"
              />
              <Tab 
                icon={<Warning />} 
                label={`Vencidos Históricos (${overdueLoans.length})`}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <Box sx={{ p: 0 }}>
            {activeTab === 0 && renderLoansTable(upcomingLoans, false)}
            {activeTab === 1 && renderLoansTable(overdueLoans, true)}
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default DueLoansPage;
