const supertest = require('supertest')
const app = require('../index.js')
const request = supertest(app)
const fs = require('fs')
const jwt = require('jsonwebtoken')
const Movie = require('../models/review.js')
const User = require('../models/user.js')
const Review = require('../models/review.js')
const fixture = require('./fixtures/userFixture')
var newUser = fixture.create()
let payload;
let userId;
let id;
let reviewId;
let newMovie = {
    title: '1',
    synopsis: 'pada suatu hari mas Alex',
    releaseDate: 12 - 12 - 12,
    director: 'si eek',
    featuredSong: 'Thomas the dank engine',
    budget: '12 jt',
    category: 'Anime',
}

beforeAll((done) => {
    User.create({
        ...newUser,
        username: 'kamyucantik',
        email: 'kamyucantik@gmail.com'
    })
    payload = jwt.sign({ _id: newUser._id, isAdmin: newUser.isAdmin }, process.env.SECRET_KEY)
    userId = newUser._id
    done()
})

afterAll(() => {
    return Review.deleteMany({})
})

let newReview = {
    movie: 'mas Alex ganteng',
    rating: 5,
    review: 'filmnya mantap'
}

describe('create movie', () => {
    test('Create movie', (done) => {
        request.post('/api/v1/movies')
            .set('Content-Type', 'application/json')
            .set('Authorization', payload)
            .send(JSON.stringify(newMovie))
            .then((res) => {
                id = res.body.data._id
                done()
            })
    })
})

describe('POST /api/v1/reviews', () => {
    test('should create post and rating', (done) => {
        request.post(`/api/v1/reviews/${id}`)
            .set('Content-Type', 'application/json')
            .set('Authorization', payload)
            .send(JSON.stringify(newReview))
            .then((res) => {
                reviewId = res.body.data._id
                expect(res.statusCode).toBe(201)
                expect(res.body.status).toBe(true)
                expect(res.body.data).not.toBe(null)
                done()
            })
    })
    test('should create post and rating', (done) => {
        request.post(`/api/v1/reviews/123`)
            .set('Content-Type', 'application/json')
            .set('Authorization', payload)
            .send(JSON.stringify(newReview))
            .then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(false)
                expect(res.body.error.message).toBe('Cast to ObjectId failed for value "123" at path "_id" for model "Movie"')
                done()
            })
    })
})

describe('GET /api/v1/reviews', () => {
    test('Should get the review by', (done) => {
        request.get('/api/v1/reviews?movie=1')
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body.data).not.toBe(null)
                done()
            })
    })
    test('Should get the review by', (done) => {
        request.get('/api/v1/reviews?category=Anime')
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body.data).not.toBe(null)
                done()
            })
    })
    test('Should get the review by', (done) => {
        request.get('/api/v1/reviews?category=Anime&movie=1')
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body.data).not.toBe(null)
                done()
            })
    })
    test('Should get the review by', (done) => {
        request.get(`/api/v1/reviews?owner=${userId}`)
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body.data).not.toBe(null)
                done()
            })
    })
    test('Should get the review by', (done) => {
        request.get('/api/v1/reviews?page=1')
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body.data).not.toBe(null)
                done()
            })
    })
})

describe('PUT /api/v1/reviews/:_id', () => {
    test('should succesfully change data', (done) => {
        request.put(`/api/v1/reviews/${reviewId}`)
            .set('Content-Type', 'application/json')
            .set('Authorization', payload)
            .send(JSON.stringify({
                rating: 5,
                review: 'mantap lah'
            }))
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body.data).toHaveProperty('changes')
                expect(res.body.data.changes).not.toBe(null)
                done()
            })
    })
    test('should succesfully change data', (done) => {
        request.put(`/api/v1/reviews/123`)
            .set('Content-Type', 'application/json')
            .set('Authorization', payload)
            .send(JSON.stringify({
                rating: 5,
                review: 'mantap lah'
            }))
            .then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(false)
                expect(res.body.error.message).toBe('Cast to ObjectId failed for value "123" at path "_id" for model "Review"')
                done()
            })
    })
})

describe('GET /api/v1/reviews/share/:_id', () => {
    test('should shared the review', (done) => {
        request.get(`/api/v1/reviews/share/${reviewId}`)
            .set('Authorization', payload)
            .then((res) => {
                console.log(res.body)
                done()
            })
    })
})

describe('DELETE/api/v1/reviews/:_id', () => {
    test('should delete the reviews', (done) => {
        request.delete(`/api/v1/reviews/${reviewId}`)
            .set('Authorization', payload)
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body.data.message).toBe('Review removed')
                expect(res.body.data).not.toBe(null)
                done()
            })
    })
    test('should delete the reviews', (done) => {
        request.delete(`/api/v1/reviews/123`)
            .set('Authorization', payload)
            .then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(false)
                expect(res.body.error.message).toBe('Cast to ObjectId failed for value "123" at path "_id" for model "Review"')
                done()
            })
    })
})

