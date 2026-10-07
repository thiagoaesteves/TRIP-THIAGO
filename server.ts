import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { handleApiRequest } from './src/server/apiHandler';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  const portArgIndex = process.argv.indexOf('--port');
  const cliPort = portArgIndex !== -1 ? Number(process.argv[portArgIndex + 1]) : null;
  const PORT = cliPort || 3000;

  const hostArgIndex = process.argv.indexOf('--host');
  const cliHost = hostArgIndex !== -1 ? process.argv[hostArgIndex + 1] : null;
  const HOST = cliHost || '0.0.0.0';

  app.use(express.json());

  // Roteia todas as chamadas de API (/api/*) através do handler centralizado com Duffel
  app.use(async (req, res, next) => {
    if (req.url.startsWith('/api')) {
      await handleApiRequest(req, res, next);
    } else {
      next();
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Servidor do FlyPrice Tracker a rodar em http://${HOST}:${PORT}`);
  });
}

startServer();
