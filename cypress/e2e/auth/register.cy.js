describe('Register Page', () => {
    beforeEach(() => {
        cy.visit('/register')
    })

    it('should show validation error when fields are empty', () => {
        // We removed 'required' attribute, so clicking submit should trigger custom validation
        cy.get('button[type="submit"]').click()
        cy.contains('Vui lòng điền đầy đủ thông tin.').should('exist')
    })

    it('should show error when password is too short', () => {
        cy.get('input[name="fullname"]').type('Test User')
        cy.get('input[name="email"]').type('test@example.com')
        cy.get('input[name="password"]').type('123') // 3 chars < 6
        cy.get('button[type="submit"]').click()

        cy.contains('Mật khẩu phải có ít nhất 6 ký tự.').should('exist')
    })

    it('should show backend error on registration failure', () => {
        cy.intercept('POST', '**/api/auth/register', {
            statusCode: 400,
            body: {
                message: 'Email đã tồn tại.'
            }
        }).as('registerFail')

        cy.get('input[name="fullname"]').type('Test User')
        cy.get('input[name="email"]').type('exists@example.com')
        cy.get('input[name="password"]').type('password123')
        cy.get('button[type="submit"]').click()

        cy.wait('@registerFail')
        cy.contains('Email đã tồn tại.').should('exist')
    })

    it('should redirect to onboarding on successful registration with token', () => {
        cy.intercept('POST', '**/api/auth/register', {
            statusCode: 201,
            body: {
                accessToken: 'fake-jwt-token',
                message: 'Success'
            }
        }).as('registerSuccess')

        cy.get('input[name="fullname"]').type('New User')
        cy.get('input[name="email"]').type('new@example.com')
        cy.get('input[name="password"]').type('password123')
        cy.get('button[type="submit"]').click()

        cy.wait('@registerSuccess')
        cy.contains('Đăng ký thành công!').should('exist')
        // Wait for the timeout redirect with increased timeout
        cy.location('pathname', { timeout: 10000 }).should('eq', '/onboarding')
    })
})
