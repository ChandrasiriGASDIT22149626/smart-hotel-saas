describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  })
});

it('hotelTest.cy.js', function() {
  // File path: cypress/e2e/hotelTest.cy.js
  
  describe('Smart Hotel SaaS Tests', () => {
  
    it('Admin login test', () => {
      cy.visit('http://localhost:3000')   // client URL
      cy.get('input[name=email]').type('demo@hotel.com')
      cy.get('input[name=password]').type('123456')
      cy.get('button[type=submit]').click()
      cy.contains('Dashboard')             // dashboard text check
    })
  
    it('Create booking', () => {
      cy.contains('Bookings').click()
      cy.contains('Add Booking').click()
      cy.get('input[name=customer]').type('Amashi')
      cy.get('button[type=submit]').click()
      cy.contains('Booking created')      // success message check
    })
  
  })
});