describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  });

  it('Login test', function() {
    describe('Hotel system login', () => {
      it('Admin login test', () => {
        cy.visit('http://localhost:3000')
        cy.get('input[name=email]').type('demo@hotel.com')
        cy.get('input[name=password]').type('123456')
        cy.get('button[type=submit]').click()
        cy.contains('Dashboard')
      })
    })
  });
})