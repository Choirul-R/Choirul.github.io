const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const movieSchema = new Schema({
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    image: String,
    synopsis: {
        type: String,
        required: true  
    },
    releaseDate: {
        type: Date
    },
    director: {
        type: String,
        required: true
    },
    featuredSong: {
        type: String,
        required: true
    },
    budget: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Anime', 'Real']
    },
    rater: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    rating: Array,
    overall_rating: Number
})

movieSchema.plugin(mongoosePaginate)
const Movie = mongoose.model('Movie', movieSchema)

module.exports = Movie