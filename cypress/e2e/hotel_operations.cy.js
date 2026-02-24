describe('KANEX AI - Smart Hotel Operations', () => {
  beforeEach(() => {
    // Visits your local development server
    cy.visit('http://localhost:5173/login'); 
  });

  it('verifies login and room management access', () => {
    // 1. Perform Login
    cy.get('input[name="email"]').type('krish@gmail.com');
    cy.get('input[name="password"]').type('Krish@123');
    cy.get('button[type="submit"]').click();

    // 2. Ensure we reach the Dashboard
    cy.url().should('include', '/dashboard');

    // 3. Test Navigation to Room Management
    cy.contains('Rooms').click();
    cy.url().should('include', '/rooms');
    cy.contains('Room Management').should('be.visible');

    // 4. Verify Add Room button is visible for Owners
    cy.contains('Add Room').should('exist');
  });
});

it('guest_loyalty.cy.js', function() {});