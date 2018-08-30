
context('Barong', function () {
  beforeEach(function () {
    cy.fixture('barong.json').then((barong) => {
      cy.visit(barong.host + 'accounts/sign_in')
    })
  })

  describe('Barong Landing Page', function () {

    it('greets with "Sign in"', function () {
      cy.get('h2.title').should('have.text', 'Sign in')
    })
  })

  context('Logging In', function () {
    beforeEach(function () {
      cy.contains('.btn', 'Submit').as('submitEmail')
    })

    describe('Wrong emails', function () {

      it('empty email', function () {
        cy.get('@submitEmail').click()
        cy.url().should('include', 'accounts/sign_in')
      })

      it('not registered email', function () {
        cy.get('#account_email').type("samplemail@somewhere.com")
        cy.get('@submitEmail').click()
        cy.url().should('include', 'accounts/sign_in/confirm')
      })
    })

    describe('Logging as user', function () {
      beforeEach(function () {
        cy.fixture('user.json').as('user')
        cy.contains('.btn-success', 'Submit').as('submitPass')

        cy.get('@user').then((user) => {
          cy.get('#account_email').type(user.login).should('have.value', user.login)
          cy.contains('.btn', 'Submit').click()
        })
      })

      it('getting to password page', function () {
        cy.url().should('include', 'sign_in/confirm')

        cy.get('@user').then((user) => {
          cy.get('.title').should('have.text', 'Hello, ' + user.login + '!')
          cy.get('#account_password')
        })
      })

      it('empty password', function () {
        cy.contains('.btn-success', 'Submit').click()
        cy.contains('h3', 'Invalid').should('have.text', 'Invalid Email or password.')
      })

      it('wrong Password', function () {
        cy.get('#account_password').type('123123123')
        cy.contains('.btn-success', 'Submit').click()
        cy.contains('h3', 'Invalid').should('have.text', 'Invalid Email or password.')
      })

      it('correct password', function () {
        cy.get('@user').then((user) => {
          cy.get('.title').should('have.text', 'Hello, ' + user.login + '!')
          cy.get('#account_password').type(user.password)
          cy.contains('.btn-success', 'Submit').click()

          cy.contains('h3', 'Signed').should('have.text', 'Signed in successfully.')
          cy.contains('Signed in as ' + user.login)
        })
      })
    })
  })
})

context('Redirection Test', function () {

  it('Peatio-Barong-Peatio redirection', function () {
    cy.fixture('peatio.json').then((peatio) => {
      cy.visit(peatio.host)

      cy.get('a.btn').click()

      cy.fixture('barong.json').then((barong) => {
        cy.url().should('include', barong.host)

        cy.contains('h3', 'You need').should('have.text', 'You need to sign in or sign up before continuing.')

        cy.contains('.title', 'Sign in')
        cy.fixture('user.json').then((user) => {
          cy.get('#account_email').type(user.login).should('have.value', user.login)

          cy.contains('.btn-success', 'Submit').click()

          cy.get('#account_password').type(user.password)

          cy.contains('.btn-success', 'Submit').click()

          cy.url().should('include', peatio.host)
        })
      })
    })
  })
})
