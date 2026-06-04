import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer"
      sx={{ 
        bgcolor: '#1e293b',
        color: '#94a3b8',
        py: 3,
        mt: 'auto',
        borderTop: '1px solid #334155'
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} Nueva Opción. Todos los derechos reservados.
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
            Sistema de Gestión de Préstamos v1.0.0
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
