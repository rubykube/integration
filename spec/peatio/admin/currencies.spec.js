/*
DONE:
  * Accessing page via UI (links integrity)
  * At least two currencies should be Active
  * At least one Coin should be Active
  * Check base factor (valid base factores are stored in fixtures)
  * Every Coin should have two wallets -> Deposit and hot
  * Deposit fee == 0 for coins
  * Withdraw fee != 0
  * Blockchain key should be default placeholder for fiats
  * Checking blockchain's key

TODO:
  * HD Support checks
*/

context('Currencies', function () {
  before(function () {
    cy.login()
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('_peatio_session')
  })

  it('Accessing Currencies Page via UI', function () {
    cy.fixture('peatio.json').then(peatio => {
      cy.visit(peatio.host + 'settings')

      cy.get('.account-settings > .nav-link').click()

      cy.get('[href="/admin"]').click()

      cy.url().should('include', peatio.host + 'admin')

      cy.contains('.list-icon-item', 'Currencies').click()

      cy.url().should('include', '/currencies')
    })
  })

  describe('Testing Currencies Page', function () {
    beforeEach(function () {
      cy.fixture('peatio.json').then(peatio => {
        cy.visit(peatio.host + 'admin/currencies')
      })
    })

    it('at least two enabled currencies', function () {
      var enabled = 0

      cy.get('.table-striped > tbody > tr').each(row => {
        if (row[0].querySelector('td:nth-child(5)').innerText == 'Yes')
          enabled += 1
      }).then(() => {
        assert(enabled >= 2, enabled + ' Currencies enabled')
      })
    })

    it('at least one enabled coin', function () {
      // cy.contains('tr', 'Yes').contains('Coin') // this code will break if enabled fiat is higher in table
      var oneEnabled = false

      cy.get('table.table-striped > tbody > tr').each(row => {
        var type = row[0].querySelector('td:nth-child(3)').innerText

        if (type == 'Coin') {
          var enabled = row[0].querySelector('td:nth-child(5)').innerText

          if (enabled == 'Yes') {
            oneEnabled = true
            return false
          }
        }
      }).then(() => {
        assert(oneEnabled, 'At least one coin is enabled')
      })
    })
  })
})
