describe('Support Requests', () => {

    beforeEach(() => {
        cy.visit('/support', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('accessToken', 'mock-token');
            }
        });

        // Mock list
        cy.intercept('GET', '**/api/support-requests*', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    items: [
                        { _id: 'sr1', subject: 'Login Issue', status: 'OPEN', category: 'account-issue', createdAt: new Date().toISOString() }
                    ],
                    meta: { totalItems: 1 }
                }
            }
        }).as('getRequests');

        // Mock create
        cy.intercept('POST', '**/api/support-requests*', {
            statusCode: 201,
            body: { success: true, message: 'Created' }
        }).as('createRequest');

        // Mock User (Global check)
        cy.intercept('GET', '**/api/users/me', {
            statusCode: 200,
            body: { success: true, data: { user: { email: 'test@example.com' }, profile: { fullname: 'Test' } } }
        }).as('getUser');
    });

    it('should list support requests', () => {
        cy.wait('@getRequests');
        cy.contains('Login Issue').should('be.visible');
        // cy.contains('account-issue').should('exist'); // Might be localized
    });

    it('should create a support request', () => {
        // Navigate to create page
        cy.contains('Tạo yêu cầu').click();
        cy.location('pathname').should('eq', '/support/new');

        // Fill form
        cy.get('input#subject').type('Cannot login on mobile');
        cy.get('select#category').select('technical-issue');
        cy.get('textarea#description').type('I am unable to login on my iPhone. It says network error even though I have internet.');

        // Submit
        cy.contains('button', 'Gửi yêu cầu').click();

        cy.wait('@createRequest');
        cy.contains('Yêu cầu hỗ trợ đã được gửi thành công').should('be.visible');
        cy.location('pathname').should('eq', '/support');
    });
});
