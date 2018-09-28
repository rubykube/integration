context('Barong', () => {
    beforeEach( () => {
        cy.fixture('barong.json').then((barong) => {
            cy.visit(barong.host + 'accounts/sign_in')
        })
    })

    describe('Barong Landing Page', () => {

        it('greets with "Sign in"', () => {
            cy.get('h2.title').should('have.text', 'Sign in')
        })

        it('contains "Sign up"', () => {
            cy.get('.text-right').should('contain', 'Sign up')
        })
    })

    describe('Creation new account', () => {
        beforeEach( () => {
            cy.get('.text-right > .text-white').click()
            cy.contains('.btn', 'Submit').as('submitAccount')
        })

        it('fill account data', () => {
            cy.get('#account_email').type('testmail@somewhere.com')
            cy.get('#account_password').type('Testpass123')
            cy.get('#account_password_confirmation').type('Testpass123')
            cy.get('@submitAccount').click()
            cy.get('h3').should('have.text', 'A message with a confirmation link has been sent to your email address. Please follow the link to activate your account.')
        })
    })

    describe('Login and check account KYC level', () => {
        beforeEach( () => {
            Cypress.Cookies.preserveOnce('_barong_session')
        })

        it('confirm email', () => {
            cy.visit('http://mail.wb1.helioscloud.com/messages/1.html')
            cy.get('a').click()
            cy.get('h3').should('have.text', 'Your email address has been successfully confirmed. Please login to your account to continue.')
        })

        it('login to account', () => {
            cy.get('#account_email').type('testmail@somewhere.com')
            cy.contains('.btn', 'Submit').click()
            cy.get('#account_password').type('Testpass123')
            cy.contains('.btn', 'Submit').click()
        })

        it('check if account have KYC level 1', () => {
            checkLvl(1)
        })

        it('add telephone number and confirm', () => {
            cy.get('#country_code').type('+1')
            cy.get('#number').type('2033613169')
            cy.get('#send-code-btn').click()
            //Add timeout and confirm telephone number manually
        })

        it('check if account have KYC level 2', () => {
            checkLvl(2)
        })

        it('fill personal information', () => {
            cy.get('#profile_first_name').type('Testname')
            cy.get('#profile_last_name').type('Testsecondname')
            cy.get('#profile_dob').type('1990-09-26')
            cy.get('#profile_country').select('United States of America')
            cy.get('#profile_address').type('Teststeet')
            cy.get('#profile_city').type('New York City')
            cy.get('#profile_postcode').type('10001')
            cy.contains('.btn', 'Submit').click()
            cy.get('.font-weight-bold').should('have.text', 'Verification > Add document')
        })

        it('Add document', () => {
            cy.get('#document_upload')
        })

    })
})

function checkLvl (lvl) {
    cy.request({
        method: 'POST',
        url: '/api/v1/sessions/',
        form: true,
        body: {
            email: 'testmail@somewhere.com',
            password: 'Testpass123',
            application_id: 'a68be319fca51caca60eed5711226e568bd1c1d13ff452b945515f1a6ffbaca4'
        }
    }).then((bearer) => {
        cy.request({
            method: 'GET',
            url: '/api/v1/accounts/me',
            form: true,
            headers: {
                Authorization: 'Bearer ' + bearer.body
            }
        }).then((response) => {
            expect(response.body).to.have.property('level', lvl)
        })
    })
}