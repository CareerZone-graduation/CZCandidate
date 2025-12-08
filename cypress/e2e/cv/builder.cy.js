describe('CV Builder', () => {

    const mockUser = {
        success: true,
        data: {
            user: { _id: 'u1', email: 'test@example.com' },
            profile: { fullname: 'Tester', cvs: [] }
        }
    };

    const mockCreateResponse = {
        success: true,
        data: { _id: 'cv_new_123' }
    };

    it('should allow guest to create and preview CV but not save', () => {
        cy.visit('/editor/new');

        // Wait for page load
        cy.contains('CV Builder').should('be.visible');

        // Close spotlight if it appears (Search for "Bỏ qua" button)
        cy.get('body').then($body => {
            if ($body.find('button:contains("Bỏ qua")').length > 0) {
                cy.contains('button', 'Bỏ qua').click({ force: true });
            }
        });

        // Sidebar "Dùng dữ liệu mẫu" section
        cy.contains('h3', 'Dùng dữ liệu mẫu').should('exist');

        // Click "Kỹ sư phần mềm" sample button
        cy.contains('button', 'Kỹ sư phần mềm').click({ force: true });

        // Verify preview updates
        cy.wait(1000);

        // Try to save
        cy.contains('button', 'Lưu CV').click({ force: true });

        // Expect error toast
        cy.contains('Vui lòng đăng nhập để lưu CV').should('be.visible');
    });

    it('should allow authenticated user to create and save CV', () => {
        cy.visit('/editor/new', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('accessToken', 'mock-token');
            }
        });

        cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: mockUser }).as('getMe');
        cy.intercept('POST', '**/api/cvs/template', { statusCode: 201, body: mockCreateResponse }).as('createCV');

        cy.contains('CV Builder').should('be.visible');

        // Close spotlight if it appears
        cy.get('body').then($body => {
            if ($body.find('button:contains("Bỏ qua")').length > 0) {
                cy.contains('button', 'Bỏ qua').click({ force: true });
            }
        });

        // Switch to "Thông tin cá nhân" tab
        cy.contains('button', 'Thông tin cá nhân').click({ force: true });

        // Fill form
        cy.get('input[placeholder="John Doe"], input#fullname').should('exist').clear({ force: true }).type('My Name', { force: true });
        cy.get('input[placeholder="john@example.com"], input#email').should('exist').clear({ force: true }).type('my@email.com', { force: true });

        // Save
        cy.contains('button', 'Lưu CV').click({ force: true });

        cy.wait('@createCV');

        // Verify success
        cy.contains('CV của bạn đã được tạo thành công').should('be.visible');

        // Should redirect
        cy.location('pathname').should('include', '/editor/cv_new_123');
    });

    it('should edit existing CV', () => {
        const cvId = 'cv_existing_1';
        const mockCV = {
            _id: cvId,
            title: 'My Existing CV',
            template: 'modern-blue',
            personalInfo: { fullName: 'Existing Name', email: 'old@email.com' },
            sectionOrder: ['personal', 'summary']
        };

        cy.visit(`/editor/${cvId}`, {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('accessToken', 'mock-token');
            }
        });

        cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: mockUser }).as('getMe');
        cy.intercept('GET', `**/api/cvs/${cvId}`, {
            statusCode: 200,
            body: { success: true, data: mockCV }
        }).as('getCV');

        cy.intercept('PUT', `**/api/cvs/${cvId}`, {
            statusCode: 200,
            body: { success: true, data: { ...mockCV, personalInfo: { fullName: 'Updated Name' } } }
        }).as('updateCV');

        cy.wait('@getCV');

        // Check loaded data
        cy.get('input[value="Existing Name"]').should('exist');

        // Edit
        cy.contains('button', 'Thông tin cá nhân').click({ force: true });
        cy.get('input[placeholder="John Doe"], input#fullname').clear().type('Updated Name', { force: true });

        // Save
        cy.contains('button', 'Lưu CV').click({ force: true });

        cy.wait('@updateCV');
        cy.contains('CV của bạn đã được cập nhật').should('be.visible');
    });
});
