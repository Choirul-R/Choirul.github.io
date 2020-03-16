const User = require('../models/user.js');
const Review = require('../models/review.js');
const { success, error } = require('../helpers/response.js');
const Movie = require('../models/movie.js')

async function create(req, res) {
    try {
        let movie = await Movie.findOne({ _id: req.params._id })
        let review = await new Review({
            owner: req.headers.authorization._id,
            movie: movie.title,
            review: req.body.review,
            rating: req.body.rating
        })
        if (!movie) {
            return error(res, 'Movie doesn\'t seem to be exist!', 422)
        }
        if (movie.rater.indexOf(req.headers.authorization._id) !== -1) {
            return error(res, "You've already rate this movie!", 422)
        }
        review.category = await movie.category
        await movie['rater'].push(req.headers.authorization._id)
        await movie['rating'].push(review.rating)
        movie['overall_rating'] = await 0
        for (let i = 0; i < movie.rating.length; i++) {
            movie['overall_rating'] += movie.rating[i]
            if (i == movie.rating.length - 1) {
                movie['overall_rating'] /= movie.rating.length
            }
        }
        await movie.save()
        await review.save()
        success(res, review, 201)
    }
    catch (err) {
        error(res, err, 422)
    }
}

const show = (req, res) => {
    let page = parseInt(req.query.page || 1, 10)
    let limit = parseInt(req.query.limit || 10, 10)
    let category = req.query.category
    let movie = req.query.movie
    let _id = req.query._id
    if (category || movie) {
        if (!category) {
            Review.paginate({ movie: { $regex: movie, $options: 'i' } }, 
            { populate: {
                path: 'owner',
                select: ['_id', 'fullname', 'username', 'image']
            }, page, limit })
                .then(data => {
                    success(res, data, 200)
                })
        }
        else if (!movie) {
            Review.paginate({ category: category }, 
                { populate: 'owner', page, limit })
                .then(data => {
                    success(res, data, 200)
                })
        }
        else {
            Review.paginate({ category: category, movie: { $regex: movie, $options: 'i' } }, 
            { populate: {
                path: 'owner',
                select: ['_id', 'fullname', 'username', 'image']
            }, page, limit })
                .then(data => {
                    success(res, data, 200)
                })
        }
    }
    else if (_id) {
        Review.paginate({ owner: _id }, 
        { populate: {
            path: 'owner',
            select: ['_id', 'fullname', 'username', 'image']
        }, page, limit })
            .then(data => {
                success(res, data, 200)
            })
    }
    else {
        Review.paginate({}, { populate: {
            path: 'owner',
            select: ['_id', 'fullname', 'username', 'image']
        }, page, limit })
            .then(data => {
                success(res, data, 200)
            })
    }
}

async function update(req, res) {
    try {
        let review = await Review.findOne({ _id: req.params._id })
        let movie = await Movie.findOne({ title: review.movie })
        if (req.body.owner || req.body.movie || req.body.category) {
            return error(res, "Cannot change Review Owner or Movie Info!", 422)
        }
        if (req.body.rating) {
            let i = movie.rater.indexOf(req.headers.authorization._id)
            let ovRating = 0
            movie.rating[i] = req.body.rating
            movie.rating.forEach(data => { ovRating += data })
            movie.overall_rating = ovRating / movie.rating.length
            movie.markModified('rating')
            movie.save()
        }
        review.review = req.body.review
        review.rating = req.body.rating
        review.save()
        success(res, { changes: req.body }, 200)
    }
    catch (err) {
        error(res, err, 422)
    }
}

async function away(req, res) {
    try {
        let review = await Review.findOne({ _id: req.params._id })
        let movie = await Movie.findOne({ title: review.movie })
        let i = movie.rater.indexOf(req.headers.authorization._id)


        let ovRating = 0

        await movie.rating.splice(i, 1)
        await movie.rater.splice(i, 1)
        if (movie.rating.length == 0) {
            movie.overall_rating = 0
        }
        else {
            movie.rating.forEach(data => { ovRating += data })
            movie.overall_rating = ovRating / movie.rating.length
        }
        movie.save()
        review.remove()
        return success(res, { data: review, message: "Review removed" }, 200)
    }
    catch (err) {
        error(res, err, 422)
    }
}

async function share(req, res) {
    try {
        let review = await Review.findById(req.params._id)
        let user = await User.findById(req.headers.authorization._id)

        if (!review) {
            return error(res, "Review not found! Already deleted?", 422)
        }

        user.sharedReview.push(review._id)
        await user.save()

        success(res, user, 201)
    }
    catch (err) {
        error(res, err, 422)
    }
}
module.exports = {
    create,
    show,
    update,
    away,
    share
}