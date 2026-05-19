import { describe, expect, it } from 'vitest';
import { shouldShowConversationLoading } from '../chatInterfaceState';

describe('shouldShowConversationLoading', () => {
  it('shows loading while opening an initial recipient conversation', () => {
    expect(shouldShowConversationLoading({
      isOpen: true,
      initialConversationId: null,
      initialRecipientId: 'recruiter-1',
      selectedConversation: null,
      connectionStatus: 'connected',
      isInitializingConversation: true,
    })).toBe(true);
  });

  it('shows loading before an initial recipient conversation can start creating', () => {
    expect(shouldShowConversationLoading({
      isOpen: true,
      initialConversationId: null,
      initialRecipientId: 'recruiter-1',
      selectedConversation: null,
      connectionStatus: 'connecting',
      isInitializingConversation: false,
    })).toBe(true);
  });

  it('does not show loading after a conversation is selected', () => {
    expect(shouldShowConversationLoading({
      isOpen: true,
      initialConversationId: null,
      initialRecipientId: 'recruiter-1',
      selectedConversation: { _id: 'conversation-1' },
      connectionStatus: 'connected',
      isInitializingConversation: true,
    })).toBe(false);
  });

  it('does not replace the normal empty state when no initial target exists', () => {
    expect(shouldShowConversationLoading({
      isOpen: true,
      initialConversationId: null,
      initialRecipientId: null,
      selectedConversation: null,
      connectionStatus: 'connected',
      isInitializingConversation: false,
    })).toBe(false);
  });
});
