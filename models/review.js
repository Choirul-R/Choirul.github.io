const mongoose = require('mongoose')
const paginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref:'User',
        unique: false
    },
    movie: {
        type: String
    },
    review: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
})

reviewSchema.plugin(paginate)
const Review = mongoose.model('Review', reviewSchema)
module.exports = Review