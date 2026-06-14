import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer"
      sx={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#94a3b8',
        py: 3,
        mt: 'auto',
        borderTop: '1px solid rgba(99, 102, 241, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography variant="body2" sx={{ letterSpacing: '0.3px', fontWeight: 500 }}>
            © {new Date().getFullYear()} Nueva Opción. Todos los derechos reservados.
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(148, 163, 184, 0.7)', display: 'block', mt: 0.5, letterSpacing: '0.3px' }}>
            Sistema de Gestión de Préstamos v1.0.0
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
