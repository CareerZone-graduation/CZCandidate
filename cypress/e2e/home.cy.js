describe('Home Page', () => {
    it('successfully loads', () => {
        cy.visit('/')
        // Adjust this selector based on your actual home page content
        // For now, checking if the body exists is a basic smoke test
        cy.get('body').should('exist')
        // You might want to check for a specific title or header
        // cy.contains('Your App Name').should('be.visible')
    })
})
