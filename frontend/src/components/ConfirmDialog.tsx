import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
  Typography
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  severity?: 'warning' | 'error' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  severity = 'warning'
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'error':
        return {
          bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          icon: '#ef4444'
        };
      case 'info':
        return {
          bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          icon: '#3b82f6'
        };
      default:
        return {
          bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          icon: '#f59e0b'
        };
    }
  };

  const severityColors = getSeverityColor();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          border: '1px solid rgba(99, 102, 241, 0.1)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: severityColors.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            <WarningIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>
          <Typography variant="h6" fontWeight="bold" color="#1e293b">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#64748b', fontSize: '1rem', mt: 1 }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          onClick={onCancel}
          sx={{
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            px: 3
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            bgcolor: severityColors.bg,
            '&:hover': {
              bgcolor: severity === 'error' ? '#dc2626' : severity === 'info' ? '#2563eb' : '#d97706'
            }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
