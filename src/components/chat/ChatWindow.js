'use client';

/**
 * ChatWindow Component
 * 
 * Interactive chat interface for document Q&A.
 * Features robust streaming SSE response processing, suggested questions, and error handling.
 */

import { useState, useRef, useEffect, useCallback } from 'react';

export default function ChatWindow({ documentContext, documentFile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load suggested questions when document is provided
  useEffect(() => {
    if (documentFile && suggestedQuestions.length === 0) {
      loadSuggestedQuestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentFile]);

  async function loadSuggestedQuestions() {
    setLoadingSuggestions(true);
    try {
      const formData = new FormData();
      formData.append('file', documentFile);
      formData.append('analysisType', 'suggest-questions');

      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success && data.result?.questions) {
        setSuggestedQuestions(data.result.questions);
      }
    } catch (err) {
      console.warn('Failed to load suggested questions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  const sendMessage = useCallback(
    async (textToSend) => {
      const message = (textToSend || input).trim();
      if (!message || isLoading) return;

      const userMsg = { role: 'user', content: message };
      const currentHistory = messages.filter((m) => m && m.content);

      // Add user message + placeholder for assistant response
      setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
      setInput('');
      setIsLoading(true);

      try {
        let base64Data = null;
        if (documentFile) {
          try {
            base64Data = await fileToBase64(documentFile);
          } catch (e) {
            console.warn('Could not read document file as base64:', e);
          }
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            history: currentHistory.slice(-10), // Send last 10 messages for context
            documentContext: documentContext || '',
            ...(base64Data && {
              fileData: base64Data,
              fileMimeType: documentFile.type,
            }),
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `Server responded with status ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
        let lineBuffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split('\n');
          // Keep the last incomplete fragment in lineBuffer
          lineBuffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === '[DONE]') break;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  assistantContent += parsed.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: assistantContent,
                    };
                    return updated;
                  });
                } else if (parsed.error) {
                  assistantContent = `⚠️ ${parsed.error}`;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // Non-JSON stream chunk fallback
                if (dataStr && !dataStr.startsWith('{')) {
                  assistantContent += dataStr;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: 'assistant',
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              }
            }
          }
        }

        // If response ended completely empty
        if (!assistantContent) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: 'I analyzed your document. Please feel free to ask any specific questions about its terms, risks, or clauses.',
            };
            return updated;
          });
        }
      } catch (err) {
        console.error('Chat processing error:', err);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant' && !last.content) {
            updated[updated.length - 1] = {
              role: 'assistant',
              content: `⚠️ ${err.message || 'I encountered an issue generating a response. Please try again.'}`,
            };
          } else {
            updated.push({
              role: 'assistant',
              content: `⚠️ ${err.message || 'I encountered an issue generating a response. Please try again.'}`,
            });
          }
          return updated;
        });
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [input, isLoading, messages, documentFile, documentContext]
  );

  function handleSubmit(e) {
    e?.preventDefault();
    sendMessage(input);
  }

  function handleSuggestedQuestion(question) {
    sendMessage(question);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="chat-window">
      {/* Messages View */}
      <div className="chat-messages" role="log" aria-label="Chat conversation history">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">💬</div>
            <div className="empty-state__title">Ask me anything about your document</div>
            <div className="empty-state__text">
              I can help you analyze clauses, obligations, rights, termination conditions, liability limits, and more.
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message chat-message--${msg.role === 'user' ? 'user' : 'assistant'}`}
          >
            <div className="chat-message__avatar" aria-hidden="true">
              {msg.role === 'user' ? '👤' : '⚖️'}
            </div>
            <div className="chat-message__content">
              {msg.content ? (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.content}</div>
              ) : (
                <div className="flex items-center gap-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  <span style={{ fontSize: '0.85rem' }}>Analyzing document and drafting answer...</span>
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && messages.length < 4 && (
        <div className="chat-suggestions" aria-label="Suggested questions">
          <div className="chat-suggestions__title">💡 Suggested Questions:</div>
          {suggestedQuestions.slice(0, 4).map((q, i) => (
            <button
              key={i}
              className="chat-suggestion-chip"
              onClick={() => handleSuggestedQuestion(q.question)}
              disabled={isLoading}
              id={`suggestion-${i}`}
            >
              {q.question}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="chat-input-area">
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'AI is thinking...' : 'Ask a question about your document... (Press Enter to send)'}
            rows={1}
            disabled={isLoading}
            aria-label="Type your message"
            id="chat-input"
          />
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            id="chat-send-btn"
          >
            {isLoading ? (
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              '➤'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/**
 * Convert a File object to base64 string.
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      } else {
        resolve('');
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
