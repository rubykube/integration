/*
DONE:
  * Accessing page via UI (links integrity)
  * Check SN presence
  * Member should have >= Account Info cards
  * Checking Deposit Addresses presence after reload
  * Validating Deposit Addresses for BTC, BCH, LTC, DASH (for logged member only)

TODO:
  * Tests will not work if our member is not on the first page
*/

context('Members', function () {
    beforeEach(function () {
        cy.login()
    })

    describe('Viewing member info', function () {
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

        it('checking our user presence', function () {
            cy.fixture('peatio.json').then(peatio => {
                cy.visit(peatio.host + 'admin/members/')

                cy.fixture('user.json').then(user => {
                    cy.contains('tr', user.login).contains('SN')
                    cy.contains('tr', user.login).contains('a.toggle-web', 'No')
                    cy.contains('tr', user.login).contains('a.toggle-api', 'No')
                })
            })
        })
    })

    describe('Viewing account info', function () {
        beforeEach(function () {
            cy.fixture('peatio.json').then(peatio => {
                cy.visit(peatio.host + 'admin/members/')

                cy.fixture('user.json').then(user => {
                    cy.contains('tr', user.login).contains('td', /\d/).invoke('text').then(id => {
                        cy.visit(peatio.host + 'admin/members/' + id)
                    })
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
