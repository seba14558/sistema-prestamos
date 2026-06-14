import React from 'react';
import { Box, Typography, Container, IconButton } from '@mui/material';
import { MonetizationOn, Menu as MenuIcon } from '@mui/icons-material';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton = false }) => {
  return (
    <Box 
      sx={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
        py: { xs: 3.5, sm: 2 },
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: showMenuButton ? 'space-between' : 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <Box 
              sx={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                borderRadius: '12px',
                p: 1.5,
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(99, 102, 241, 0.4)',
                }
              }}
            >
              <MonetizationOn sx={{ color: 'white', fontSize: { xs: 24, sm: 32 } }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 800, 
                  color: 'white',
                  lineHeight: 1.2,
                  fontSize: { xs: '1.5rem', sm: '1.5rem' },
                  letterSpacing: '0.5px',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                }}
              >
                NUEVA OPCIÓN
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#94a3b8',
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  display: { xs: 'none', sm: 'block' },
                  letterSpacing: '0.3px',
                  fontWeight: 500
                }}
              >
                Sistema de Gestión de Préstamos
              </Typography>
            </Box>
          </Box>

          {showMenuButton && onMenuClick && (
            <IconButton
              onClick={onMenuClick}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease',
                p: { xs: 1.5, sm: 1 },
                '&:hover': {
                  color: 'white',
                  transform: 'scale(1.1)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%'
                }
              }}
            >
              <MenuIcon sx={{ fontSize: { xs: 28, sm: 24 } }} />
            </IconButton>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Header;
