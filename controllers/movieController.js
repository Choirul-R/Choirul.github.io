const Movie = require('../models/movie.js')
const User = require('../models/user.js')
const { success, error } = require('../helpers/response.js')
const Imagekit = require('imagekit')
const imagekit = new Imagekit({
    publicKey: "public_/O+g3Qhh2P4AsMyaFQYGexdmP+A=",
    privateKey: "private_sOR23h7FRm4ktLqfDbUSqubJaKc=",
    urlEndpoint: "https://ik.imagekit.io/choi/"
});

let addMovie = (req, res) => {
    let movie = new Movie({
        admin: req.headers.authorization._id,
        title: req.body.title,
        synopsis: req.body.synopsis,
        releaseDate: req.body.releaseDate,
        director: req.body.director,
        featuredSong: req.body.featuredSong,
        budget: req.body.budget,
        category: req.body.category,
        // rating: []
    })
    if (req.headers.authorization.isAdmin === true) {
        movie.
            save()
            .then(() => {
                success(res, movie, 201)
            })
            .catch(err => {
                error(res, err, 422)
            })
    } else { error(res, 'you are not an admin', 422) }
}

let showMovieById = (req, res) => {
    let page = parseInt(req.query.page || 1, 10)
    let limit = parseInt(req.query.limit || 10, 10)
    Movie.paginate({ _id: req.params._id }, { page, limit })
        .then((data) => {
            success(res, data, 200)
        })
        .catch((err) => {
            success(res, err, 422)
        })
}

let showMovie = (req, res) => {
    let page = parseInt(req.query.page || 1, 10)
    let limit = parseInt(req.query.limit || 10, 10)
    let category = req.query.category
    let title = req.query.movie
    if (category || title) {
        if (!category) {
            Movie.paginate({ title: { $regex: title, $options: 'i' } },
                { select: ['_id', 'title', 'image', 'category', 'releaseDate', 'overall_rating'], page, limit })
                .then(data => {
                    success(res, data, 200)
                })
        }
        else if (!title) {
            Movie.paginate({ category: category },
                { select: ['_id', 'title', 'image', 'category', 'releaseDate', 'overall_rating'], page, limit })
                .then(data => {
                    success(res, data, 200)
                })
        }
        else {
            Movie.paginate({ category: category, title: { $regex: title, $options: 'i' } }, { select: ['_id', 'title', 'image', 'category', 'releaseDate', 'overall_rating'], page, limit })
                .then(data => {
                    success(res, data, 200)
                })
        }
    }
    else {
        Movie.paginate({}, { select: ['_id', 'title', 'image', 'category', 'releaseDate', 'overall_rating'], page, limit })
            .then(data => {
                success(res, data, 200)
            })
    }
}

const uploadPhoto = (req, res) => {
    imagekit
        .upload({
            file: req.file.buffer.toString("base64"),
            fileName: `IMG-${Date.now()}`
        })
        .then(data => {
            return Movie.findOneAndUpdate({ admin: req.headers.authorization._id, _id: req.params._id }, {
                image: data.url
            })
                .select('-password -__v')
        })
        .then(data => {
            success(res, data, 200);
        })
        .catch(err => {
            error(res, err, 422);
        });
};

let updateMovie = (req, res) => {
        Movie.findOneAndUpdate({admin: req.headers.authorization._id, _id: req.params._id }, req.body)
            .then(data => {
                success(res, {data, changed: req.body}, 200)
            })
            .catch(err => {
                error(res, err, 422)
            })
    
}
let deleteMovie = (req, res) => {
        Movie.findOneAndRemove({ admin: req.headers.authorization._id, _id: req.params._id })
            .then(data => {
                success(res, { data: data, message: 'This movie has deleted' }, 200)
            })
            .catch(err => {
                error(res, err, 422)
            })
    }

async function favorite(req, res) {
    try {
        let movie = await Movie.findById(req.params._id).select('_id title image')
        let user = await User.findById(req.headers.authorization._id).populate({
            path: 'favorite',
            select: 'title image'
        })

        if (!movie) {
            return error(res, "Review not found! Already deleted, maybe?", 422)
        }

        user.favorite.unshift(movie._id)
        await user.save()

        success(res, user, 200)
    }
    catch (err) {
        error(res, err, 422)
    }
}


module.exports = {
    addMovie,
    showMovie,
    updateMovie,
    deleteMovie,
    uploadPhoto,
    showMovieById,
    favorite
}