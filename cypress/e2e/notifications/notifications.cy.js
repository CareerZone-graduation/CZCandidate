describe('Notifications', () => {

    const mockNotifications = {
        success: true,
        data: [
            { _id: 'n1', title: 'New Application', message: 'You applied to Google', type: 'application', isRead: false, createdAt: new Date().toISOString() },
            { _id: 'n2', title: 'Interview Scheduled', message: 'Google interview', type: 'interview', isRead: true, createdAt: new Date().toISOString() }
        ],
        meta: { page: 1, limit: 10, total: 2, pages: 1 }
    };

    beforeEach(() => {
        cy.visit('/notifications', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('accessToken', 'mock-token');
            }
        });

        cy.intercept('GET', '**/api/users/me', {
            statusCode: 200,
            body: { success: true, data: { user: { email: 'test@example.com' }, profile: { fullname: 'Test' } } }
        }).as('getUser');

        cy.intercept('GET', '**/api/notifications*', {
            statusCode: 200,
            body: mockNotifications
        }).as('getNotifications');

        // Mock mark read
        cy.intercept('PUT', '**/api/notifications/*/read', {
            statusCode: 200,
            body: { success: true }
        }).as('markRead');

        // Mock mark all read
        cy.intercept('PUT', '**/api/notifications/read-all', {
            statusCode: 200,
            body: { success: true }
        }).as('markAllRead');
    });

    it('should list notifications', () => {
        cy.wait('@getNotifications');
        cy.contains('New Application').should('be.visible');
        cy.contains('Interview Scheduled').should('be.visible');
        // Check unread styling (e.g., bg-green-50 or primary color dot)
        cy.contains('New Application').parents('.cursor-pointer').should('have.class', 'bg-green-50');
    });

    it('should mark all as read', () => {
        cy.wait('@getNotifications');
        cy.contains('button', 'Đánh dấu tất cả đã đọc').click();
        cy.wait('@markAllRead');
        cy.contains('Đã đánh dấu tất cả là đã đọc').should('be.visible');
    });
});
