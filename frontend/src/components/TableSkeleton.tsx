import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={1}>
        {/* Header skeleton */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton
              key={`header-${index}`}
              variant="text"
              sx={{
                flex: 1,
                height: 40,
                borderRadius: 1,
                bgcolor: 'rgba(99, 102, 241, 0.1)'
              }}
            />
          ))}
        </Box>
        
        {/* Row skeletons */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Box key={`row-${rowIndex}`} sx={{ display: 'flex', gap: 1, py: 1 }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                variant="rectangular"
                sx={{
                  flex: 1,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: 'rgba(99, 102, 241, 0.05)'
                }}
              />
            ))}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default TableSkeleton;
