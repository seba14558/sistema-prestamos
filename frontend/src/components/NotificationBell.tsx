import React, { useState, useEffect } from 'react';
import { 
  Badge, IconButton, Menu, MenuItem, Typography, Box, 
  Divider, CircularProgress, Chip, useTheme
} from '@mui/material';
import { Notifications, NotificationsNone } from '@mui/icons-material';
import { 
  getNotificaciones, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} from '../services/api';

interface Notification {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
  cliente_nombre?: string;
  cliente_apellido?: string;
}

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Error al obtener conteo de notificaciones:', err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotificaciones();
      setNotifications(res.data);
    } catch (err) {
      console.error('Error al obtener notificaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, leida: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'vencimiento_prestamo':
        return '⚠️';
      case 'pago_vencido':
        return '🔴';
      case 'nuevo_prestamo':
        return '📋';
      default:
        return '📢';
    }
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{ color: 'inherit' }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Notificaciones
          </Typography>
          {unreadCount > 0 && (
            <Chip 
              label={`${unreadCount} nuevas`} 
              color="primary" 
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ cursor: 'pointer' }}
            />
          )}
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            No tienes notificaciones
          </Box>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                sx={{
                  p: 2,
                  bgcolor: notification.leida ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                  borderBottom: '1px solid #f0f0f0',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Typography sx={{ fontSize: 20 }}>
                      {getNotificationIcon(notification.tipo)}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={notification.leida ? 'normal' : 'bold'}
                        sx={{ mb: 0.5 }}
                      >
                        {notification.titulo}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: 'block', mb: 1 }}
                      >
                        {new Date(notification.fecha_creacion).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {notification.mensaje}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
