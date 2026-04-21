// ABOUTME: Express API server
// ABOUTME: Handles API routes and serves static files in production

import express from 'express';
import path from 'path';
import fs from 'fs';
import router from './routes/index';

const isDev = process.env.COZE_PROJECT_ENV !== 'PROD';
const port = parseInt(process.env.PORT || (isDev ? '3001' : '5000'), 10);
const app = express();

// 请求体解析
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for dev proxy
if (isDev) {
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (_req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });
}

// 注册 API 路由
app.use(router);

// 生产环境: 服务静态文件
if (!isDev) {
  const distPath = path.resolve(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    // SPA fallback
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving static files from dist/');
  } else {
    console.error('dist/ folder not found. Run "pnpm build" first.');
  }
}

// 全局错误处理
app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error('Server error:', err);
  const status = 'status' in err ? (err as { status?: number }).status || 500 : 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port} (${isDev ? 'development' : 'production'})`);
});

export { app, server };
