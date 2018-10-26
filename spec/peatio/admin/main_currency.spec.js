/*
 * DONE:
 * Main currency should be active
 * Cannot disable Main currency
 * TODO:
 * 
 */

context('Main Currency Tests', function () {
  before(function () {
    cy.login()
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('_peatio_session')
  })

  var main_currency

  it('Looking for main currency', function () {
    cy.fixture('peatio.json').then(peatio => {
      cy.visit(peatio.host + '/settings')

      cy.get('#menu > :nth-child(1) > .nav-link').then(button => {
        cy.visit(button[0].href)
        cy.get('#total_assets').then(assets => {
          var match = /^([^\d]+)/.exec(assets[0].innerText)
          var symbol = match[0]

          cy.visit(peatio.host + 'admin/currencies')

          cy.contains('tr', symbol).then(tr => {
            main_currency = tr[0].querySelector('td:first-child').innerText
          })
        })
      })
    })
  })

  it('Main currency should be Active', function () {
    cy.fixture('peatio.json').then(peatio => {
      cy.visit(peatio.host + 'admin/currencies')

      cy.contains('tr', main_currency).then(row => {
        var enabled = /yes/i.test(row[0].querySelector('td:nth-child(5)').innerText)
        assert(enabled, 'Main Currency should be enabled')
      })
    })
  })

  it('Cannot Disable Main Currency', function () {
    cy.fixture('peatio.json').then(peatio => {
      cy.visit(peatio.host + 'admin/currencies')

      cy.contains('tr', main_currency).contains('a', 'View').then(button => {
        cy.visit(button[0].href)

        cy.get('#currency_enabled').uncheck()

        cy.get('.btn').contains('Submit').click()

        cy.contains('.alert', 'Cannot disable')

        cy.get('#currency_enabled').should('be.checked')
      })
    })
  })
})
