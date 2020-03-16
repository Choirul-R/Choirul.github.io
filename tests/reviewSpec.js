const chai = require('chai')
const chaiHttp = require('chai-http')
const { should,
    expect } = chai
chai.use(chaiHttp)
const server = require('../index.js')
const fs = require('fs')
const User = require('../models/user.js')
const Movie = require('../models/movie.js')
const Review = require('../models/review.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const fixtures = require('./fixtures/userFixture.js')
const staticSample = fixtures.create()
let token;
let id;

let newMovie = {
    title: 'mas Alex',
    synopsis: 'pada suatu hari mas Alex menjadi jelek',
    releaseDate: 11 - 11 - 11,
    director: 'Alex Si Ganteng',
    featuredSong: 'Young lex - GGS',
    budget: '200 juta',
    category: 'Real'
}

let newReview = {
    movie: 'mas Alex',
    review: 'sih Alex ganteng BANGET!!!!',
    rating: 1
}
describe('Review Collection', function () {

    before(function (done) {
        let encryptedPassword = bcrypt.hashSync(staticSample.password, 10);
        User.create({
            ...staticSample,
            password: encryptedPassword
        })
        Movie.create(
            newMovie
        )
        token = jwt.sign({ _id: staticSample._id, isAdmin: staticSample.isAdmin }, process.env.SECRET_KEY)
        done()
    })

    after(function () {
        return Review.deleteMany({})
    })

    context('POST api/v1/reviews', function () {
        it('Should create Review', function () {
            chai.request(server)
                .post('/api/v1/reviews')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send(JSON.stringify(newReview))
                .end(function (err, res) {
                    expect(res.status).to.eq(201)
                    expect(res.body.status).to.eq(true)
                    expect(res.body.data).to.have.property('_id')
                    expect(res.body.data).to.have.property('movie')
                    expect(res.body.data).to.have.property('review')
                    expect(res.body.data).to.have.property('rating')
                    expect(res.body.data).to.have.property('category')
                })
        })

    })
})