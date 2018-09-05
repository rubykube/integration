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

import { getCurrencyByClient, getCurrencyByKey } from '../../../src/helpers'

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

    it('Checking blockchains one by one', function () {
      cy.get("table.table-striped > tbody > tr").each(row => {
        cy.visit(row[0].querySelector('a').href)

        cy.fixture('currencies.json').then(currencies => {
          cy.get('#blockchain_key').then(key => {
            var currency = getCurrencyByKey(key[0].value)
            var config = currencies[currency]

            cy.get('#blockchain_client').should('have.value', config.client)

            cy.get('#blockchain_explorer_address').then(field => {
              var regexp = new RegExp(config.explorerAddress)
              assert(regexp.test(field[0].value), 'Explorer Address is valid')
            })

            cy.get('#blockchain_explorer_transaction').then(field => {
              var regexp = new RegExp(config.transactionAddress)
              assert(regexp.test(field[0].value), 'Explorer Transaction is valid')
            })

            cy.get('#blockchain_server').then(field => {
              var server = field[0].value

              if (currencies.Ethereums.includes(currency)) {
                assert(server == config.server || server == 'http://geth:8545', 'Server is correct')
              }
              else {
                assert(server == config.server, 'Server is correct')
              }
            })
          })
        })
      })
    })

    it('Validating blockchain height', function () {
      cy.get('table.table-striped > tbody > tr').each(row => {
        var client = row[0].querySelector('td:nth-child(4)').innerText
        var height = row[0].querySelector('td:nth-child(5)').innerText

        cy.visit(row[0].querySelector('a').href)

        cy.contains('Min Confirmations').next().then(confirmations => {
          var confirms = parseInt(confirmations[0].value)
          // blocks state can change while we run our test, especially
          // for Ethereum, so we do no expect that
          // 0 <= netHeight - nodeHeight - confirmations <= 1

          if (client == 'ETHEREUM') {
            cy.request('https://api-rinkeby.etherscan.io/api\?module\=proxy\&action\=eth_blockNumber\&apikey\=YourApiKeyToken')
              .then(response => {
                return {
                  netHeight: parseInt(response.body.result, 16),
                  confirms: confirms,
                  delta: 5
                }
              })
          }
          else {
            cy.fixture('currencies.json').then(currencies => {
              var config = currencies[getCurrencyByClient(client)]

              if (client == 'RIPPLE') {
                cy.request({
                  method: 'POST',
                  url: config.server,
                  body: {
                    "jsonrpc": "2.0",
                    "method": "ledger_closed"
                  }
                }).then(response => {
                  return {
                    netHeight: response.body.result.ledger_index,
                    confirms: confirms,
                    delta: 20
                  }
                })
              }
              else {
                cy.request({
                  method: 'POST',
                  url: config.server,
                  body: {
                    "jsonrpc": "2.0",
                    "method": "getblockchaininfo"
                  }
                }).then(response => {
                  return {
                    netHeight: response.body.result.blocks,
                    confirms: confirms,
                    delta: 1
                  }
                })
              }
            })
          }
        }).then(context => {
          var delta = context.netHeight - height - context.confirms

          assert(delta <= context.delta, 'Blockchain height for ' + client + ' is synchronized')
        })
      })
    })
  })
})
