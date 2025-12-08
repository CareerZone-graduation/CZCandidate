describe('Job Search Page', () => {

    // Default mock data
    const mockJobs = [
        {
            _id: '1',
            title: 'Frontend Developer',
            company: { name: 'Tech Corp', logo: 'logo.png' },
            salary: { min: 1000, max: 2000, currency: 'USD' },
            location: { city: 'Ho Chi Minh' },
            type: 'FULL_TIME',
            postedAt: new Date().toISOString()
        },
        {
            _id: '2',
            title: 'Backend Engineer',
            company: { name: 'Data Inc', logo: 'logo2.png' },
            salary: { min: 1500, max: 2500, currency: 'USD' },
            location: { city: 'Ha Noi' },
            type: 'FULL_TIME',
            postedAt: new Date().toISOString()
        }
    ];

    beforeEach(() => {
        // Mock the initial load for all tests to ensure page loads cleanly
        cy.intercept('GET', '**/api/jobs/search/hybrid*', {
            statusCode: 200,
            body: {
                success: true,
                data: mockJobs,
                meta: { total: 2, page: 1, size: 10, totalPages: 1 }
            }
        }).as('initialSearch')

        // Mock autocomplete to prevent errors
        cy.intercept('GET', '**/api/jobs/autocomplete/titles*', {
            statusCode: 200,
            body: { success: true, data: [] }
        }).as('autocomplete')

        // Mock search history
        cy.intercept('GET', '**/api/search/history*', {
            statusCode: 200,
            body: { success: true, data: [] }
        }).as('history')

        cy.visit('/jobs/search')
        cy.wait('@initialSearch')
    })

    it('should load initial jobs', () => {
        cy.contains('Frontend Developer').should('be.visible')
        cy.contains('Backend Engineer').should('be.visible')
    })

    it('should search by keyword', () => {
        // Overlay the intercept for the strict search query
        cy.intercept('GET', '**/api/jobs/search/hybrid*query=Frontend*', {
            statusCode: 200,
            body: {
                success: true,
                data: [mockJobs[0]],
                meta: { total: 1, page: 1, size: 10, totalPages: 1 }
            }
        }).as('searchRequest')

        cy.get('input[placeholder*="Tìm kiếm"]').should('be.visible').clear().type('Frontend')
        // Click search button instead of enter, to be sure
        cy.contains('button', 'Tìm kiếm').click()

        cy.wait('@searchRequest')
        cy.contains('Frontend Developer').should('be.visible')
        // Backend Engineer should NOT be visible if we mocked filtering correctly, 
        // BUT wait, if the filtered result is just mockJobs[0], then yes.
        // Ensure "Backend Engineer" is gone.
        // We need to wait for the UI to update.
        cy.contains('Backend Engineer').should('not.exist')
    })

    it('should handle pagination', () => {
        // Redefine intercept to return many items for page 1
        // We use a specific route matcher to override the generic one
        cy.intercept('GET', '**/api/jobs/search/hybrid*page=1*', {
            statusCode: 200,
            body: {
                success: true,
                data: mockJobs,
                meta: { total: 20, page: 1, size: 10, totalPages: 2 }
            }
        }).as('page1')

        // Reload to get this new mock data
        cy.visit('/jobs/search')
        cy.wait('@page1')

        // Mock page 2 request
        cy.intercept('GET', '**/api/jobs/search/hybrid*page=2*', {
            statusCode: 200,
            body: {
                success: true,
                data: [],
                meta: { total: 20, page: 2, size: 10, totalPages: 2 }
            }
        }).as('page2')

        // Find pagination button for page 2
        // Try multiple selectors as fallback
        cy.get('body').then(($body) => {
            if ($body.find('button[aria-label="Go to next page"]').length > 0) {
                cy.get('button[aria-label="Go to next page"]').click()
            } else {
                // Try finding "2" in pagination
                cy.contains('button', '2').click()
            }
        })

        cy.wait('@page2')
    })

    it('should filter by parameters', () => {
        cy.intercept('GET', '**/api/jobs/search/hybrid*province=Ho+Chi+Minh*', {
            statusCode: 200,
            body: {
                success: true,
                data: [mockJobs[0]],
                meta: { total: 1, page: 1, size: 10, totalPages: 1 }
            }
        }).as('filterRequest')

        // Simulate URL visit with params directly 
        cy.visit('/jobs/search?province=Ho+Chi+Minh')

        cy.wait('@filterRequest')
        cy.contains('Frontend Developer').should('be.visible')
    })
})
