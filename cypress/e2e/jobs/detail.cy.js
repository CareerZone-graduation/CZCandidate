describe('Job Detail Page', () => {
    const jobId = '123';
    const mockJob = {
        _id: jobId,
        title: 'Senior React Developer',
        description: '<p>Great job description</p>',
        requirements: '<p>React, Node</p>',
        benefits: '<p>MacBook Pro</p>',
        company: {
            _id: 'comp1',
            name: 'Tech Giants',
            logo: 'logo.png'
        },
        location: { province: 'Ho Chi Minh' },
        type: 'FULL_TIME',
        experience: 'SENIOR_LEVEL',
        skills: ['React', 'Redux'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
    };

    const mockUser = {
        user: { email: 'test@example.com', coinBalance: 100 },
        profile: {
            fullname: 'Nguyen Van A',
            phone: '0909090909',
            cvs: [
                { _id: 'cv1', name: 'My CV.pdf', path: 'link/to/cv.pdf', isDefault: true }
            ]
        }
    };

    beforeEach(() => {
        // Default intercepts
        cy.intercept('GET', `**/api/jobs/${jobId}`, {
            statusCode: 200,
            body: { success: true, data: mockJob }
        }).as('getJob');

        cy.intercept('GET', `**/api/companies/*/jobs*`, {
            statusCode: 200,
            body: { success: true, data: [] }
        }).as('getRelatedJobs');

        cy.intercept('POST', `**/api/jobs/*/view`, { statusCode: 200, body: {} }).as('saveView');
        cy.intercept('GET', '**/api/jobs/applicant-count', { statusCode: 200, body: { success: true, data: { applicantCount: 5 } } });
    });

    it('should display job details', () => {
        cy.visit(`/jobs/${jobId}`);
        cy.wait('@getJob');
        cy.contains('Senior React Developer').should('be.visible');
        cy.contains('Tech Giants').should('be.visible');
        cy.contains('Great job description').should('be.visible');
    });

    it('should redirect to login when clicking Apply if not logged in', () => {
        cy.visit(`/jobs/${jobId}`);
        cy.wait('@getJob');

        // Ensure logout
        cy.clearLocalStorage();

        // Click button
        cy.contains('button', 'Ứng tuyển ngay').click();

        cy.location('pathname').should('eq', '/login');
    });

    context('Logged In', () => {
        beforeEach(() => {
            // Mock profile fetch
            cy.intercept('GET', '**/api/users/me', {
                statusCode: 200,
                body: { success: true, data: mockUser }
            }).as('getProfile');

            // Mock template CVs
            cy.intercept('GET', '**/api/cvs', { body: { success: true, data: [] } }).as('getTemplates');
        });

        it('should open apply dialog and submit application', () => {
            // Set token via onBeforeLoad
            cy.visit(`/jobs/${jobId}`, {
                onBeforeLoad: (win) => {
                    win.localStorage.setItem('accessToken', 'mock-token');
                }
            });
            cy.wait('@getJob');

            cy.contains('button', 'Ứng tuyển ngay').click();

            // Expect Dialog
            cy.contains('Ứng tuyển vị trí').should('be.visible');
            // Wait for profile request to populate CVs
            cy.wait('@getProfile');

            // Check if CV is present
            cy.contains('My CV.pdf').should('exist');

            // Mock Apply endpoint
            cy.intercept('POST', `**/api/jobs/${jobId}/apply`, {
                statusCode: 200,
                body: { success: true, message: 'Applied successfully' }
            }).as('applyJob');

            // Submit
            cy.contains('button', 'Xác nhận ứng tuyển').should('not.be.disabled').click();

            cy.wait('@applyJob');

            // Check dialog closed
            cy.contains('Ứng tuyển vị trí').should('not.exist');
        });
    });
});
