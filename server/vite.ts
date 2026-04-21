// ABOUTME: Vite integration for Express server
// ABOUTME: Handles dev middleware and production static file serving

import type { Application, Request, Response } from 'express';
import express from 'express';
import path from 'path';
import fs from 'fs';

const isDev = process.env.COZE_PROJECT_ENV !== 'PROD';

/**
 * 集成 Vite 开发服务器（中间件模式）
 */
async function setupViteMiddleware(app: Application) {
  // Dynamic import to avoid tsx resolution issues with vite internals
  const { createServer: createViteServer } = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;
  const tsconfigPaths = (await import('vite-tsconfig-paths')).default;

  const vite = await createViteServer({
    server: {
      port: 5000,
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: {
        overlay: true,
        path: '/hot/vite-hmr',
        port: 6000,
        clientPort: 443,
        timeout: 30000,
      },
      watch: {
        usePolling: true,
        interval: 100,
      },
      middlewareMode: true,
    },
    plugins: [react(), tsconfigPaths()],
    build: {
      sourcemap: 'hidden',
    },
    appType: 'spa',
  });

  // 使用 Vite middleware
  app.use(vite.middlewares);

  console.log('Vite dev server initialized');
}

/**
 * 设置生产环境静态文件服务
 */
function setupStaticServer(app: Application) {
  const distPath = path.resolve(process.cwd(), 'dist');

  if (!fs.existsSync(distPath)) {
    console.error('dist folder not found. Please run "pnpm build" first.');
    process.exit(1);
  }

  // 1. 服务静态文件
  app.use(express.static(distPath));

  // 2. SPA fallback
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  console.log('Serving static files from dist/');
}

/**
 * 根据环境设置 Vite
 */
export async function setupVite(app: Application) {
  if (isDev) {
    await setupViteMiddleware(app);
  } else {
    setupStaticServer(app);
  }
}
