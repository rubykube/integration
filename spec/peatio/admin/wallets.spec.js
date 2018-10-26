/*
DONE:
  * Accessing page via UI (links integrity)
  * Number of signatures not empty
  * if Deposit => Maximum balance is 0
  * gateway client (client || bitgo)

TODO:
  * 
*/

context('Wallets', function () {
  before(function () {
    cy.login()
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('_peatio_session')
  })

  it('Accessing Wallets Page via UI', function () {
    cy.fixture('peatio.json').then(peatio => {
      cy.visit(peatio.host + 'settings')

      cy.get('.account-settings > .nav-link').click()

      cy.get('[href="/admin"]').click()

      cy.url().should('include', peatio.host + 'admin')

      cy.contains('.list-icon-item', 'Wallets').click()

      cy.url().should('include', '/wallets')
    })
  })

  describe('Testing Wallets Page', function () {
    beforeEach(function () {
      cy.fixture('peatio.json').then(peatio => {
        cy.visit(peatio.host + 'admin/wallets')
      })
    })

    it('Number of signatures not empty', function () {
      cy.get('table.table-striped > tbody > tr').each(row => {
        cy.visit(row[0].querySelector('td:nth-child(8) > a').href)

        cy.contains('Number of signatures').next().then(signs => {
          cy.wrap(signs[0].value).should('not.be.empty')
        })
      })
    })

    it('Maximum Balance 0 for Deposit', function () {
      cy.get('table.table-striped > tbody > tr').each(row => {
        cy.wrap(row[0].querySelector('td:nth-child(5)').innerText).then(kind => {
          if (kind == 'Deposit') {
            cy.visit(row[0].querySelector('td:nth-child(8) > a').href)

            cy.contains('Maximum Balance').next().should('have.value', '0.0')
          }
        })
      })
    })

    it('Gateway clients, Blockchain keys, URIs', function () {
      cy.get('table.table-striped > tbody > tr').each(row => {
        cy.wrap(row[0].querySelector('td:nth-child(2)')).then(currency => {
          cy.visit(row[0].querySelector('td:nth-child(8) > a').href)

          cy.fixture('currencies.json').then(currencies => {
            var code = currency[0].innerText.trim()
            var config = currencies[code]

            cy.contains('Gateway Client').next().then(select => {
              var option = select[0].selectedOptions[0].value
              assert(option == "bitgo" || option == config.gateway, 'Gateway is correct')
            })

            cy.get('#wallet_blockchain_key').then(field => {
              var regex = new RegExp('^' + config.blockchainKeyPrefix)
              assert(regex.test(field[0].value), 'Blockchain Key is valid')
            })
          })
        })
      })
    })
  })
})
