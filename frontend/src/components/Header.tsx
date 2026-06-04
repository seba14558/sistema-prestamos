import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';

const Header: React.FC = () => {
  return (
    <Box 
      sx={{ 
        bgcolor: '#1e293b',
        borderBottom: '1px solid #334155',
        py: { xs: 1.5, sm: 2 }
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 1.5, sm: 2 } }}>
          <AccountBalance sx={{ color: '#6366f1', fontSize: { xs: 24, sm: 32 } }} />
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'white',
                lineHeight: 1.2,
                fontSize: { xs: '1.1rem', sm: '1.5rem' }
              }}
            >
              NUEVA OPCIÓN
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#94a3b8',
                fontSize: { xs: '0.65rem', sm: '0.75rem' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Sistema de Gestión de Préstamos
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Header;
