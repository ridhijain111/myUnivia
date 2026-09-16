import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  RefreshCw,
  HelpCircle,
  BookOpen,
  Compass,
  Zap,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface AiNovaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  initialQuery?: string;
}

const SUGGESTED_QUESTIONS = [
  'What are the premier student societies on campus?',
  'How do I study for Probability & Statistics (BAS-103)?',
  'Tips for balancing college lectures with hackathons?',
  'Where can I find open scholarships and summer programs?',
];

function formatNovaContent(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    if (line.startsWith('### ')) {
      return (
        <h4 key={lineIdx} className="font-extrabold text-sm sm:text-base text-[#7033F5] dark:text-[#A78BFA] mt-2 mb-1">
          {line.replace('### ', '')}
        </h4>
      );
    }
    if (line.startsWith('## ') || line.startsWith('# ')) {
      return (
        <h3 key={lineIdx} className="font-extrabold text-base text-[#5B21B6] dark:text-[#C4B5FD] mt-3 mb-1">
          {line.replace(/^#+\s*/, '')}
        </h3>
      );
    }
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const itemText = line.trim().replace(/^[\*\-]\s*/, '');
      return (
        <div key={lineIdx} className="flex items-start gap-2 my-1 ml-1 text-xs sm:text-sm">
          <span className="text-[#7033F5] dark:text-[#A78BFA] text-xs mt-0.5">•</span>
          <span className="flex-1">{parseInlineStyles(itemText)}</span>
        </div>
      );
    }
    if (!line.trim()) {
      return <div key={lineIdx} className="h-2" />;
    }
    return (
      <p key={lineIdx} className="my-1 text-xs sm:text-sm leading-relaxed">
        {parseInlineStyles(line)}
      </p>
    );
  });
}

function parseInlineStyles(str: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-bold text-[#1E1B4B] dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono text-[11px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [str];
}

export const AiNovaModal: React.FC<AiNovaModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content:
        'Hi there! I am **AI Nova**, your Univia campus intelligence companion powered by Gemini. Ask me anything about courses, university societies, timetable strategy, exam preparation, or finding campus events and resources.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialQuery && isOpen) {
      setInput(initialQuery);
    }
  }, [initialQuery, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for context (exclude initial welcome greeting so Gemini conversation starts cleanly with user)
      const conversationHistory = messages
        .filter((m) => m.id !== 'welcome-1')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/nova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversation: conversationHistory,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const replyText =
        data?.reply ||
        "I'm here to help! Could you please clarify your campus question?";

      const aiMsg: Message = {
        id: `nova-${Date.now()}`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'model',
        content:
          'I ran into a temporary connection hitch. Please verify your connection or try asking again!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      id="ai-nova-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#131926] border border-[#E9E1F5] dark:border-[#243047] rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[720px] overflow-hidden transition-all text-[#211B33] dark:text-[#F8FAFC]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#7033F5] via-[#824CF6] to-[#935FF8] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xs border border-white/30 text-amber-200">
              <Sparkles className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  AI Nova Campus Assistant
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/25 text-white border border-white/30">
                  Gemini 3.1 Flash
                </span>
              </div>
              <p className="text-xs text-purple-100">
                Your 24/7 intelligent guide for university life &amp; academics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome-reset',
                    role: 'model',
                    content:
                      'Chat reset! Ask me anything about college courses, syllabus, societies, or timetable.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              title="Reset Conversation"
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors text-xs font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close AI Nova"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="px-4 py-2.5 bg-[#FAF8FE] dark:bg-[#0E1420] border-b border-[#EDE7F5] dark:border-[#222D40] flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] font-bold text-[#7033F5] shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Quick:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-[#1A2234] hover:bg-[#F1EAFB] dark:hover:bg-[#25324C] text-[#554A6E] dark:text-[#CBD5E1] border border-[#E5DBF5] dark:border-[#2A3952] whitespace-nowrap transition-all font-medium shrink-0 cursor-pointer shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#FCFBFE] dark:bg-[#0D121F]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-[#7033F5] text-white'
                    : 'bg-[#F2EDFB] text-[#7033F5] dark:bg-[#251A40] dark:text-[#CBB3F2] border border-[#E4D5F8] dark:border-[#3D2C62]'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#7033F5] text-white rounded-tr-xs shadow-xs'
                    : 'bg-white dark:bg-[#161F30] text-[#211B33] dark:text-[#F8FAFC] border border-[#EDE7F5] dark:border-[#28364D] rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="font-normal leading-relaxed">
                  {msg.role === 'model' ? formatNovaContent(msg.content) : msg.content}
                </div>
                <div
                  className={`text-[10px] mt-1.5 text-right font-medium ${
                    msg.role === 'user'
                      ? 'text-purple-200'
                      : 'text-[#8A819C] dark:text-[#94A3B8]'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 mr-auto text-xs text-[#7033F5] bg-white dark:bg-[#161F30] p-3 rounded-2xl border border-[#EDE7F5] dark:border-[#28364D] shadow-2xs">
              <RefreshCw className="w-4 h-4 animate-spin text-[#7033F5]" />
              <span className="font-semibold">AI Nova is analyzing with Gemini...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#131926] border-t border-[#EDE7F5] dark:border-[#222D40] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI Nova a campus question... (e.g. syllabus tips, societies, timetable advice)"
                rows={2}
                className="w-full p-3 pr-10 text-xs sm:text-sm rounded-xl border border-[#DDD3ED] dark:border-[#2B3950] bg-[#FAF8FE] dark:bg-[#0E1420] text-[#211B33] dark:text-[#F8FAFC] focus:outline-none focus:border-[#7033F5] resize-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-11 px-4 rounded-xl bg-[#7033F5] hover:bg-[#5E22E2] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#7033F5]/20 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Nova</span>
            </button>
          </form>
          <p className="text-[10px] text-center text-[#8C849E] dark:text-[#717E94] mt-2">
            AI Nova provides academic &amp; campus recommendations. Verify official dates on your college portal.
          </p>
        </div>
      </div>
    </div>
  );
};
