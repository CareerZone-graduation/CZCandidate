export const shouldShowConversationLoading = ({
  isOpen,
  initialConversationId,
  initialRecipientId,
  selectedConversation,
  connectionStatus,
  isInitializingConversation,
}) => {
  if (!isOpen || selectedConversation) return false;

  if (isInitializingConversation) return true;

  if (!initialConversationId && !initialRecipientId) return false;

  return connectionStatus === 'connecting' || connectionStatus === 'connected';
};
