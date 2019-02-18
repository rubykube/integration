context('Redirection Test', function () {
  beforeEach(function () {
    cy.fixture('barong.json').as('signInPage')
  })

  it('Redirect by buttons on Sign in page', function () {
    cy.get('@signInPage').then((page) => {
      cy.visit(page.host + 'signin')
      cy.get(':nth-child(2) > .cr-sign-in-form__option-inner').click()
      cy.url().should('include', 'signup')
      cy.get(':nth-child(1) > .cr-sign-up-form__option-inner').click()
      cy.url().should('include', 'signin')
      cy.get(':nth-child(2) > .pg-navbar__content-item > span').click()
      cy.url().should('include', 'trading')
      cy.get('.pg-logo__img').click()
      cy.url().should('include', 'signin')
    })
  })
})

context('Barong', function () {
  beforeEach(function () {
    cy.fixture('barong.json').then((barong) => {
      cy.visit(barong.host + 'signin')
    })
  })

  describe('Barong Landing Page', function () {

    it('greets with "Sign in"', function () {
      cy.get(':nth-child(1) > .cr-sign-in-form__option-inner').should('have.text', 'Sign In')
      cy.get(':nth-child(1) > .cr-sign-in-form__label').contains('Email')
      cy.get(':nth-child(1) > .cr-input > input').should('have.attr', 'placeholder', 'Email')
      cy.get(':nth-child(2) > .cr-sign-in-form__label').contains('Password')
      cy.get(':nth-child(2) > .cr-input > input').should('have.attr', 'placeholder', 'Password')
      cy.get('.cr-button').contains('SIGN IN')
      cy.get('.cr-sign-in-form__bottom-section-password').should('have.text', 'Forgot your password?')
    })
  })
////
  context('Logging In', function () {
    beforeEach(function () {
      cy.contains('.cr-button', 'SIGN IN').as('signIn')
      cy.fixture('admin.json').as('user')
    })

    describe('Wrong emails', function () {

      it('empty email', function () {
        cy.get('@signIn').should('be.disabled')
        cy.url().should('include', 'signin')
      })

      it('not registered email', function () {
          cy.get('@user').then((user) => {
          cy.get(':nth-child(1) > .cr-input > input').type("samplemail@somewhere.com")
          cy.get(':nth-child(2) > .cr-input > input').type(user.password)
          cy.get('@signIn').click().wait(200)
          cy.url().should('include', 'signin')
        })
      })
    })
////
    describe('Logging as user', function () {
      beforeEach(function () {
        cy.fixture('admin.json').as('user')
        cy.contains('.cr-button', 'SIGN IN').as('signIn')
      })

      it('Reset password page (empty email)', function () {
        cy.get('.cr-sign-in-form__bottom-section-password').click()
        cy.url().should('include', 'forgot_password')
        cy.get('.cr-email-form__option-inner').should('have.text', 'Forgot Your Password')
        cy.get('.cr-input > input').should('have.attr', 'placeholder', 'Email')
        cy.get('.cr-button').should('have.class', 'cr-button cr-email-form__button cr-email-form__button--disabled')
        cy.url().should('include', 'forgot_password')
      })

      it('Reset password page (wrong email)', function () {
        cy.get('.cr-sign-in-form__bottom-section-password').click()
        cy.url().should('include', 'forgot_password')
        cy.get('.cr-email-form__option-inner').should('have.text', 'Forgot Your Password')
        cy.get('.cr-input > input').should('have.attr', 'placeholder', 'Email')
        cy.get('.cr-input > input').type("samplemail@somewhere.com")
        cy.get('legend').contains('Email')
        cy.get('.cr-button').contains('SEND').click()
        cy.url().should('include', 'forgot_password')
      })

      it('Reset password page (correct email)', function () {
          cy.get('@user').then((user) => {
            cy.get('.cr-sign-in-form__bottom-section-password').click()
            cy.get('.cr-input > input').type(user.login)
            cy.get('legend').contains('Email')
            cy.get('.cr-button').click()
            cy.url().should('include', 'forgot_password')
            cy.get('.cr-alert__title').contains("Reset password link was sent to your mail")
          })
      })
/////
      it('empty password', function () {
            cy.get('@user').then((user) => {
            cy.get(':nth-child(1) > .cr-input > input').type(user.login)
            cy.get('@signIn').should('be.disabled')
            cy.url().should('include', 'signin')
        })
      })

      it('wrong Password', function () {
          cy.get('@user').then((user) => {
          cy.get(':nth-child(1) > .cr-input > input').type(user.login)
          cy.get(':nth-child(2) > .cr-input > input').type('123123123')
          cy.get('@signIn').click()
          cy.url().should('include', 'signin')
        })
      })

      it('correct password', function () {
        cy.get('@user').then((user) => {
          cy.get(':nth-child(1) > .cr-input > input').type(user.login).should('have.value', user.login)
          cy.get(':nth-child(2) > .cr-input > input').type(user.password).should('have.value', user.password)
          cy.get('@signIn').click()
          cy.url().should('include', 'wallets')
        })
      })
    })
  })
})
