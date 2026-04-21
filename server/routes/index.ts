import { Router } from 'express';

const router = Router();

// Health check
router.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: process.env.COZE_PROJECT_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Session key storage (in-memory, for custom API key flow)
const sessions = new Map<string, string>();

router.post('/api/session/key', (req, res) => {
  const { api_key } = req.body as { api_key?: string };
  if (!api_key) {
    res.status(400).json({ error: 'api_key is required' });
    return;
  }
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, api_key);
  // Auto-cleanup after 10 minutes
  setTimeout(() => sessions.delete(sessionId), 10 * 60 * 1000);
  res.json({ session_id: sessionId });
});

// Chat API - proxies to configured LLM provider
router.post('/api/chat', async (req, res) => {
  const {
    message,
    model_provider,
    session_id,
    api_url,
    custom_model_name,
    system_prompt,
    history,
  } = req.body as {
    message: string;
    model_provider: string;
    session_id?: string;
    api_url?: string;
    custom_model_name?: string;
    system_prompt?: string;
    history?: Array<{ role: string; content: string }>;
  };

  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  // Resolve API key from session
  const resolvedApiKey = session_id ? sessions.get(session_id) || '' : '';

  // Provider URL mapping
  const providerUrls: Record<string, { url: string; model: string; key: string }> = {
    deepseek: {
      url: 'https://api.deepseek.com/v1/chat/completions',
      model: 'deepseek-chat',
      key: resolvedApiKey || process.env.DEEPSEEK_API_KEY || '',
    },
    doubao: {
      url: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      model: 'doubao-1-5-pro-32k-250115',
      key: resolvedApiKey || process.env.DOUBAO_API_KEY || '',
    },
    glm: {
      url: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      model: 'glm-4-flash',
      key: resolvedApiKey || process.env.GLM_API_KEY || '',
    },
    custom: {
      url: api_url || '',
      model: custom_model_name || 'gpt-4o',
      key: resolvedApiKey || '',
    },
  };

  const provider = providerUrls[model_provider] || providerUrls.deepseek;

  if (!provider.url) {
    res.status(400).json({ error: 'API URL is required for custom provider' });
    return;
  }

  if (!provider.key) {
    res.status(400).json({ error: 'API key is required. Please configure in settings.' });
    return;
  }

  const messages = [
    ...(system_prompt ? [{ role: 'system' as const, content: system_prompt }] : []),
    ...(history || []),
    { role: 'user' as const, content: message },
  ];

  try {
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.key}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      console.error(`LLM API error (${response.status}):`, errText);
      res.status(response.status).json({ error: `LLM API error: ${response.status}` });
      return;
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = data.choices?.[0]?.message?.content || 'No response from model.';

    res.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to get response from LLM provider' });
  }
});

export default router;
