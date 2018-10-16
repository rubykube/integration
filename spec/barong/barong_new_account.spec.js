context('Barong', () => {
    beforeEach(() => {
        cy.fixture('newuser.json').as('user')
        cy.fixture('barong.json').as('barong')
        Cypress.Cookies.preserveOnce('_barong_session')
    })

    const random = Math.floor(Math.random() * 1000)

    describe('Creation new account', () => {

        it('fill account data', () => {
            cy.get('@barong').then((barong) => {
                cy.get('@user').then((user) => {
                    cy.visit(barong.host + 'accounts/sign_up')
                    cy.get('#account_email').type(random + user.login)
                    cy.get('#account_password').type(user.password)
                    cy.get('#account_password_confirmation').type(user.password)
                    cy.get('.btn').click()
                    cy.get('h3').should('have.text', 'A message with a confirmation link has been sent to your email address. Please follow the link to activate your account.')
                })
            })
        })
    })

    describe('1 lvl', () => {

        it('confirm email', () => {
            cy.visit('http://mail.wb1.helioscloud.com/')
            cy.get('tbody').find('tr').first().click()
            cy.get('.body').iframe().find('a').click()
        })

        it('login to account', () => {
            loginUser()
        })

        it('check if account have KYC level 1', () => {
            checkLvl(1)
        })
    })

    describe('2 lvl', () => {
        it('add phone number', () => {
            cy.get('#country_code').type('+1')
            cy.get('#number').type('2033613169')
            cy.get('#send-code-btn').click()
        })

        it('confirm phone in admin panel', () => {
            cy.get('@barong').then((barong) => {
                cy.get('@user').then((user) => {
                    cy.clearCookie('_barong_session')
                    cy.visit(barong.host + 'accounts/sign_in')
                    cy.login()
                    cy.visit(barong.host + 'admin')
                    if(!(cy.get('.pagination').should('not.exist'))) {
                        cy.get('.pagination').find('li').last().click()
                    }
                    cy.get('tbody').find('tr').last()
                        .find('a').first().should('have.text', random + user.login)
                        .click()
                    cy.get('.btn-success').click()
                    cy.get('[name="label[key]"]').type('phone')
                    cy.get('[name="label[value]"]').type('verified')
                    cy.get('select').select('private')
                    cy.get('.btn').click()
                })
            })
        })

        it('check if account have KYC level 2', () => {
            checkLvl(2)
        })
    })

    describe('3 lvl', () => {
        it('fill personal information', () => {
            cy.clearCookie('_barong_session')
            loginUser()
            cy.get('@barong').then((barong) => {
                cy.visit(barong.host + 'profiles/new')
                cy.get('#profile_first_name').type('Testname')
                cy.get('#profile_last_name').type('Testsecondname')
                cy.get('#profile_dob').type('1990-09-26')
                cy.get('#profile_country').select('United States of America')
                cy.get('#profile_address').type('Teststeet')
                cy.get('#profile_city').type('New York City')
                cy.get('#profile_postcode').type('10001')
                cy.get('.btn').contains('CONFIRM').click()
                cy.get('.font-weight-bold').should('have.text', 'Verification > Add document')
            })
        })

        it('Upload document', () => {
            const fileName = 'test.jpeg'
            const fileType = 'image/jpg'
            const fileInput = 'input[type=file]'
            cy.upload_file(fileName, fileType, fileInput)
            cy.get('#document_doc_expire').type('2018-12-13')
            cy.get('#document_doc_number').type('AB123456')
            cy.contains('.btn', 'Submit').click()
            cy.get('h3').should('have.text', 'Document was successfully uploaded.')
        })

        it('confirm document in admin panel', () => {
            cy.get('@barong').then((barong) => {
                cy.get('@user').then((user) => {
                    cy.clearCookie('_barong_session')
                    cy.visit(barong.host + 'accounts/sign_in')
                    cy.login()
                    cy.visit(barong.host + 'admin')
                    if(!(cy.get('.pagination').should('not.exist'))) {
                        cy.get('.pagination').find('li').last().click()
                    }
                    cy.get('tbody').find('tr').last()
                        .find('a').first().should('have.text', random + user.login)
                        .click()
                    cy.get('#dropdownMenuLink').click()
                    Cypress.on('uncaught:exception', (err) => {
                        cy.get('.dropdown-item').first().click()
                        expect(err.message).to.include('Uncaught TypeError: Illegal invocation')
                        return false
                    })
                    cy.get('.dropdown-item').first().click()
                })
            })
        })

        it('check if account have KYC level 3', () => {
            checkLvl(3)
        })
    })

    function loginUser() {
        cy.get('@barong').then((barong) => {
            cy.visit(barong.host + 'accounts/sign_in')
            cy.get('@user').then((user) => {
                cy.get('#account_email').type(random + user.login)
                cy.contains('.btn', 'Submit').click()
                cy.get('#account_password').type(user.password)
                cy.contains('.btn', 'Submit').click()
            })
        })

    }

    function checkLvl(lvl) {
        cy.get('@user').then((user) => {
            cy.request({
                method: 'POST',
                url: '/api/v1/sessions/',
                form: true,
                body: {
                    email: random + user.login,
                    password: user.password,
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
        })
    }
})