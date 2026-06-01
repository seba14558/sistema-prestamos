import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, 
  IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Avatar, Tooltip, Container, useTheme, useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon, People, MonetizationOn, Dashboard as DashboardIcon, 
  ExitToApp, AccountCircle
} from '@mui/icons-material';

import ClientsPage from './admin/ClientsPage';
import LoansPage from './admin/LoansPage';
import DashboardPage from './admin/DashboardPage';

const drawerWidth = 260;

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
    { text: 'Clientes', path: 'clients', icon: <People /> },
    { text: 'Préstamos', path: 'loans', icon: <MonetizationOn /> },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a', color: '#fff' }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5, background: 'linear-gradient(to right, #1e1b4b, #0f172a)' }}>
        <Avatar sx={{ bgcolor: '#6366f1', width: 40, height: 40 }}>A</Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#fff', lineHeight: 1.2 }}>
            NUEVA OPCIÓN
          </Typography>
          <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 600 }}>
            ADMINISTRADOR
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      
      {/* Navegación */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
          // Determinar si el item está activo
          const fullPath = `/admin/${item.path}`;
          const isActive = location.pathname.includes(item.path);
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  px: 2,
                  bgcolor: isActive ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                  color: isActive ? '#818cf8' : '#94a3b8',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.03)',
                    color: '#fff',
                    '& .MuiListItemIcon-root': {
                      color: '#fff'
                    }
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: isActive ? '#818cf8' : '#64748b',
                    minWidth: 40,
                    transition: 'color 0.2s'
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    fontWeight: isActive ? '600' : '500'
                  }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      
      {/* Botón Salir */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.25,
            px: 2,
            color: '#ef4444',
            '&:hover': {
              bgcolor: 'rgba(239, 68, 68, 0.08)',
            },
            transition: 'all 0.2s',
          }}
        >
          <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: '600' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: '#fff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: '#334155' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b', display: { xs: 'none', sm: 'block' } }}>
            {location.pathname.includes('dashboard') ? 'Panel de Resumen' : 
             location.pathname.includes('clients') ? 'Gestión de Clientes' : 
             location.pathname.includes('loans') ? 'Control de Préstamos' : 'Panel de Administración'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1e293b', lineHeight: 1 }}>
                {adminName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Administrador
              </Typography>
            </Box>
            <Tooltip title="Perfil">
              <Avatar sx={{ bgcolor: '#4f46e5', width: 40, height: 40 }}>
                <AccountCircle />
              </Avatar>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebars (Mobile / Desktop) */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar /> {/* Espaciador de la barra superior */}
        <Container maxWidth="xl" sx={{ flexGrow: 1, p: 0 }}>
          <Routes>
            <Route path="clients" element={<ClientsPage />} />
            <Route path="loans" element={<LoansPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminPanel;
