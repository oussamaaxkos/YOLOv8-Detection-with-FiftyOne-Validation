import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function palette(i) {
  const colors = ['#2E7D32', '#1565C0', '#6A1B9A', '#C62828', '#EF6C00', '#00838F'];
  return colors[i % colors.length];
}

export default function ImageWithBoxes({ imageUrl, predictions }) {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const boxes = useMemo(() => (Array.isArray(predictions) ? predictions : []), [predictions]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (!imageUrl) return;

    const onLoad = () => {
      setNatural({ w: img.naturalWidth || 0, h: img.naturalHeight || 0 });
    };

    img.addEventListener('load', onLoad);
    return () => img.removeEventListener('load', onLoad);
  }, [imageUrl]);

  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    // Match the canvas to the rendered image size (not natural).
    const rect = img.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    if (!boxes.length || !natural.w || !natural.h) return;

    const sx = w / natural.w;
    const sy = h / natural.h;

    ctx.lineWidth = 2;
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.textBaseline = 'top';

    boxes.forEach((p, i) => {
      const bbox = Array.isArray(p?.bbox) ? p.bbox : null;
      if (!bbox || bbox.length !== 4) return;

      const [x1, y1, x2, y2] = bbox;

      const rx1 = clamp(x1 * sx, 0, w);
      const ry1 = clamp(y1 * sy, 0, h);
      const rx2 = clamp(x2 * sx, 0, w);
      const ry2 = clamp(y2 * sy, 0, h);

      const color = palette(i);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      const bw = Math.max(1, rx2 - rx1);
      const bh = Math.max(1, ry2 - ry1);
      ctx.strokeRect(rx1, ry1, bw, bh);

      const label = `cls ${p?.class ?? '-'} ${(typeof p?.confidence === 'number' ? (p.confidence * 100).toFixed(0) + '%' : '')}`;
      const pad = 4;
      const textW = ctx.measureText(label).width;
      const textH = 14;

      ctx.globalAlpha = 0.9;
      ctx.fillRect(rx1, Math.max(0, ry1 - textH - pad), textW + pad * 2, textH + pad);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.fillText(label, rx1 + pad, Math.max(0, ry1 - textH - pad) + 2);
    });
  }, [boxes, natural]);

  if (!imageUrl) {
    return (
      <Box sx={{ py: 3 }}>
        <Typography color="text.secondary" variant="body2">
          Select an image to see a preview.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <img
        ref={imgRef}
        src={imageUrl}
        alt="preview"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />
    </Box>
  );
}

