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

TODO:
  * Checking blockchain's key
  * HD Support checks
*/

context('Currencies', function () {
    beforeEach(function () {
        cy.login()
    })

    describe('Viewing Currencies Page', function () {

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

        it('Checking Currencies one by one', function () {
            cy.fixture('peatio.json').then(peatio => {
                cy.fixture('currencies.json').then(currencies => {
                    cy.get('table.table-striped > tbody > tr').each(row => {
                        cy.visit(peatio.host + 'admin/currencies/' + row[0].firstChild.innerText)

                        cy.get('.dl-horizontal > :nth-child(2)').then(dd => {
                            var currency = dd[0].innerText.toUpperCase()
                            var config

                            if (currencies.Fiats.includes(currency))
                                config = currencies['FIAT']
                            else
                                config = currencies[currency]

                            cy.contains('Base factor').next().then(base => {
                                cy.expect(base[0].innerText).to.equal(config.baseFactor)
                            })

                            cy.contains('Withdraw fee').next().children().first().should('not.have.value', '0.0')

                            cy.contains('Type').next().then(type => {
                                if (type[0].innerText == 'Coin') { // Coins-related tests
                                    cy.contains('Deposit fee').next().children().first().should('have.value', '0.0')
                                }
                                else { // Fiat-related tests
                                    cy.contains('Blockchain Key').next().children().first().then(select => {
                                        cy.expect(select[0].selectedOptions[0].text).to.equal('Select Blockchain Key')
                                    })
                                }
                            })
                        })
                    })
                })
            })
        })

        it('Deposit and Hot Wallet for Coins presence', function () {
            cy.fixture('peatio.json').then(peatio => {
                cy.get('.table-striped > tbody > tr').each(row => {
                    var coin = row[0].querySelector('td:nth-child(1)').innerText
                    var type = row[0].querySelector('td:nth-child(3)').innerText
                    var enabled = row[0].querySelector('td:nth-child(5)').innerText

                    if (type == 'Coin' && enabled == 'Yes') { //do not test coin if it is disabled
                        cy.visit(peatio.host + 'admin/wallets')

                        // if we have Deposit and Hot Wallets ordered (Deposit, then Hot)
                        // we can use contains + next.contains
                        // cy.contains('tr', coin).contains('Deposit')
                        // cy.contains('tr', coin).next().contains('Hot')
                        // simple and compact, but not reliable
                        var hot = false
                        var deposit = false

                        cy.get('.table-striped > tbody > tr').each(row => {
                            var currency = row[0].querySelector('td:nth-child(2)').innerText
                            var status = row[0].querySelector('td:nth-child(6)').innerText

                            if (status == 'Active' && currency == coin) {
                                var kind = row[0].querySelector('td:nth-child(5)').innerText

                                if (kind == 'Deposit')
                                    deposit = true

                                if (kind == 'Hot')
                                    hot = true
                            }
                        }).then(() => {
                            assert(deposit, 'Deposit Wallet for ' + coin + ' is present')

                            assert(hot, 'Hot Wallet for ' + coin + 'is present')
                        })
                    }
                })
            })
        })
    })
})
