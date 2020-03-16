const mongoose = require('mongoose')
const Schema = mongoose.Schema

var validateEmail = function(email) {
    var re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    image: String,
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address']
    },
    password:{
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean
    },
    sharedReview: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    favorite: [{
        type: Schema.Types.ObjectId,
        ref: 'Movie'
    }]
})

const User = mongoose.model('User', userSchema)
module.exports = User