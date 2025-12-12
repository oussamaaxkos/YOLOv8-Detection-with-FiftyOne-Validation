import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ImageWithBoxes from './components/ImageWithBoxes.jsx';
import PredictionTable from './components/PredictionTable.jsx';
import { getClassLabel } from './lib/classNames.js';

function formatPct(x) {
  if (typeof x !== 'number') return '-';
  return `${(x * 100).toFixed(1)}%`;
}

export default function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const summary = useMemo(() => {
    if (!predictions?.length) return null;
    const top = [...predictions].sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0];
    return {
      count: predictions.length,
      top
    };
  }, [predictions]);

  function reset() {
    setFile(null);
    setPredictions([]);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  async function onPickFile(e) {
    const f = e.target.files?.[0] || null;
    if (!f) return;

    if (typeof f.type === 'string' && !f.type.startsWith('image/')) {
      setError('Please select a valid image file (png/jpg).');
      setPredictions([]);
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setPredictions([]);
    setFile(f);
    const nextUrl = URL.createObjectURL(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(nextUrl);
  }

  async function runDetection() {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/predict', {
        method: 'POST',
        body: form
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        const errText =
          typeof data?.error === 'string'
            ? data.error
            : data?.error
              ? JSON.stringify(data.error)
              : 'Prediction failed';
        throw new Error(errText);
      }

      setPredictions(Array.isArray(data.predictions) ? data.predictions : []);
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <CssBaseline />
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            YOLOv8 Detection
          </Typography>
          <Chip size="small" label="React + Node" variant="outlined" />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              Object Detection Interface
            </Typography>
            <Typography color="text.secondary">
              Upload an image, run detection, and review bounding boxes and confidence scores.
            </Typography>
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    1) Choose an image
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    PNG/JPG recommended. Max 15MB.
                  </Typography>
                </Box>

                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Select image
                  <input hidden accept="image/*" type="file" onChange={onPickFile} />
                </Button>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    2) Run detection
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sends the image to the API and returns predictions.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    onClick={runDetection}
                    disabled={!file || loading}
                    variant="contained"
                    color="primary"
                  >
                    {loading ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={18} />
                        <span>Detecting…</span>
                      </Stack>
                    ) : (
                      'Run'
                    )}
                  </Button>
                  <Button
                    onClick={reset}
                    disabled={loading}
                    variant="text"
                    startIcon={<RestartAltIcon />}
                  >
                    Reset
                  </Button>
                </Stack>
              </Stack>

              {error ? (
                <Box sx={{ mt: 2 }}>
                  <Typography color="error" variant="body2">
                    {error}
                  </Typography>
                </Box>
              ) : null}

              {summary ? (
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip label={`${summary.count} detections`} />
                    <Chip
                      variant="outlined"
                      label={`Top: ${getClassLabel(summary.top?.class)} • ${formatPct(summary.top?.confidence)}`}
                    />
                  </Stack>
                </Box>
              ) : null}
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }} />
          </Card>

          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems="stretch">
            <Card variant="outlined" sx={{ flex: 1, minWidth: 320 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Preview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Bounding boxes are drawn on the image based on the predicted coordinates.
                </Typography>

                <ImageWithBoxes imageUrl={previewUrl} predictions={predictions} />
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ flex: 1, minWidth: 320 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Results
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Class labels are mapped from your model metadata.
                </Typography>

                <PredictionTable predictions={predictions} />
              </CardContent>
            </Card>
          </Stack>

          <Box>
            <Typography variant="caption" color="text.secondary">
              API: POST /predict (multipart form-data with field name “file”).
            </Typography>
          </Box>
        </Stack>
      </Container>
    </>
  );
}

