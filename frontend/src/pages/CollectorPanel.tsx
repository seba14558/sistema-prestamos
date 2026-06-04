import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  Box, AppBar, Toolbar, Drawer, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Typography, IconButton, Divider, 
  useTheme, useMediaQuery, Avatar
} from '@mui/material';
import { 
  Menu as MenuIcon, AccessTime as AccessTimeIcon, 
  Warning as WarningIcon, CalendarToday as CalendarTodayIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import CollectionPage from './collector/CollectionPage';
import DebtorsPage from './collector/DebtorsPage';
import DueLoansPage from './collector/DueLoansPage';
import NotificationBell from '../components/NotificationBell';

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
    { text: 'Registro de Cobros', path: 'collection', icon: <AccessTimeIcon /> },
    { text: 'Deudores Morosos', path: 'debtors', icon: <WarningIcon /> },
    { text: 'Próximos Vencimientos', path: 'due', icon: <CalendarTodayIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#062f4f', color: 'white' }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, bgcolor: 'linear-gradient(90deg, #051e3e 0%, #062f4f 100%)' }}>
        <Avatar sx={{ bgcolor: '#00b159', width: 40, height: 40, fontWeight: 'bold' }}>C</Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" color="white" sx={{ lineHeight: 1.2 }}>
            NUEVA OPCIÓN
          </Typography>
          <Typography variant="caption" color="#00b159" fontWeight="bold" sx={{ display: 'block' }}>
            COBRADOR
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      
      {/* Navegación */}
      <List sx={{ px: 1, py: 2, flex: 1 }}>
        {menuItems.map((item) => {
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
                    bgcolor: 'rgba(0, 177, 89, 0.15)',
                    '&:hover': { bgcolor: 'rgba(0, 177, 89, 0.2)' }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.03)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#00b159' : '#8fa9c4' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiTypography-root': { 
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#00ff80' : '#b0c4de'
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
              color: '#ff4d4d',
              '&:hover': { bgcolor: 'rgba(255, 77, 77, 0.08)' }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: '#ff4d4d' }}>
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f9' }}>
      {/* Mobile Sidebar */}
      <Box component="nav" sx={{ width: { md: 256 }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 256 }
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
        <AppBar position="sticky" sx={{ bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' }, color: '#475569' }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, fontWeight: 'bold', color: '#1e293b' }}>
              {location.pathname.includes('collection') ? 'Registro de Recaudación' : 
               location.pathname.includes('debtors') ? 'Lista de Deudores Morosos' : 
               location.pathname.includes('due') ? 'Próximos Vencimientos' : 'Panel de Cobranza'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
              <NotificationBell />
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
                <Typography variant="body2" fontWeight="bold" color="#1e293b">{collectorName}</Typography>
                <Typography variant="caption" color="#64748b">Cobrador Autorizado</Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#00b159', width: 40, height: 40 }}>
                <AccessTimeIcon />
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          <Routes>
            <Route path="collection" element={<CollectionPage />} />
            <Route path="debtors" element={<DebtorsPage />} />
            <Route path="due" element={<DueLoansPage />} />
            <Route path="" element={<Navigate to="collection" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default CollectorPanel;
