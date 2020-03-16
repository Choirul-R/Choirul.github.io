const chai = require('chai')
const chaiHttp = require('chai-http')
const { should,
    expect } = chai
chai.use(chaiHttp)
const server = require('../index.js')
const fs = require('fs')
const User = require('../models/user.js')
const Movie = require('../models/movie.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const fixtures = require('./fixtures/userFixture.js')
const staticSample = fixtures.create()
let token;
let id;

let newMovie = {
    title: 'ganteng',
    synopsis: 'pada suatu hari siGanteng menjadi jelek',
    releaseDate: 12 - 12 - 12,
    director: 'Panji Si Petualang',
    featuredSong: 'Young lex - WOLES',
    budget: '10 juta',
    category: 'Anime'
}

describe('Movie Collection', function () {

    before(function (done) {
        let encryptedPassword = bcrypt.hashSync(staticSample.password, 10);
        User.create({
            ...staticSample,
            password: encryptedPassword
        })
        token = jwt.sign({ _id: staticSample._id, isAdmin: staticSample.isAdmin }, process.env.SECRET_KEY)
        done()
    })

    after(function () {
        return Movie.deleteMany({})
    })
    context('POST api/v1/movies', function () {
        it('Should Post a new movie', function () {
            chai.request(server)
                .post('/api/v1/movies')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send(JSON.stringify(newMovie))
                .end(function (err, res) {
                    id = res.body.data._id
                    expect(res.status).to.eq(201)
                    expect(res.body).to.have.property('status')
                    expect(res.body).to.have.property('data')
                    expect(res.body).to.be.an('object')
                    expect(res.body.status).to.eq(true)
                })
        })
        it('Should not post movie because you are not an admin', function () {
            var data = ({
                ...staticSample,
                isAdmin: false
            })
            var tempToken = jwt.sign({ _id: data._id, isAdmin: data.isAdmin }, process.env.SECRET_KEY)
            chai.request(server)
                .post('/api/v1/movies')
                .set('Content-Type', 'application/json')
                .set('Authorization', tempToken)
                .send(JSON.stringify(data))
                .end(function (err, res) {
                    expect(res.status).to.eq(422)
                    expect(res.body).to.be.an('object')
                    expect(res.body.status).to.eq(false)
                    expect(res.body.error).to.eq('you are not an admin')
                })

        })
    })
    context('GET api/v1/movies', function () {
        it('Should show movie', function () {
            chai.request(server)
                .get('/api/v1/movies?page=1&limit=10')
                .end(function (err, res) {
                    expect(res.status).to.eq(200)
                    expect(res.body.status).to.eq(true)
                    expect(res.body).to.be.an('object')
                    expect(res.body).to.have.property('data')
                    expect(res.body.data).to.have.property('docs')
                })
        })
    })
    context('PUT api/v1/update', function () {
        it('Should succesfully update movie', function () {
            chai.request(server)
                .put(`/api/v1/movies/update/${id}`)
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send(JSON.stringify({ title: 'ricky ganteng' }))
                .end(function (err, res) {
                    expect(res.status).to.eq(200)
                    expect(res.body.status).to.eq(true)
                    expect(res.body).to.be.an('object')
                    expect(res.body.data).to.have.property('data')
                    expect(res.body.data).to.have.property('changed')
                })
        })
        it('Should succesfully update movie', function () {
            chai.request(server)
                .put(`/api/v1/movies/update/1234`)
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send(JSON.stringify({ title: 'ricky ganteng' }))
                .end(function (err, res) {
                    expect(res.status).to.eq(422)
                    expect(res.body.status).to.eq(false)
                    expect(res.body.error.message).to.eq('Cast to ObjectId failed for value "1234" at path "_id" for model "Movie"')
                })
        })
        it('Should not succesfully update movie due wrong movie id', function () {
            chai.request(server)
                .put('/api/v1/movies/update/123')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send(JSON.stringify({ title: 'ricky ganteng' }))
                .end(function (err, res) {
                    expect(res.status).to.eq(422)
                    expect(res.body.status).to.eq(false)
                    expect(res.body).to.have.property('error')
                })
        })
        it('Should not succesfully update movie due to invalid token', function () {
            chai.request(server)
                .put(`/api/v1/movies/update/${id}`)
                .set('Content-Type', 'application/json')
                .set('Authorization', '123')
                .send(JSON.stringify({ title: 'ricky ganteng' }))
                .end(function (err, res) {
                    expect(res.status).to.eq(401)
                    expect(res.body).to.be.an('object')
                    expect(res.body.status).to.eq(false)
                    expect(res.body.errors).to.eq('Invalid token')
                })
        })
    })
    context('DELETE /api/v1/movies/delete', function () {
        it('Should Delete the movies', function () {
            chai.request(server)
                .delete(`/api/v1/movies/delete/${id}`)
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .end(function (err, res) {
                    expect(res.status).to.eq(200)
                    expect(res.body).to.have.property('data')
                    expect(res.body.status).to.eq(true)
                    expect(res.body.data).to.have.property('message')
                    expect(res.body.data.message).to.eq('This movie has been deleted')
                })
        })
        it('Should failed to delete to movies', function () {
            chai.request(server)
                .delete(`/api/v1/movies/delete/1234`)
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .end(function (err, res) {
                    expect(res.status).to.eq(422)
                    expect(res.body.status).to.eq(false)
                    expect(res.body.error.message).to.eq('Cast to ObjectId failed for value "1234" at path "_id" for model "Movie"')
                })
        })
        it('Should failed to delete to movies', function () {
            chai.request(server)
                .delete(`/api/v1/movies/delete/1234`)
                .set('Content-Type', 'application/json')
                .set('Authorization', '123456')
                .end(function (err, res) {
                    expect(res.status).to.eq(401)
                    expect(res.body).to.be.an('object')
                    expect(res.body.status).to.eq(false)
                    expect(res.body.errors).to.eq('Invalid token')
                })
        })
    })
})