context('Barong', () => {

    it('test fake users', () => {
        cy.readFile('fixtures/fake users/fake users.seed.json').then(users => {
            cy.wrap(users).each(fake => {
                if (!fake.skip) {
                    checkProfile(fake.email, fake.password, fake.level, fake.role, fake.first_name, fake.last_name, fake.dob, fake.address, fake.postcode, fake.city, fake.country)
                }
            })
        })
    })

    function checkProfile(email, password, lvl, role, first_name, last_name, dob, address, postcode, city, country) {
        cy.request({
            method: 'POST',
            url: 'http://auth.wb1.helioscloud.com/api/v1/sessions/',
            form: true,
            body: {
                email: email,
                password: password,
                application_id: 'a68be319fca51caca60eed5711226e568bd1c1d13ff452b945515f1a6ffbaca4'
            }
        }).then((bearer) => {
            cy.request({
                method: 'GET',
                url: 'http://auth.wb1.helioscloud.com/api/v1/accounts/me',
                form: true,
                headers: {
                    Authorization: 'Bearer ' + bearer.body
                }
            }).then((response) => {
                expect(response.body).to.have.property('level', lvl)    //if user level is 0, after retrieving jwt user
                expect(response.body).to.have.property('role', role)    //level will be promoted to level 1 and test will fail
            }).then(() => {
                cy.request({
                    method: 'GET',
                    url: 'http://auth.wb1.helioscloud.com/api/v1/profiles/me',
                    form: true,
                    headers: {
                        Authorization: 'Bearer ' + bearer.body
                    }
                }).then((response) => {
                    expect(response.body).to.have.property('first_name', first_name)
                    expect(response.body).to.have.property('last_name', last_name)
                    expect(response.body).to.have.property('dob', dob)
                    expect(response.body).to.have.property('address', address)
                    expect(response.body).to.have.property('postcode', postcode)
                    expect(response.body).to.have.property('city', city)
                    expect(response.body).to.have.property('country', country)
                })
            })
        })
    }
})