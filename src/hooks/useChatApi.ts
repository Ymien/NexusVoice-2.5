import { useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { CHAT_CONFIG } from '../constants';

export function useChatApi() {
  const modelProvider = useStore((s) => s.modelProvider);
  const apiKey = useStore((s) => s.apiKey);
  const customApiUrl = useStore((s) => s.customApiUrl);
  const customModelName = useStore((s) => s.customModelName);
  const systemPrompt = useStore((s) => s.systemPrompt);
  const messages = useStore((s) => s.messages);
  const addMessage = useStore((s) => s.addMessage);
  const setGenerating = useStore((s) => s.setGenerating);
  const abortController = useStore((s) => s.abortController);
  const setAbortController = useStore((s) => s.setAbortController);

  const settingsRef = useRef({ modelProvider, apiKey, customApiUrl, customModelName, systemPrompt });
  settingsRef.current = { modelProvider, apiKey, customApiUrl, customModelName, systemPrompt };

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const sendMessage = useCallback(async (msgText: string): Promise<string | null> => {
    if (!msgText.trim()) return null;

    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: msgText.trim(),
    });

    const ctrl = new AbortController();
    setAbortController(ctrl);
    setGenerating(true);

    try {
      const settings = settingsRef.current;
      const currentMessages = messagesRef.current;

      const history = currentMessages.slice(-CHAT_CONFIG.MAX_HISTORY).map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content,
      }));

      let sessionId = '';
      if (settings.modelProvider === 'custom' && settings.apiKey) {
        try {
          const sessionRes = await fetch('/api/session/key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: settings.apiKey }),
          });
          const sessionData = await sessionRes.json();
          sessionId = sessionData.session_id || '';
        } catch {
          // Session endpoint unavailable; request will proceed without session-bound key
        }
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText.trim(),
          model_provider: settings.modelProvider,
          api_key: '',
          session_id: sessionId || '',
          api_url: settings.customApiUrl || '',
          custom_model_name: settings.customModelName || '',
          system_prompt: settings.systemPrompt || '',
          history,
        }),
        signal: ctrl.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          (errData as { error?: { message?: string } }).error?.message ||
            `API request failed (status: ${response.status})`
        );
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const replyText = data.reply || 'Sorry, I could not get a valid response.';

      addMessage({
        id: crypto.randomUUID(),
        role: 'ai',
        content: replyText,
      });

      return replyText;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null;
      }
      console.error('Failed to send message:', error);
      const errorMsg =
        error instanceof Error ? `Error: ${error.message}` : 'An unknown error occurred';
      addMessage({
        id: crypto.randomUUID(),
        role: 'ai',
        content: errorMsg,
      });
      return errorMsg;
    } finally {
      setGenerating(false);
      setAbortController(null);
    }
  }, [addMessage, setAbortController, setGenerating]);

  const stopGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setGenerating(false);
      setAbortController(null);
    }
  }, [abortController, setAbortController, setGenerating]);

  return { sendMessage, isGenerating: useStore((s) => s.isGenerating), stopGeneration };
}
