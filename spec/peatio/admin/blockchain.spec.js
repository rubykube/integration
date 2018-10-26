/*
DONE:
  * Accessing page via UI (links integrity)
  * At least one blockchain should be active
  * Check balockchain client
  * Check Explorer Address and Transaction
  * Validate height
  * Check blockchain Server

TODO:
  * Test rely on blockchain key:
  * * if there is no 'eth' prefix in blockchain key, test will not find ETH.json fixture, etc
  * Test does not really check Exploreer Address and Transaction hosts, need smt like list of all possible hosts
  * Check Reset button
  * Ethereum and Ripple height deltas values
*/

context('Blockchain', function () {
  before(function () {
    cy.login()
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('_peatio_session')
  })

  it('Accessing Blockchain Page via UI', function () {
    cy.fixture('peatio.json').then(peatio => {
      cy.visit(peatio.host + 'settings')

      cy.get('.account-settings > .nav-link').click()

      cy.get('[href="/admin"]').click()

      cy.url().should('include', peatio.host + 'admin')

      cy.contains('.list-icon-item', 'Blockchains').click()

      cy.url().should('include', '/blockchains')
    })
  })

  describe('Blockchains page tests', function () {
    beforeEach(function () {
      cy.fixture('peatio.json').then(peatio => {
        cy.visit(peatio.host + 'admin/blockchains')
      })
    })

    it('At least one active blockchain', function () {
      cy.get('table.table-striped > tbody > tr > td:nth-child(6)').contains('Active')
    })
  })
})
