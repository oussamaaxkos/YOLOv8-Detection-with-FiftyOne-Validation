import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import dotenv from 'dotenv';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = Number(process.env.PORT || 3001);
const YOLO_API_URL = process.env.YOLO_API_URL || 'http://localhost:5000';

app.disable('x-powered-by');
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: true, credentials: false }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB
  }
});

app.get('/api/health', async (_req, res) => {
  try {
    const upstream = await axios.get(`${YOLO_API_URL}/health`, { timeout: 10_000 });
    res.status(200).json({
      ok: true,
      upstream: upstream.data
    });
  } catch (err) {
    const message = err?.message || 'Unknown error';
    res.status(502).json({ ok: false, error: message });
  }
});

app.post('/api/predict', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided (form field name must be "file")' });
    }

    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname || 'image',
      contentType: req.file.mimetype || 'application/octet-stream'
    });

    const upstream = await axios.post(`${YOLO_API_URL}/predict`, form, {
      headers: {
        ...form.getHeaders()
      },
      timeout: 120_000,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    return res.status(upstream.status).json(upstream.data);
  } catch (err) {
    const status = err?.response?.status || 502;
    const payload = err?.response?.data;
    const message = err?.message || 'Upstream error';

    return res.status(status).json({
      success: false,
      error: payload || message,
      message: 'Prediction failed'
    });
  }
});

// Serve the React build in production (optional).
// In Docker we set CLIENT_DIST to an absolute path like /app/client/dist
const CLIENT_DIST = process.env.CLIENT_DIST || path.join(__dirname, '..', '..', 'client', 'dist');
const CLIENT_INDEX = path.join(CLIENT_DIST, 'index.html');

if (fs.existsSync(CLIENT_INDEX)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (_req, res) => res.sendFile(CLIENT_INDEX));
} else {
  app.get('/', (_req, res) => {
    res.type('text/plain').send(
      'UI server is running. Build the React app first (cd web/client && npm run build) or run the React dev server (cd web/client && npm run dev).'
    );
  });
}

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`UI server listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Proxying YOLO API at ${YOLO_API_URL}`);
});

