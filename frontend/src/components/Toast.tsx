import React, { useEffect } from 'react';
import { Snackbar, Alert, AlertProps } from '@mui/material';

interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertProps['severity'];
  onClose?: () => void;
  autoHideDuration?: number;
}

const Toast: React.FC<ToastProps> = ({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 4000
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbar-root': {
          zIndex: 9999
        }
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{
          minWidth: 300,
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
          borderRadius: 2,
          '& .MuiAlert-icon': {
            fontSize: 24
          }
        }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
