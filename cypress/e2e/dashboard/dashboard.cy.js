describe('Dashboard', () => {
    const mockProfile = {
        fullname: 'Test User',
    };

    beforeEach(() => {
        cy.visit('/dashboard', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('accessToken', 'mock-token');
            }
        });

        // Mock User Profile (for welcome message)
        cy.intercept('GET', '**/api/users/me', {
            statusCode: 200,
            body: { success: true, data: { user: { email: 'test@example.com' }, profile: mockProfile } }
        }).as('getUser');

        // Mock Stats
        cy.intercept('GET', '**/api/candidate/saved-jobs*', {
            statusCode: 200,
            body: { success: true, meta: { totalItems: 5 }, data: { meta: { totalItems: 5 } } }
        }).as('getSavedJobs');

        cy.intercept('GET', '**/api/view-history/stats*', {
            statusCode: 200,
            body: { success: true, data: { totalViews: 12 } }
        }).as('getViewHistory');

        cy.intercept('GET', '**/api/applications/my-applications*', {
            statusCode: 200,
            body: { success: true, meta: { totalItems: 3 } }
        }).as('getApplications');

        cy.intercept('GET', '**/api/recommendations*', {
            statusCode: 200,
            body: { success: true, data: { meta: { totalItems: 8 } } }
        }).as('getRecommendations');

        // Mock Completeness
        cy.intercept('GET', '**/api/candidate/profile/completeness*', {
            statusCode: 200,
            body: { success: true, data: { percentage: 80 } }
        }).as('getCompleteness');
    });

    it('should display dashboard stats', () => {
        cy.wait('@getUser');
        // Welcome message
        cy.contains('Chào mừng trở lại, Test User').should('be.visible');

        cy.wait(['@getSavedJobs', '@getViewHistory', '@getApplications', '@getRecommendations']);
        // Stats
        cy.contains('5').should('be.visible'); // Saved jobs
        cy.contains('12').should('be.visible'); // View History
        cy.contains('3').should('be.visible'); // Applications
        cy.contains('8').should('be.visible'); // Recommendations
    });

    it('should navigate to sections', () => {
        // Check Links
        cy.get('a[href="/dashboard/saved-jobs"]').should('exist');
        cy.get('a[href="/dashboard/view-history"]').should('exist');
        cy.get('a[href="/dashboard/applications"]').should('exist');
        cy.get('a[href="/dashboard/job-suggestions"]').should('exist');
    });
});
