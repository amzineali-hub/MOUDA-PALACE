import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import generateBlogHandler from './api/generate-blog.js';
import analyzeReviewHandler from './api/analyze-review.js';
import translateMenuHandler from './api/translate-menu.js';
import publishContentHandler from './api/publish-content.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Les fonctions dans api/ sont écrites au format Vercel (handler(req, res), req.body déjà
  // parsé) — express.json() reproduit ce comportement pour qu'elles marchent à l'identique ici,
  // sans dupliquer leur logique. Nécessaire pour que ces routes existent aussi en dev local
  // (`npm run dev`) et sur le déploiement Node/Cloud Run (dist/server.cjs), et pas seulement sur
  // Vercel où vercel.json s'en charge.
  app.use('/api/generate-blog', express.json({ limit: '5mb' }));
  app.use('/api/analyze-review', express.json({ limit: '5mb' }));
  app.use('/api/translate-menu', express.json({ limit: '5mb' }));
  app.use('/api/publish-content', express.json({ limit: '5mb' }));
  app.post('/api/generate-blog', generateBlogHandler);
  app.post('/api/analyze-review', analyzeReviewHandler);
  app.post('/api/translate-menu', translateMenuHandler);
  app.post('/api/publish-content', publishContentHandler);

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/proxy-document', async (req, res) => {
    try {
      const url = req.query.url;
      if (!url || typeof url !== 'string') {
        return res.status(400).send('Missing URL parameter');
      }
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).send(`Failed to fetch document: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (contentType) res.setHeader('Content-Type', contentType);
      res.send(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      console.error('Document proxy error:', error);
      res.status(500).send('Failed to proxy document');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
