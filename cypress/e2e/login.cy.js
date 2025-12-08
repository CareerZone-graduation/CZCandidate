describe('Login Page', () => {
    beforeEach(() => {
        // Visit login page before each test
        cy.visit('/login')
    })

    it('should show validation error when fields are empty', () => {
        // Clear the default values if any
        cy.get('input[type="email"]').clear()
        cy.get('input[type="password"]').clear()

        cy.get('button[type="submit"]').click()

        // Check for toast message
        cy.contains('Vui lòng nhập đầy đủ email và mật khẩu.').should('be.visible')
    })

    it('should show error message on invalid credentials', () => {
        // Mock authentication failure
        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 401,
            body: {
                message: 'Email hoặc mật khẩu không đúng.'
            }
        }).as('loginRequest')

        cy.get('input[type="email"]').clear().type('wrong@example.com')
        cy.get('input[type="password"]').clear().type('wrongpassword')

        cy.get('button[type="submit"]').click()

        cy.wait('@loginRequest')

        // Check for error toast
        cy.contains('Email hoặc mật khẩu không đúng.').should('be.visible')
    })

    it('should redirect to home page on successful login', () => {
        // Mock successful login
        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 200,
            body: {
                data: {
                    accessToken: 'fake-jwt-token'
                }
            }
        }).as('loginRequest')

        // Mock user profile fetch (called after login)
        cy.intercept('GET', '**/api/users/me', {
            statusCode: 200,
            body: {
                data: {
                    _id: 'user123',
                    name: 'Test Candidate',
                    email: 'candidate@example.com',
                    role: 'candidate'
                }
            }
        }).as('getMeRequest')

        cy.get('input[type="email"]').clear().type('candidate@example.com')
        cy.get('input[type="password"]').clear().type('password123')

        cy.get('button[type="submit"]').click()

        cy.wait('@loginRequest')
        // Wait for the follow-up request
        cy.wait('@getMeRequest')

        // Assert redirection to home page
        cy.location('pathname').should('eq', '/')
    })
})
