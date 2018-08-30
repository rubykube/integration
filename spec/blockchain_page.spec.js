/*
DONE:
  * Accessing page via UI (links integrity)
  * At least one blockchain should be active
  * Check balockchain client
  * Check Explorer Address and Transaction
  * Validate height

TODO:
  * Test rely on blockchain key:
  * * if there is no 'eth' in blockchain key, test will not find ETH.json fixture, etc
  * Test does not really check Exploreer Address and Transaction hosts, need smt like list of all possible hosts
  * Check blockchain Server
  * Check Reset button
*/

context('Blockchain', function () {
    beforeEach(function () {
        cy.login()
    })

    describe('Viewing Blockchain Page', function () {

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
                        var config = currencies[getCurrencyByKey(key[0].value)]

                        cy.get('#blockchain_client').should('have.value', config.client)

                        cy.get('#blockchain_explorer_address').then(field => {
                            var regexp = new RegExp(config.explorerAddress)
                            assert(regexp.test(field[0].value), 'Explorer Address is valid')
                        })

                        cy.get('#blockchain_explorer_transaction').then(field => {
                            var regexp = new RegExp(config.transactionAddress)
                            assert(regexp.test(field[0].value), 'Explorer Transaction is valid')
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
                                    confirms: confirms
                                }
                            })
                    }
                    else { //bitcoin-like
                        cy.fixture('currencies.json').then(currencies => {
                            var config = currencies[getCurrencyByClient(client)]

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
                                    confirms: confirms
                                }
                            })
                        })
                    }
                }).then(context => {
                    var delta = context.netHeight - height - context.confirms

                    assert(delta <= 1, 'Blockchain height for ' + client + ' is synchronized')
                })
            })
        })
    })
})

function getCurrencyByKey(key) {
    if ((/^eth/i).test(key))
        return 'ETH'
    if ((/^btc/i).test(key))
        return 'BTC'
    if ((/^bch/i).test(key))
        return 'BCH'

    return 'BTC' //default
}

function getCurrencyByClient(client) {
    switch (client) {
        case 'BITCOIN':
            return 'BTC'
        case 'BITCOINCASH':
            return 'BCH'
        default:
            return 'BTC' //default
    }
}
