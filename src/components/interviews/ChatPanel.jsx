import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ChatPanel = ({ messages = [], onSendMessage, onClose, currentUserId }) => {
  const [messageText, setMessageText] = useState('');
  const scrollAreaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (messageText.trim()) {
      onSendMessage(messageText.trim());
      setMessageText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl border-l border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
        <h3 className="text-white font-medium tracking-wide">Tin nhắn</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-zinc-500 py-12 flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                <Send className="h-5 w-5 opacity-50" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">Chưa có tin nhắn nào</p>
                <p className="text-xs mt-1 text-zinc-600">Gửi tin nhắn để bắt đầu trò chuyện</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'
                    }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${isOwnMessage
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-zinc-800/80 text-zinc-100 rounded-bl-none border border-white/5'
                      }`}
                  >
                    {!isOwnMessage && message.senderName && (
                      <p className="text-xs font-bold mb-1 text-blue-400">
                        {message.senderName}
                      </p>
                    )}
                    <p className="text-sm break-words leading-relaxed">{message.message}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1.5 px-1">
                    {format(new Date(message.timestamp), 'HH:mm', { locale: vi })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="w-full bg-black/20 border-white/10 text-white placeholder:text-zinc-500 rounded-xl pr-12 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all py-6"
            maxLength={500}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!messageText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:bg-transparent disabled:text-zinc-600 transition-all"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-[10px] text-zinc-600 mt-2 text-right px-1">
          {messageText.length}/500
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;
