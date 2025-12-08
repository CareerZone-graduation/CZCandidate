describe('Profile Page', () => {
    const mockProfile = {
        _id: 'user123',
        fullname: 'Nguyen Van A',
        phone: '0909090909',
        bio: 'Frontend Developer',
        avatar: 'avatar.png',
        createdAt: new Date().toISOString(),
        experiences: [
            {
                _id: 'exp1',
                company: 'Tech Corp',
                position: 'Developer',
                startDate: '2020-01-01',
                endDate: '2021-01-01',
                description: 'Coding'
            }
        ],
        educations: [],
        skills: [{ _id: 's1', name: 'React' }],
        cvs: []
    };

    const mockUser = {
        user: { email: 'test@example.com' },
        profile: mockProfile
    };

    beforeEach(() => {
        // Authenticate
        cy.visit('/profile', {
            onBeforeLoad: (win) => {
                win.localStorage.setItem('accessToken', 'mock-token');
            }
        });

        // Mock profile fetch
        cy.intercept('GET', '**/api/candidate/my-profile', {
            statusCode: 200,
            body: { success: true, data: mockProfile }
        }).as('getProfile');

        // Mock user fetch (Redux might call this too)
        cy.intercept('GET', '**/api/users/me', {
            statusCode: 200,
            body: { success: true, data: mockUser }
        }).as('getUser');

        // Mock update profile
        cy.intercept('PUT', '**/api/candidate/my-profile', {
            statusCode: 200,
            body: { success: true, message: 'Updated successfully' }
        }).as('updateProfile');

        cy.wait('@getProfile');
    });

    it('should display profile information', () => {
        cy.contains('Nguyen Van A').should('be.visible');
        cy.contains('0909090909').should('be.visible');
        cy.contains('Frontend Developer').should('be.visible');
        cy.contains('Tech Corp').should('be.visible');
        cy.contains('React').should('be.visible');
    });

    it('should edit basic information', () => {
        // Click Edit button
        cy.contains('button', 'Chỉnh sửa').click();

        // Wait for dialog content to be visible
        cy.contains('Chỉnh sửa hồ sơ').should('be.visible');

        // Wait for animation or whatever
        cy.wait(500);

        // Inputs
        cy.get('input#fullname').should('exist').clear({ force: true }).type('Nguyen Van B', { force: true });
        cy.get('input#phone').should('exist').clear({ force: true }).type('0808080808', { force: true });

        // Save
        cy.contains('button', 'Lưu thay đổi').click();

        cy.wait('@updateProfile');
    });
});
