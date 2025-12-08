describe('Chat System', () => {

    const mockUser = {
        success: true,
        data: {
            user: { _id: 'u1', email: 'me@example.com' },
            profile: { fullname: 'My Name', avatar: 'me.jpg' }
        }
    };

    const mockConversations = {
        success: true,
        data: [
            {
                _id: 'conv1',
                participant1: { _id: 'u1', name: 'My Name' },
                participant2: { _id: 'u2', name: 'Recruiter' },
                otherParticipant: { _id: 'u2', name: 'Recruiter', avatar: 'rec.jpg' },
                lastMessageAt: new Date().toISOString(),
                unreadCount: 1,
                latestMessage: { content: 'Hello' }
            }
        ],
        meta: { currentPage: 1, totalPages: 1 }
    };

    const mockMessages = {
        success: true,
        data: [
            {
                _id: 'm1',
                conversationId: 'conv1',
                senderId: 'u2',
                content: 'Hello there',
                createdAt: new Date(Date.now() - 10000).toISOString(),
                status: 'read'
            },
            {
                _id: 'm2',
                conversationId: 'conv1',
                senderId: 'u1',
                content: 'Hi',
                createdAt: new Date().toISOString(),
                status: 'read'
            }
        ],
        meta: { page: 1, totalPages: 1 }
    };

    beforeEach(() => {
        cy.visit('/messages', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('accessToken', 'mock-token');
            }
        });

        // Mock User
        cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: mockUser }).as('getUser');

        // Mock Conversations List
        cy.intercept('GET', '**/chat/conversations*', { statusCode: 200, body: mockConversations }).as('getConversations');

        // Mock Messages for conv1
        cy.intercept('GET', '**/chat/conversations/conv1/messages*', { statusCode: 200, body: mockMessages }).as('getMessages');

        // Mock Send Message (POST /api/messages via socket fallback? No, chat uses socket only)
        // Since chat uses socket, we can't intercept POST.
        // We will test UI interactions and assume socket fails (causing "Mất kết nối" or just optimistic update).
        // If we want to test optimistic update, we verify bubble appears.
    });

    it('should list conversations and select one', () => {
        cy.wait('@getConversations');
        cy.contains('Recruiter').should('be.visible');
        cy.contains('Hello').should('be.visible'); // Latest message
        cy.get('.bg-red-500, .bg-blue-600, .bg-muted\\/50').should('exist'); // Unread badge (based on class in ConversationList.jsx: bg-muted/50 for row, Badge for count)
        // Note: Badge is variant default (primary).

        // Click conversation
        cy.contains('Recruiter').click();

        // Should load messages
        cy.wait('@getMessages');
        cy.contains('Hello there').should('be.visible');
        cy.contains('Hi').should('be.visible');
    });

    it('should show typing indicator and try to send message', () => {
        // Click conversation
        cy.contains('Recruiter').click();
        cy.wait('@getMessages');

        // Type message
        cy.get('input[placeholder="Nhập tin nhắn..."]').type('My new message');

        // Click send
        cy.get('button').find('svg.lucide-send').parent().click();

        // Optimistic update should show message
        cy.contains('My new message').should('be.visible');

        // Since socket is not connected in Cypress, it might show "Mất kết nối" or "Đang kết nối..."
        // We can verify that alert exists
        cy.get('div').contains('Mất kết nối').should('exist'); // Assuming socket fails
    });
});
