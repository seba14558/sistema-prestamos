import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Box, Drawer, AppBar, Toolbar, List, Typography, Divider, 
  IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Avatar, Tooltip, Container, useTheme, useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon, People, MonetizationOn, ExitToApp, AccountCircle,
  AccountBalanceWallet, TrendingDown, ReportProblem, EventNote
} from '@mui/icons-material';

import CollectionPage from './collector/CollectionPage';
import DebtorsPage from './collector/DebtorsPage';
import DueLoansPage from './collector/DueLoansPage';

const drawerWidth = 260;

const CollectorPanel: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectorName, setCollectorName] = useState('Cobrador');
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
      if (user.rol !== 'cobrador') {
        navigate('/login');
      } else {
        setCollectorName(user.usuario);
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
    { text: 'Registrar Cobro', path: 'collection', icon: <AccountBalanceWallet /> },
    { text: 'Lista de Morosos', path: 'debtors', icon: <ReportProblem /> },
    { text: 'Próximos Vencimientos', path: 'due', icon: <EventNote /> },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#062f4f', color: '#fff' }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5, background: 'linear-gradient(to right, #051e3e, #062f4f)' }}>
        <Avatar sx={{ bgcolor: '#00b159', width: 40, height: 40 }}>C</Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#fff', lineHeight: 1.2 }}>
            Préstamos Ya
          </Typography>
          <Typography variant="caption" sx={{ color: '#00b159', fontWeight: 600 }}>
            COBRADOR
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      
      {/* Navegación */}
      <List sx={{ px: 2, py: 3, flexGrow: 1 }}>
        {menuItems.map((item) => {
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
                  bgcolor: isActive ? 'rgba(0, 177, 89, 0.15)' : 'transparent',
                  color: isActive ? '#00ff80' : '#b0c4de',
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
                    color: isActive ? '#00b159' : '#8fa9c4',
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
            color: '#ff4d4d',
            '&:hover': {
              bgcolor: 'rgba(255, 77, 77, 0.08)',
            },
            transition: 'all 0.2s',
          }}
        >
          <ListItemIcon sx={{ color: '#ff4d4d', minWidth: 40 }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: '600' }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f9' }}>
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
            {location.pathname.includes('collection') ? 'Registro de Recaudación' : 
             location.pathname.includes('debtors') ? 'Lista de Deudores Morosos' : 
             location.pathname.includes('due') ? 'Próximos Vencimientos' : 'Panel de Cobranza'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
            <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1e293b', lineHeight: 1 }}>
                {collectorName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cobrador Autorizado
              </Typography>
            </Box>
            <Tooltip title="Perfil">
              <Avatar sx={{ bgcolor: '#00b159', width: 40, height: 40 }}>
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
            <Route path="collection" element={<CollectionPage />} />
            <Route path="debtors" element={<DebtorsPage />} />
            <Route path="due" element={<DueLoansPage />} />
            <Route path="" element={<Navigate to="collection" replace />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
};

export default CollectorPanel;
