describe('Smoke Test - Main User Flows', () => {

    const mockUser = {
        success: true,
        data: {
            user: { _id: 'u1', email: 'test@example.com' },
            profile: { fullname: 'Smoke Tester', avatar: 'https://via.placeholder.com/150' }
        }
    };

    beforeEach(() => {
        // Auth
        cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: mockUser }).as('getUser');

        // Notifications
        cy.intercept('GET', '**/notifications*', {
            statusCode: 200,
            body: { success: true, data: [], meta: { page: 1, limit: 10, total: 0, pages: 0 } }
        }).as('getNotif');

        // Set Token
        cy.visit('/', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('accessToken', 'mock-token');
            }
        });
    });

    it('should navigate from Home to Jobs to Detail', () => {
        // Home
        cy.contains('Smoke Tester').should('visible'); // Header check

        // Mock Jobs Search
        cy.intercept('GET', '**/api/jobs*', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { _id: 'j1', title: 'React Developer', company: { name: 'Tech Corp', logo: 'logo.png' }, salary: { min: 1000, max: 2000, currency: 'USD' }, cities: ['Hanoi'] }
                ],
                meta: { totalItems: 1 }
            }
        }).as('getJobs');

        // Navigate to Jobs
        cy.get('a[href="/jobs/search"]').first().click({ force: true });
        cy.wait('@getJobs');
        cy.contains('React Developer').should('be.visible');

        // Mock Job Detail
        cy.intercept('GET', '**/api/jobs/j1', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    _id: 'j1',
                    title: 'React Developer',
                    description: 'Code React',
                    requirements: 'Know React',
                    benefits: 'Good pay',
                    company: { _id: 'c1', name: 'Tech Corp', logo: 'logo.png' },
                    salary: { min: 1000, max: 2000, currency: 'USD' },
                    cities: ['Hanoi'],
                    deadline: new Date(Date.now() + 86400000).toISOString()
                }
            }
        }).as('getJobDetail');

        // Mock Related Jobs (often called in Detail)
        cy.intercept('GET', '**/api/jobs/j1/related*', {
            statusCode: 200, body: { success: true, data: [] }
        });

        // Click Job
        cy.contains('React Developer').click();
        // Determine if it opens modal or page. Assuming Page from routes: /jobs/:id
        // Test might need adjustment if it's a list item click behavior.
        // Usually clicking title opens detail.

        cy.wait('@getJobDetail');
        cy.contains('Tech Corp').should('be.visible');
        cy.contains('Code React').should('be.visible');
    });

    it('should view profile and cvs', () => {
        // Mock My CVs
        cy.intercept('GET', '**/api/cvs*', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { _id: 'cv1', title: 'My Main CV', template: 'modern' }
                ],
                meta: { totalItems: 1 }
            }
        }).as('getCVs');

        // Visit Profile or CVs
        cy.visit('/my-cvs');
        cy.wait('@getCVs');
        cy.contains('My Main CV').should('be.visible');
    });
});
