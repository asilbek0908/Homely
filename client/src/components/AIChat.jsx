import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage } from '../services/ai.service';

const ACTION_BUTTONS = {
  book:      { label: '📋 Book a Worker',        path: '/workers' },
  workers:   { label: '🔍 Browse Workers',        path: '/workers' },
  dashboard: { label: '📊 Go to Dashboard',       path: '/customer/dashboard' },
  telegram:  { label: '🔔 Connect Telegram',      path: '/telegram-connect' },
};

const parseActions = (text) => {
  const actions = [];
  const clean = text.replace(/\[ACTION:(\w+)\]/g, (_, key) => {
    if (ACTION_BUTTONS[key]) actions.push(key);
    return '';
  }).trim();
  return { clean, actions };
};

const SUGGESTIONS = [
  'My sink is leaking 🚿',
  'How much does AC repair cost? ❄️',
  'Are workers verified? ✅',
  'How do I cancel a booking?',
];

const AIChat = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Homely Assistant 🏠\nHow can I help you today?", actions: [] },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setShowSuggestions(false);

    const userMsg = { role: 'user', content: msg, actions: [] };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Build history excluding the initial greeting
      const history = messages.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const data = await sendChatMessage(msg, history);
      const { clean, actions } = parseActions(data.reply || '');
      setMessages((prev) => [...prev, { role: 'assistant', content: clean, actions }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again.",
        actions: [],
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-[9998] w-14 h-14 bg-[#1A56DB] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110"
        title="AI Assistant"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 left-6 z-[9998] w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ maxHeight: '520px' }}>

          {/* Header */}
          <div className="bg-[#1A56DB] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🏠</div>
            <div>
              <p className="text-white font-semibold text-sm">Homely Assistant</p>
              <p className="text-blue-200 text-xs">Powered by Gemini AI</p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-blue-200">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'space-y-2'}`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-line leading-snug ${
                    msg.role === 'user'
                      ? 'bg-[#1A56DB] text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.actions?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {msg.actions.map((action) => (
                        <button
                          key={action}
                          onClick={() => { navigate(ACTION_BUTTONS[action].path); setOpen(false); }}
                          className="text-xs bg-[#1A56DB] text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          {ACTION_BUTTONS[action].label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex gap-1.5 overflow-x-auto scrollbar-none">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="flex-shrink-0 text-xs border border-gray-200 text-gray-600 bg-white px-2.5 py-1.5 rounded-full hover:border-[#1A56DB] hover:text-[#1A56DB] transition-colors whitespace-nowrap">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              rows={1}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A56DB] resize-none"
              style={{ maxHeight: '80px' }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-[#1A56DB] text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
