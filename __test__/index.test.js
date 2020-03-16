const supertest = require('supertest')
const app = require('../index.js')
const request = supertest(app)

describe('Test the root path', () => {
    test('It should response 404', (done) => {
        request.get('/api/v1').then((res) => {
            expect(res.statusCode).toBe(404)
            expect(res.body.status).toBe(false)
            expect(res.body.errors).toBe('WELCOME TO M*BILE L*GEND! :D')
            done()
            
        })
    })
    
})
