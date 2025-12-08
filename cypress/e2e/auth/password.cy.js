describe('Password Reset Flow', () => {

    it('should show error for invalid email', () => {
        cy.visit('/forgot-password');
        cy.get('input#email').type('invalid-email');
        cy.contains('button', 'Gửi liên kết').click();
        cy.contains('Email không hợp lệ').should('be.visible');
    });

    it('should simulate sending reset link', () => {
        cy.visit('/forgot-password');

        cy.intercept('POST', '**/api/auth/forgot-password', {
            statusCode: 200,
            body: { success: true, message: 'Email sent' }
        }).as('forgotPassword');

        cy.get('input#email').type('test@example.com');
        cy.contains('button', 'Gửi liên kết').click();

        cy.wait('@forgotPassword');
        cy.contains('Email đã được gửi').should('be.visible');
    });

    it('should reset password with valid token', () => {
        const token = 'valid-token-123';
        cy.visit(`/reset-password?token=${token}`);

        // Mock reset API
        cy.intercept('POST', '**/api/auth/reset-password', {
            statusCode: 200,
            body: { success: true, message: 'Password updated' }
        }).as('resetPassword');

        // Input new password
        cy.get('input#password').type('NewPassword123!');
        cy.get('input#confirmPassword').type('NewPassword123!');

        cy.contains('button', 'Đặt lại mật khẩu').click();

        cy.wait('@resetPassword');
        cy.contains('Đặt lại mật khẩu thành công').should('be.visible');
    });

    it('should show error for invalid token', () => {
        // Missing token param
        cy.visit('/reset-password');
        cy.contains('Liên kết không hợp lệ').should('be.visible');
    });
});
