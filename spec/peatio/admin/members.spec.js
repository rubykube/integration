/*
DONE:
  * Accessing page via UI (links integrity)
  * Check SN presence
  * Member should have >= Account Info cards
  * Checking Deposit Addresses presence after reload
  * Validating Deposit Addresses for BTC, BCH, LTC, DASH (for logged member only)

TODO:
*/

context('Members', function () {
  before(function () {
    cy.login()
  })

  beforeEach(function () {
    Cypress.Cookies.preserveOnce('_peatio_session')
  })

  it('accessing Member\'s page via UI', function () {
    cy.fixture('peatio.json').then(peatio => {
      cy.visit(peatio.host + 'settings')

      cy.get('.account-settings > .nav-link').click()

      cy.get('[href="/admin"]').click()

      cy.url().should('include', peatio.host + 'admin')

      cy.contains('.list-icon-item', 'Members').click()

      cy.url().should('include', '/members')
    })
  })

  describe('Testing Member', function () {
    beforeEach(function () {
      cy.fixture('peatio.json').then(peatio => {
        cy.visit(peatio.host + 'admin/members/')
      })
    })

    it('checking our user presence', function () {
      cy.fixture('user.json').then(user => {
        cy.get('#search_field').select('E-Mail')
        cy.get('#search_term').clear().type(user.login).should('have.value', user.login)
        cy.get('.btn').contains('Search').click()

        cy.contains('tr', user.login).contains('SN')
        cy.contains('tr', user.login).contains('a.toggle-web', 'No')
        cy.contains('tr', user.login).contains('a.toggle-api', 'No')
      })
    })

    describe('Checking Search Working', function () {
      beforeEach(function () {
        cy.fixture('user.json').then(user => {
          cy.get('#search_field').select('E-Mail')
          cy.get('#search_term').clear().type(user.login).should('have.value', user.login)
          cy.get('.btn').contains('Search').click()
        })
      })

      it('Search by SN', function () {
        cy.contains('td', 'SN').then(td => {
          var sn = td[0].innerText

          cy.get('#search_field').select('SN')
          cy.get('#search_term').clear().type(sn).should('have.value', sn)

          cy.fixture('user.json').then(user => {
            cy.get('.btn').contains('Search').click()
            cy.contains('tr', user.login)
          })
        })
      })

      it('Search by wallet addresses', function () {
        cy.fixture('user.json').then(user => {
          cy.contains('tr', user.login).contains('a', 'View').then(a => {
            cy.visit(a[0].href)
            cy.reload().then(() => {
              cy.get('.row:nth-child(3)').children().each(card => {
                var dd = card[0].querySelector('.dl-horizontal > dd:nth-child(8)')

                if (dd != null) {
                  var addr = dd.innerText

                  cy.fixture('peatio.json').then(peatio => {
                    cy.visit(peatio.host + 'admin/members/')

                    cy.get('#search_field').select('Wallet address')
                    cy.get('#search_term').clear().type(addr).should('have.value', addr)
                    cy.get('.btn').contains('Search').click()
                    cy.contains('tr', user.login)
                  })
                }
              })
            })
          })
        })
      })
    })

    describe('Viewing account info', function () {
      beforeEach(function () {
        cy.fixture('user.json').then(user => {
          cy.get('#search_field').select('E-Mail')
          cy.get('#search_term').clear().type(user.login).should('have.value', user.login)
          cy.get('.btn').contains('Search').click()

          cy.contains('tr', user.login).contains('a', 'View').then(button => {
            cy.visit(button[0].href)
          })
        })
      })

      it('checking member info', function () {
        cy.fixture('user.json').then(user => {
          cy.contains('.card', user.login).contains('SN')

          cy.get('.row:nth-child(3) > :nth-child(2)')

          cy.reload().then(() => {
            cy.get('.row:nth-child(3) > :nth-child(1)').get('dd:last-child').should('be.not.empty')
          })
        })
      })

      it('Checking Deposit Address validity', function () {
        cy.reload().then(() => {
          cy.fixture('currencies.json').then(currencies => {
            cy.get('.row:nth-child(3)').children().each(card => {
              var currency = card[0].querySelector('.card-header > span:nth-child(3)').innerText

              if (!currencies.Fiats.includes(currency)) {
                cy.wrap(card[0].querySelector('.dl-horizontal > dd:nth-child(8)').innerText).then(addr => {
                  if (currencies.Ethereums.includes(currency)) {
                    return /^(0x)?[0-9a-f]{40}$/.test(addr)
                  }
                  else {
                    var config = currencies[currency]
                    if (currency == 'XRP') {
                      cy.request({
                        url: config.server,
                        body: {
                          "jsonrpc": "2.0",
                          "method": "account_info",
                          "params": [{
                            "account": addr.replace(/(\?.*)/, "")
                          }]
                        }
                      }).then(response => {
                        return response.body.result.status == "success"
                      })
                    }
                    else {
                      cy.request({
                        method: 'POST',
                        url: config.server,
                        body: {
                          "jsonrpc": "2.0",
                          "method": "validateaddress",
                          "params": [addr]
                        }
                      }).then(response => {
                        return response.body.result.isvalid
                      })
                    }
                  }
                }).then(validity => {
                  assert(validity, 'Deposit Address for ' + currency + ' is valid')
                })
              }
            })
          })
        })
      })
    })
  })
})
