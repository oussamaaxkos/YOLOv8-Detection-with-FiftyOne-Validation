import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { getClassLabel } from '../lib/classNames.js';

function fmt(x) {
  if (typeof x !== 'number') return '-';
  return x.toFixed(2);
}

export default function PredictionTable({ predictions }) {
  const rows = Array.isArray(predictions) ? predictions : [];

  if (!rows.length) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography color="text.secondary" variant="body2">
          No predictions yet.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Table size="small" aria-label="predictions">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 800 }}>Class</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>Confidence</TableCell>
            <TableCell sx={{ fontWeight: 800 }}>BBox (x1,y1,x2,y2)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((p, idx) => (
            <TableRow key={idx} hover>
              <TableCell>
                {p?.class === undefined || p?.class === null ? '-' : `${getClassLabel(p.class)} (${p.class})`}
              </TableCell>
              <TableCell>{typeof p?.confidence === 'number' ? (p.confidence * 100).toFixed(1) + '%' : '-'}</TableCell>
              <TableCell>
                {Array.isArray(p?.bbox) ? p.bbox.map(fmt).join(', ') : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
