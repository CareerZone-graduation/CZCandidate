import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { chatWithJobStream, chatWithCompanyStream } from '../../services/knowledgeChat.service';
import { Bot, X, Send, Sparkles, FileText, Loader2, MessageSquareText, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

// ── Typing indicator dots ──
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// ── Single chat bubble ──
function ChatBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`
        group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? 'bg-primary text-primary-foreground rounded-br-md shadow-md shadow-primary/20'
          : 'bg-card border border-border/60 rounded-bl-md shadow-sm'
        }
      `}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-primary tracking-wide uppercase">AI Trợ lý</span>
          </div>
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code: ({ node, inline, className, children, ...props }) => {
                  return inline ? (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                a: ({ node, children, ...props }) => (
                  <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Sources */}
        {message.sources?.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-border/40 space-y-1.5">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Nguồn tham khảo</span>
            {message.sources.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="w-3 h-3 shrink-0 text-primary/60" />
                <span className="truncate">{s.fileName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Welcome state ──
function WelcomeState({ companyName }) {
  const suggestions = [
    'Chính sách làm việc từ xa?',
    'Quy trình tuyển dụng như thế nào?',
    'Chế độ phúc lợi cho nhân viên?',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="flex-1 flex flex-col items-center justify-center px-6 text-center"
    >
      {/* Animated bot icon */}
      <div className="relative mb-5">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center"
        >
          <Bot className="w-8 h-8 text-primary" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary/40"
        />
      </div>

      <h3 className="text-base font-bold text-foreground mb-1.5">
        Trợ lý AI {companyName ? `của ${companyName}` : 'Công ty'}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-[260px]">
        Hỏi bất kỳ điều gì về công ty, công việc, chính sách hoặc phúc lợi.
      </p>

      <div className="space-y-2 w-full max-w-[280px]">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Gợi ý câu hỏi</span>
        {suggestions.map((text, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="w-full text-left text-sm px-3.5 py-2.5 rounded-xl border border-border/60 bg-card hover:bg-accent hover:border-primary/30 transition-all duration-200 text-muted-foreground hover:text-foreground"
            disabled
          >
            {text}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Sidebar Component ──
export default function KnowledgeChatSidebar({ jobId, recruiterId, companyName, isOpen, onClose }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  // Track scroll position for scroll-to-bottom button
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(gap > 120);
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const newMsg = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    // Add placeholder for streaming response
    const assistantMsgIndex = messages.length + 1;
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      let accumulatedContent = '';
      let sources = [];

      const onChunk = (data) => {
        if (data.type === 'content') {
          accumulatedContent += data.content;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[assistantMsgIndex] = {
              role: 'assistant',
              content: accumulatedContent,
              streaming: true
            };
            return newMessages;
          });
        } else if (data.type === 'sources') {
          sources = data.sources;
        } else if (data.type === 'done') {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[assistantMsgIndex] = {
              role: 'assistant',
              content: accumulatedContent,
              sources,
              streaming: false
            };
            return newMessages;
          });
        } else if (data.type === 'error') {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[assistantMsgIndex] = {
              role: 'assistant',
              content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
              streaming: false
            };
            return newMessages;
          });
        }
      };

      if (jobId) {
        await chatWithJobStream(jobId, { message: trimmed, conversationHistory: history }, onChunk);
      } else {
        await chatWithCompanyStream(recruiterId, { message: trimmed, conversationHistory: history }, onChunk);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[assistantMsgIndex] = {
          role: 'assistant',
          content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
          streaming: false
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60]"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-background border-l border-border/50 flex flex-col z-[70] shadow-2xl"
          >
            {/* ── Header ── */}
            <div className="relative flex items-center justify-between px-5 py-4 border-b border-border/50">
              {/* Decorative gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-primary/60 to-transparent" />

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-tight">Trợ lý AI</h3>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {companyName || 'Hỏi về công ty & công việc'}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* ── Message Area ── */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin"
            >
              {messages.length === 0 ? (
                <WelcomeState companyName={companyName} />
              ) : (
                <>
                  {messages.map((m, i) => (
                    <ChatBubble key={i} message={m} />
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-card border border-border/60 rounded-2xl rounded-bl-md shadow-sm">
                        <TypingDots />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Scroll to bottom FAB */}
            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors z-10"
                >
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* ── Input Area ── */}
            <div className="border-t border-border/50 px-4 py-3 bg-background">
              {!isAuthenticated ? (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">Đăng nhập để sử dụng trợ lý AI</p>
                </div>
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập câu hỏi của bạn..."
                      rows={1}
                      className="w-full resize-none rounded-xl border border-border/60 bg-card px-4 py-2.5 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground/60 max-h-[100px] overflow-y-auto"
                      style={{ minHeight: '42px' }}
                      onInput={e => {
                        e.target.style.height = '42px';
                        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="h-[42px] w-[42px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 disabled:opacity-40 disabled:shadow-none shrink-0 transition-all duration-200"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
                Trợ lý AI trả lời dựa trên tài liệu nội bộ. Không đại diện cho ý kiến chính thức.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Floating trigger button (exported separately) ──
export function KnowledgeChatFAB({ onClick, label = 'Hỏi AI' }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.5 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-shadow duration-300"
      id="knowledge-chat-fab"
    >
      <MessageSquareText className="w-5 h-5" />
      <span>{label}</span>
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-background"
      />
    </motion.button>
  );
}