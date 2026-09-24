import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleApiRoute, getProductionSecurityHeaders } from './server/api-handler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Apply Production Security Headers across all responses
app.use((req, res, next) => {
  const headers = getProductionSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  next();
});

// Raw body parser / stream delegation for API routes
app.use(async (req, res, next) => {
  if (req.url?.startsWith('/api/')) {
    const handled = await handleApiRoute(req, res);
    if (handled) return;
  }
  next();
});

// Serve static frontend in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🛡️ AegisVerify v1.0.0 Production Server running on port ${PORT}`);
});
