describe('Evaluations & Interviews', () => {
    beforeEach(() => {
        cy.visit('/interviews', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('accessToken', 'mock-token');
            }
        });

        // Mock user fetch to prevent redirect/logout
        cy.intercept('GET', '**/api/users/me', {
            statusCode: 200,
            body: { success: true, data: { user: { _id: 'u1', email: 'test@example.com' }, profile: { fullname: 'Test User' } } }
        }).as('getUser');

        // Mock interviews
        cy.intercept('GET', '**/interviews/my-scheduled-interviews*', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    {
                        id: 'int1',
                        status: 'SCHEDULED',
                        scheduledTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                        application: {
                            jobSnapshot: { title: 'Frontend Dev', company: 'Google' }
                        },
                        roomName: 'Room 1'
                    }
                ]
            }
        }).as('getInterviews');
    });

    it('should list interviews', () => {
        cy.wait('@getInterviews');
        cy.contains('Frontend Dev').should('be.visible');
        cy.contains('Google').should('be.visible');
        cy.contains('Đã lên lịch').should('be.visible');
    });

    it('should navigate to device test', () => {
        cy.contains('button', 'Kiểm tra thiết bị').click();
        cy.location('pathname').should('eq', '/interviews/device-test');
    });
});
