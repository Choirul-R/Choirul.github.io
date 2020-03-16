const supertest = require('supertest')
const app = require('../index.js')
const request = supertest(app)
const fs = require('fs')
const User = require('../models/user.js')
const fixture = require('./fixtures/userFixture')
var newUser = fixture.create()
var token;
var id;
var payload;

var mantap;
var failUser = ({
    ...newUser,
    email: ''
})

afterAll(() => {
    return User.deleteMany({})
})

describe('POST /api/v1/users', () => {
    test('It should Create new User', (done) => {
        request.post('/api/v1/users')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify((newUser))).then((res) => {
                expect(res.statusCode).toBe(201)
                expect(res.body.status).toBe(true)
                expect(res.body.data).toHaveProperty('_id')
                expect(res.body.data).toHaveProperty('fullname')
                expect(res.body.data).toHaveProperty('username')
                expect(res.body.data).toHaveProperty('email')
                expect(res.body.data).toHaveProperty('token')
                token = res.body.data.token
                id = res.body.data._id
                done()
            })
    })
    test('It should not Create new User because email already exist', (done) => {
        request.post('/api/v1/users')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify((newUser))).then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(false)
                expect(res.body.error).toHaveProperty('errmsg')
                done()
            })
    })
    test('It should not Create new User because email is required', (done) => {
        request.post('/api/v1/users')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify((failUser))).then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(false)
                expect(res.body).toHaveProperty('error')
                done()
            })
    })
})

describe('PUT /api/v1/users', () => {
    test('Should login and generate the token', (done) => {
        request.put('/api/v1/users')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(newUser)).then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body).toHaveProperty('data')
                done()
            })
    })
    test('Should not generate token beacuse password is wrong', (done) => {
        request.put('/api/v1/users')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({
                ...newUser,
                password: '123'
            })).then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(false)
                expect(res.body.error).toBe('Password is wrong')
                done()
            })
    })
    test('Should not generate the token because email doest seems to be exist', (done) => {
        request.put('/api/v1/users')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({
                ...newUser,
                email: 'strukucu@gmail.com',
                username: 'strukuc'
            })).then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(false)
                expect(res.body.error).toBe("Email doesn't seem to be exist")
                done()
            })
    })
})

describe('GET /api/v1/users', () => {
    test('Should get the current user', (done) => {
        request.get('/api/v1/users')
            .set('Authorization', token).then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body.data).not.toBe(null)
                done()
            })
    })
    test('Should not get the current user because token is invalid', (done) => {
        request.get('/api/v1/users')
            .set('Authorization', '123').then((res) => {
                expect(res.statusCode).toBe(401)
                expect(res.body.status).toBe(false)
                expect(res.body.errors).toBe('Invalid token')
                done()
            })
    })
})

describe('put /api/v1/users/update', () => {
    test('Should succesfully update User', (done) => {
        request.put('/api/v1/users/update')
            .set('Content-Type', 'application/json')
            .set('Authorization', token)
            .send(JSON.stringify({ fullname: 'ricky Ganteng' }))
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body).toHaveProperty('data')
                done()
            })
    })
    test('cannot update email', (done) => {
        request.put('/api/v1/users/update')
            .set('Content-Type', 'application/json')
            .set('Authorization', token)
            .send(JSON.stringify({ isAdmin: true }))
            .then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(false)
                expect(res.body.error).toBe('Cannot change status or email')
                done()
            })
    })
})

describe('PUT /api/v1/users/uploadPhoto', () => {
    test('Should succesfully upload Photo', (done) => {
        request.put('/api/v1/users/uploadPhoto')
            .set('Content-Type', 'multipart/form-data')
            .set('Authorization', token)
            .attach('image', fs.readFileSync('harold.jpeg'), 'harold.jpeg')
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body).not.toBe(null)
                done()
            })
    })
    test('Should not successfully upload photo because its not an images', (done) => {
        request.put('/api/v1/users/uploadPhoto')
            .set('Content-Type', 'application/json')
            .set('Authorization', token)
            .send('image', fs.readFileSync('harold.jpeg'), 'harold.jpeg')
            .then((res) => {
                console.log(res.body)
                done()
            })
    })
})

