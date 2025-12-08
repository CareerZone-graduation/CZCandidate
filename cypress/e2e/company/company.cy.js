describe('Company Page', () => {
    const companyId = 'comp1';

    beforeEach(() => {
        cy.intercept('GET', `**/api/companies/${companyId}`, {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    _id: companyId,
                    name: 'Awesome Company',
                    about: 'We are awesome.',
                    industry: 'Tech',
                    website: 'https://example.com'
                }
            }
        }).as('getCompany');

        cy.intercept('GET', `**/api/companies/${companyId}/jobs*`, {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    { _id: 'j1', title: 'React Dev', type: 'FULL_TIME', location: { province: 'HCM' } }
                ],
                meta: { total: 1 }
            }
        }).as('getCompanyJobs');

        cy.visit(`/company/${companyId}`);
    });

    it('should display company details', () => {
        cy.wait(['@getCompany', '@getCompanyJobs']);
        cy.contains('Giới thiệu công ty').should('be.visible');
        cy.contains('Awesome Company').should('be.visible');
        cy.contains('We are awesome').should('be.visible');
    });

    it('should list company jobs', () => {
        cy.wait('@getCompanyJobs');
        cy.contains('React Dev').should('be.visible');
    });
});
