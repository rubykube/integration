context('Barong', () => {

    it('test lockable', () => {
        cy.clearCookies()
        cy.fixture('testUser.json').then((testuser) => {
            cy.fixture('barong.json').then((barong) => {
                cy.visit(barong.host + 'accounts/sign_in')
    
                cy.get('#account_email').type(testuser.login)
                for(let i = 0; i < 5; i++) {
                    fakeLogin()
                }

                cy.get('h3').should('have.text', 'Your account is locked.')
                cy.visit('http://mail.wb1.helioscloud.com/')
                cy.get('tbody').find('tr').first().click()
                cy.get('.body').iframe().find('a').click()
                cy.visit(barong.host + 'accounts/sign_in')
                cy.get('#account_email').type(testuser.login)
                cy.get('.btn').click()
                cy.get('#account_password').type(testuser.password)
                cy.get('.btn-success').click()
                cy.get('h3').should('have.text', 'Signed in successfully.')
            })
        })
    })

    function fakeLogin () {
        cy.fixture('testUser.json').then((testuser) => {
            cy.get('.btn').click()
            cy.get('#account_password').type(testuser.fakepass)
            cy.get('.btn-success').click()
        })
    }
})