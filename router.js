const express = require('express')
const router = express.Router()
const user = require('./controllers/userController.js')
const authenticate = require('./middlewares/auth.js')
const uploader = require('./middlewares/multer.js')
const movie = require('./controllers/movieController.js')
const review = require('./controllers/reviewController.js')

router.post('/users', user.register)
router.put('/users', user.login)
router.get('/users',authenticate, user.current)
router.put('/users/update', authenticate, user.update)
router.put('/users/uploadPhoto', authenticate, uploader, user.uploadPhoto)

router.post('/movies', authenticate, movie.addMovie)
router.get('/movies', movie.showMovie)
router.put('/movies/update/:_id', authenticate, movie.updateMovie)
router.delete('/movies/delete/:_id', authenticate, movie.deleteMovie)
router.put('/movies/uploadPhoto/:_id', authenticate, uploader, movie.uploadPhoto)
router.get('/movies/show/:_id', movie.showMovieById)
router.get('/movies/favorite/:_id', authenticate, movie.favorite)


router.post('/reviews/:_id', authenticate, review.create)
router.get('/reviews', review.show)
router.put('/reviews/:_id', authenticate, review.update)
router.delete('/reviews/:_id', authenticate, review.away)
router.get('/reviews/share/:_id', authenticate, review.share)
module.exports = router