const chai = require('chai')
const chaiHttp = require('chai-http')
const { should,
    expect } = chai
chai.use(chaiHttp)
const server = require('../index.js')
const fs = require('fs')

const User = require('../models/user.js')
const bcrypt = require('bcryptjs')

const fixtures = require('./fixtures/userFixture.js')
const staticSample = fixtures.create()
let token;

describe('User API', function () {

    before(function (done) {
        let encryptedPassword = bcrypt.hashSync(staticSample.password, 10);
        User.create({
            ...staticSample,
            password: encryptedPassword
        })
        done()
    })

    after(function () {
        return User.deleteMany({})
    })

    context('POST /api/v1/users', function () {
        it('Should Create new User', function () {
            chai.request(server)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(fixtures.create()))
                .end(function (err, res) {
                    expect(res.status).to.eq(201)
                    expect(res.body.data).to.be.an('object')
                    expect(res.body.data).to.have.property('_id')
                    expect(res.body.data).to.have.property('fullname')
                    expect(res.body.data).to.have.property('username')
                    expect(res.body.data).to.have.property('email')
                    token = res.body.data.token
                })
        })
    })
    context('PUT /api/v1/users', function () {
        it('Should Login User', function () {
            chai.request(server)
                .put('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(staticSample))
                .end(function (err, res) {
                    expect(res.status).to.eq(200)
                    expect(res.body.status).to.eq(true)
                    expect(res.body).to.be.an('object')
                })
        })
        it('Should not login User due to wrong email', function () {
            let data = ({
                ...staticSample,
                username: 'ricky',
                email: 'rickyganteng@gmail.com'
            })
            chai.request(server)
                .put('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    expect(res.status).to.eq(422)
                    expect(res.body.status).to.eq(false)
                    expect(res.body).to.be.an('object')
                    expect(res.body.error).to.be.a('string')
                    expect(res.body.error).to.eq('Email doesn\'t seem to be exist')
                })
        })
        it('Should not login User due to wrong password', function () {
            let data = ({
                ...staticSample,
                password: 'strukucu'
            })
            chai.request(server)
                .put('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    expect(res.status).to.eq(422)
                    expect(res.body).to.be.an('object')
                    expect(res.body.status).to.eq(false)
                    expect(res.body.error).to.eq('Password is wrong')
                    expect(res.body.error).to.be.an('string')
                })
        })
    })
    context('PUT /api/v1/users/update', function () {
        it('Should Update Succesfully', function () {
            chai.request(server)
                .put('/api/v1/users/update')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send(JSON.stringify({ fullname: 'rickymantap' }))
                .end(function (err, res) {
                    expect(res.status).to.eq(200)
                    expect(res.body).to.be.an('object')
                    expect(res.body.status).to.eq(true)
                    expect(res.body.data).to.have.property("fullname")
                    
                })
        })
        it('You cant change isAdmin', function () {
            chai.request(server)
                .put('/api/v1/users/update')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send(JSON.stringify({ isAdmin: true }))
                .end(function (err, res) {
                    expect(res.status).to.eq(422)
                    expect(res.body).to.be.an('object')
                    expect(res.body.status).to.eq(false)
                    expect(res.body.error).to.eq('Cannot change status or email')
                })
        })
        it('You cant change email', function () {
            chai.request(server)
                .put('/api/v1/users/update')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send(JSON.stringify({ email: 'true@gmail.com' }))
                .end(function (err, res) {
                    expect(res.status).to.eq(422)
                    expect(res.body).to.be.an('object')
                    expect(res.body.status).to.eq(false)
                    expect(res.body.error).to.eq('Cannot change status or email')
                })
        })
        it('You cant update because your token is invalid', function () {
            chai.request(server)
                .put('/api/v1/users/update')
                .set('Content-Type', 'application/json')
                .set('Authorization', '1234')
                .send(JSON.stringify({ fullname: 'Rickyganteng' }))
                .end(function (err, res) {
                    expect(res.status).to.eq(401)
                    expect(res.body).to.be.an('object')
                    expect(res.body.status).to.eq(false)
                    expect(res.body.errors).to.eq('Invalid token')
                })
        })
    })
    context('GET /api/v1/users', function () {
        it('Should get the current User', function () {
            chai.request(server)
                .get('/api/v1/users')
                .set('Content-Type', 'application/json')
                .set('authorization', token)
                .end(function (err, res) {
                    expect(res.status).to.eq(200)
                    expect(res.body.status).to.eq(true)
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('status')
                    expect(res.body.data).to.have.property('_id')
                    expect(res.body.data).to.have.property('fullname')
                    expect(res.body.data).to.have.property('username')
                    expect(res.body.data).to.have.property('email')
                })
        })
    })
    // context('PUT /api/v1/users/uploadPhoto', function () {
    //     it('Should succesfully upload Photo', function () {
    //         chai.request(server)
    //             .put('/api/v1/users/uploadPhoto')
    //             .set('Content-Type', 'multipart/form-data')
    //             .set('Authorization', token)
    //             .attach('image', fs.readFileSync("./harold.jpeg"), 'harold.jpeg')
    //             .end(function (err, res) {
    //                 console.log(res.body)
    //             })

    //     })
    // })

})