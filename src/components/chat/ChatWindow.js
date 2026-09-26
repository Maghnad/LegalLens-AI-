'use client';

/**
 * ChatWindow Component
 * 
 * Interactive chat interface for document Q&A.
 * Supports streaming responses and suggested questions.
 */

import { useState, useRef, useEffect } from 'react';

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
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    // Add user message
    const userMsg = { role: 'user', content: message };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: newMessages.slice(-20), // Last 20 messages for context
          documentContext: documentContext || '',
          // Send file data as base64 if available
          ...(documentFile && {
            fileData: await fileToBase64(documentFile),
            fileMimeType: documentFile.type,
          }),
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      // Handle streaming response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantContent += parsed.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                  return updated;
                });
              }
            } catch {
              // Non-JSON chunk, append as text
              assistantContent += data;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSuggestedQuestion(question) {
    setInput(question);
    // Auto-submit
    const userMsg = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // Trigger the send
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      setInput(question);
      // We'll just set and let user click, or auto-send
    }, 0);
    
    // Better approach: directly call handleSubmit logic
    setInput('');
    sendMessage(question);
  }

  async function sendMessage(message) {
    if (!message || isLoading) return;
    
    const userMsg = { role: 'user', content: message };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: newMessages.slice(-20),
          documentContext: documentContext || '',
          ...(documentFile && {
            fileData: await fileToBase64(documentFile),
            fileMimeType: documentFile.type,
          }),
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantContent += parsed.text;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                  return updated;
                });
              }
            } catch {
              assistantContent += data;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="chat-window">
      {/* Messages */}
      <div className="chat-messages" role="log" aria-label="Chat messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">💬</div>
            <div className="empty-state__title">Ask me anything about your document</div>
            <div className="empty-state__text">
              I can help you understand clauses, obligations, rights, deadlines, and more.
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`chat-message chat-message--${msg.role}`}>
            <div className="chat-message__avatar" aria-hidden="true">
              {msg.role === 'user' ? '👤' : '⚖'}
            </div>
            <div className="chat-message__bubble">
              {msg.content || (
                <div className="typing-indicator">
                  <div className="typing-indicator__dot" />
                  <div className="typing-indicator__dot" />
                  <div className="typing-indicator__dot" />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {suggestedQuestions.length > 0 && messages.length === 0 && (
        <div className="suggested-questions" role="list" aria-label="Suggested questions">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              className="suggested-question"
              onClick={() => handleSuggestedQuestion(q.question)}
              role="listitem"
            >
              {q.question}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your document..."
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
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
