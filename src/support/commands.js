// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// Cypress.Commands.add('login', () => {
//     cy.request ({
//         method: 'POST',
//         url: 'http://auth.wb1.helioscloud.com/api/v1/sign_in',
//         body: {
//             login: 'admin@barong.io',
//             password: 'Qwerty123',
//         }
//     })
//     .then((resp) => {
//         window.localStorage.setItem('jwt', resp.body.user.token)
//     })
// })

Cypress.Commands.add('login', () => {
  cy.fixture('peatio').then((peatio) => {

    cy.visit(peatio.host)

    cy.get('a.btn').then((button) => {
      if ((/auth\/barong/).test(button[0].href)) {
        cy.visit(button[0].href)
        cy.fixture('user.json').then((user) => {
          cy.get('#account_email').type(user.login).should('have.value', user.login)

          cy.contains('.btn-success', 'Submit').click()

          cy.get('#account_password').type(user.password)

          cy.contains('.btn-success', 'Submit').click()
        })
      }
    })
  })
})
