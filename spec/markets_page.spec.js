/*
DONE:
  * Accessing page via UI (links integrity)
  * At least one market enabled

TODO:
  * TODO
*/

context('Markets', function () {
    beforeEach(function () {
        cy.login()
    })

    describe('Viewing Markets Page', function () {

        it('Accessing Markets Page via UI', function () {
            cy.fixture('peatio.json').then(peatio => {
                cy.visit(peatio.host + 'settings')

                cy.get('.account-settings > .nav-link').click()

                cy.get('[href="/admin"]').click()

                cy.url().should('include', peatio.host + 'admin')

                cy.contains('.list-icon-item', 'Markets').click()

                cy.url().should('include', '/markets')
            })
        })
    })

    describe('Testing Markets Page', function () {
        beforeEach(function () {
            cy.fixture('peatio.json').then(peatio => {
                cy.visit(peatio.host + 'admin/markets')
            })
        })

        it('At least one enabled market', function () {
            cy.contains('tr', 'Yes')
        })
    })
})
