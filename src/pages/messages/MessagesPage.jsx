import { useState } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

/**
 * MessagesPage Component
 * Full-page view for the chat interface
 */
const MessagesPage = () => {
  return (
    <div className="container mx-auto py-6 h-[calc(100vh-4rem)]">
      <ChatInterface 
        isOpen={true} 
        onClose={() => {
          // Navigate back or close
          window.history.back();
        }}
      />
    </div>
  );
};

export default MessagesPage;
