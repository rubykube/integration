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

        cy.get('a.btn').click()

        cy.fixture('user.json').then((user) => {
            cy.get('#account_email').type(user.login).should('have.value', user.login)

            cy.contains('.btn-success', 'Submit').click()

            cy.get('#account_password').type(user.password)

            cy.contains('.btn-success', 'Submit').click()
        })
    })
})

Cypress.Commands.add('upload_file', (fileName, fileType = ' ', selector) => {
    cy.get(selector).then(subject => {
        cy.fixture(fileName, 'base64')
            .then(Cypress.Blob.base64StringToBlob)
            .then(blob => {
                const el = subject[0]
                const testFile = new File([blob], fileName, { type: fileType })
                const dataTransfer = new DataTransfer()
                dataTransfer.items.add(testFile)
                el.files = dataTransfer.files
            })
    })
})

Cypress.Commands.add('iframe', { prevSubject: 'element' }, $iframe => {
    return new Cypress.Promise(resolve => {
        $iframe.on('load', () => {
            resolve($iframe.contents().find('body'));
        })
    })
})