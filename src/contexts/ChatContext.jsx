import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatConfig, setChatConfig] = useState({
    conversationId: null,
    recipientId: null,
    jobId: null,
    companyName: null
  });

  const openChat = (config = {}) => {
    setChatConfig({
      conversationId: config.conversationId || null,
      recipientId: config.recipientId || null,
      jobId: config.jobId || null,
      companyName: config.companyName || null
    });
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    // Reset config after animation
    setTimeout(() => {
      setChatConfig({
        conversationId: null,
        recipientId: null,
        jobId: null,
        companyName: null
      });
    }, 300);
  };

  return (
    <ChatContext.Provider value={{ isChatOpen, chatConfig, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
