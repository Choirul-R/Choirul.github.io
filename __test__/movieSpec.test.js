const supertest = require('supertest')
const app = require('../index.js')
const request = supertest(app)
const jwt = require('jsonwebtoken')
const User = require('../models/user.js')
const Movie = require('../models/movie.js')
const fixture = require('./fixtures/userFixture.js')
const fs = require('fs')
let newUser = fixture.create()
let payload;
let id;

beforeAll((done) => {
    User.create({
        ...newUser,
        username: 'sayang sekali',
        email: 'sayang@gmail.com'
    })
    payload = jwt.sign({ _id: newUser._id, isAdmin: newUser.isAdmin }, process.env.SECRET_KEY)
    done()
})

afterAll(() => {
    return Movie.deleteMany({})
})

let newMovie = {
    title: 'mas Alex',
    synopsis: 'pada suatu hari mas Alex',
    releaseDate: 12 - 12 - 12,
    director: 'si eek',
    featuredSong: 'Thomas the dank engine',
    budget: '12 jt',
    category: 'Anime',
}

describe('POST /api/v1/movies', () => {
    test('should create new movie', (done) => {
        request.post('/api/v1/movies')
            .set('Content-Type', 'application/json')
            .set('Authorization', payload)
            .send(JSON.stringify(newMovie))
            .then((res) => {
                id = res.body.data._id
                expect(res.statusCode).toBe(201)
                expect(res.body.status).toBe(true)
                expect(res.body.data).not.toBe(null)
                done()
            })
    })
    test('Should fail create movie because duplicate title', (done) => {
        request.post('/api/v1/movies')
            .set('Content-Type', 'application/json')
            .set('Authorization', payload)
            .send(JSON.stringify(newMovie))
            .then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(false)
                expect(res.body.error.errmsg).toBe('E11000 duplicate key error collection: test.movies index: title_1 dup key: { title: "mas Alex" }')
                done()
            })
    })
})

describe('GET /api/v1/movies', () => {
    test('should get the movie by the title', (done) => {
        request.get('/api/v1/movies?title=mas Alex')
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body).toHaveProperty('data')
                done()
            })
    })
    test('Should get the movie by category', (done) => {
        request.get('/api/v1/movies?category=Anime')
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body).toHaveProperty('data')
                done()
            })
    })
    test('Should get the movie by category', (done) => {
        request.get('/api/v1/movies?title=mas alex category=Anime')
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body).toHaveProperty('data')
                done()
            })
    })
    test('Should get the movie by category', (done) => {
        request.get('/api/v1/movies')
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body).toHaveProperty('data')
                done()
            })
    })
})

describe('GET /api/v1/movies/show/:_id', () => {
    test('Should show the movie by the _id', (done) => {
        request.get(`/api/v1/movies/show/${id}`)
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body).toHaveProperty('data')
                done()
            })

    })
    test('Should show the movie by the _id', (done) => {
        request.get(`/api/v1/movies/show/123`)
            .then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(true)
                expect(res.body).toHaveProperty('data')
                done()
            })

    })
})

describe('PUT /api/v1/movies/uploadPhoto/:_id', () => {
    test('Should succesfully upload Photo', (done) => {
        request.put(`/api/v1/movies/uploadPhoto/${id}`)
            .set('Content-Type', 'multipart/form-data')
            .set('Authorization', payload)
            .attach('image', fs.readFileSync('harold.jpeg'), 'harold.jpeg')
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body).not.toBe(null)
                done()
            })
    })
})

describe('PUT /api/v1/movies/update/:_id', () => {
    test('should succesfully update movies', (done) => {
        request.put(`/api/v1/movies/update/${id}`)
            .set('Content-Type', 'application/json')
            .set('Authorization', payload)
            .send(JSON.stringify({ title: 'mas Alex ganteng' }))
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body.data).not.toBe(null)
                expect(res.body.data.changed).not.toBe(null)
                done()
            })
    })
    test('should failed update because id is invalid', (done) => {
        request.put(`/api/v1/movies/update/123`)
            .set('Content-Type', 'application/json')
            .set('Authorization', payload)
            .send(JSON.stringify({ title: 'mas Alex ganteng' }))
            .then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(false)
                expect(res.body.error.message).toBe('Cast to ObjectId failed for value "123" at path "_id" for model "Movie"')
                done()
            })
    })
})

describe('GET /api/v1/movies/favorite/:_id', () => {
    test('Should succesfully added to favorite', (done) => {
        request.get(`/api/v1/movies/favorite/${id}`)
            .set('Authorization', payload)
            .then((res) => {
                done()
            })
    })
})

describe('/api/v1/movies/delete/:_id', () => {
    test('should succesfully delete movie', (done) => {
        request.delete(`/api/v1/movies/delete/${id}`)
            .set('Authorization', payload)
            .then((res) => {
                expect(res.statusCode).toBe(200)
                expect(res.body.status).toBe(true)
                expect(res.body.data.message).toBe('This movie has deleted')
                done()
            })
    })
    test('should succesfully delete movie', (done) => {
        request.delete(`/api/v1/movies/delete/123`)
            .set('Authorization', payload)
            .then((res) => {
                expect(res.statusCode).toBe(422)
                expect(res.body.status).toBe(false)
                expect(res.body.error.message).toBe('Cast to ObjectId failed for value "123" at path "_id" for model "Movie"')
                done()
            })
    })
})