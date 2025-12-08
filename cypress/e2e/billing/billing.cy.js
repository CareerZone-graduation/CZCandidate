describe('Billing & Payment', () => {

    beforeEach(() => {
        cy.visit('/dashboard/top-up', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('accessToken', 'mock-token');
            }
        });

        // Mock User Profile
        cy.intercept('GET', '**/api/users/me', {
            statusCode: 200,
            body: { success: true, data: { user: { email: 'test@example.com' }, profile: { fullname: 'Test' } } }
        }).as('getUser');

        // Mock History
        cy.intercept('GET', '**/api/payments/history*', {
            statusCode: 200,
            body: { success: true, data: [] }
        }).as('getHistory');
    });

    it('should display package options', () => {
        cy.contains('Quản lý Xu').should('be.visible');
        cy.contains('100 xu').should('be.visible');
        cy.contains('200 xu').should('be.visible');
        cy.contains('500 xu').should('be.visible');
    });

    it('should calculate total price when selecting a package', () => {
        // Default is popular (200 xu = 20.000) - check Billing.jsx
        cy.contains('20.000 ₫').should('be.visible');

        // Click 500 xu
        cy.contains('500 xu').click();
        cy.contains('50.000 ₫').should('be.visible');

        // Check total payment display
        cy.get('.text-3xl.font-bold').contains('50.000 ₫');
    });

    it('should handle custom amount', () => {
        cy.contains('Tùy chỉnh').click();

        // Input amount
        cy.get('input#custom-amount').type('300');

        // 300 * 100 = 30.000
        cy.get('.text-3xl.font-bold').contains('30.000 ₫');
    });

    it('should initiate payment', () => {
        // Mock API
        cy.intercept('POST', '**/api/payments/create-order', {
            statusCode: 200,
            body: { success: true, data: { paymentUrl: 'http://mock-gateway.com/pay' } }
        }).as('createOrder');

        // Select package
        cy.contains('100 xu').click();

        // Select method (ZaloPay default)
        cy.contains('button', 'Thanh toán với ZALOPAY').click();

        cy.wait('@createOrder').then((interception) => {
            expect(interception.request.body).to.deep.equal({
                coins: 100,
                paymentMethod: 'ZALOPAY'
            });
        });

        // Since window.location.href changes, cypress test might end or we need to stub window.location
        // But for now verifying the API call is good enough.
    });
});
