import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Box, AppBar, Toolbar, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Typography, IconButton, Divider, 
  useTheme, useMediaQuery, Avatar, Chip
} from '@mui/material';
import { 
  Menu as MenuIcon, Dashboard as DashboardIcon, 
  People as PeopleIcon, AccountBalance as AccountBalanceIcon,
  Logout as LogoutIcon, Person as PersonIcon, Payment as PaymentIcon,
  Warning as WarningIcon, CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import ClientsPage from './admin/ClientsPage';
import LoansPage from './admin/LoansPage';
import DashboardPage from './admin/DashboardPage';
import UsersPage from './admin/UsersPage';
import PaymentsPage from './admin/PaymentsPage';
import DebtorsPage from './collector/DebtorsPage';
import DueLoansPage from './collector/DueLoansPage';
import NotificationBell from '../components/NotificationBell';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminPanel: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminName, setAdminName] = useState('Administrador');
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Protección de ruta
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      navigate('/login');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.rol !== 'admin') {
        navigate('/login');
      } else {
        setAdminName(user.usuario);
      }
    } catch (e) {
      localStorage.clear();
      navigate('/login');
    }
  }, [navigate]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', path: 'dashboard', icon: <DashboardIcon /> },
    { text: 'Clientes', path: 'clients', icon: <PeopleIcon /> },
    { text: 'Préstamos', path: 'loans', icon: <AccountBalanceIcon /> },
    { text: 'Cobros', path: 'payments', icon: <PaymentIcon /> },
    { text: 'Deudores Morosos', path: 'debtors', icon: <WarningIcon /> },
    { text: 'Próximos Vencimientos', path: 'due', icon: <CalendarTodayIcon /> },
    { text: 'Usuarios', path: 'users', icon: <PersonIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a', color: 'white', pt: 4 }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%)' }}>
        <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40, fontWeight: 'bold' }}>A</Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" color="white" sx={{ lineHeight: 1.2 }}>
            NUEVA OPCIÓN
          </Typography>
          <Typography variant="caption" color="#818cf8" fontWeight="bold" sx={{ display: 'block' }}>
            ADMINISTRADOR
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      
      {/* Navegación */}
      <List sx={{ px: 1, py: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const fullPath = `/admin/${item.path}`;
          const isActive = location.pathname.includes(item.path);
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(99, 102, 241, 0.12)',
                    '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.18)' }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.03)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#818cf8' : '#64748b' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#a5b4fc' : '#94a3b8'
                    }
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      
      {/* Botón Salir */}
      <Box sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1.5,
              color: '#f87171',
              '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.08)' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: '#f87171' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Cerrar Sesión" 
              sx={{ 
                '& .MuiTypography-root': { 
                  fontSize: '0.875rem',
                  fontWeight: 600
                }
              }} 
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Header onMenuClick={handleDrawerToggle} showMenuButton={isMobile} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Mobile Sidebar */}
        <Box component="nav" sx={{ width: { md: 256 }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: 256,
                zIndex: 9999
              }
            }}
          >
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 256, border: 'none' }
            }}
            open
          >
            {drawerContent}
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* AppBar */}
        <AppBar position="sticky" sx={{ bgcolor: 'transparent', boxShadow: 'none', zIndex: (theme) => theme.zIndex.drawer + 3 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, fontWeight: 'bold', color: '#1e293b' }}>
              {location.pathname.includes('dashboard') ? 'Panel de Resumen' : 
               location.pathname.includes('clients') ? 'Gestión de Clientes' : 
               location.pathname.includes('loans') ? 'Control de Préstamos' : 
               location.pathname.includes('payments') ? 'Gestión de Cobros' :
               location.pathname.includes('debtors') ? 'Deudores Morosos' :
               location.pathname.includes('due') ? 'Próximos Vencimientos' :
               location.pathname.includes('users') ? 'Gestión de Usuarios' : 'Panel de Administración'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
              <NotificationBell />
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                <Typography variant="body2" fontWeight="bold" color="#1e293b">{adminName}</Typography>
                <Typography variant="caption" color="#64748b">Administrador</Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>
                <PeopleIcon />
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Routes>
            <Route path="clients" element={<ClientsPage />} />
            <Route path="loans" element={<LoansPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="debtors" element={<DebtorsPage />} />
            <Route path="due" element={<DueLoansPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </Box>
      </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default AdminPanel;
