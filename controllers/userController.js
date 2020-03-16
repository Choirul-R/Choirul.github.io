const bcrypt = require("bcrypt");
const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const { success, error } = require("../helpers/response.js");
const Imagekit = require("imagekit");
const imagekit = new Imagekit({
    publicKey: "public_/O+g3Qhh2P4AsMyaFQYGexdmP+A=",
    privateKey: "private_sOR23h7FRm4ktLqfDbUSqubJaKc=",
    urlEndpoint: "https://ik.imagekit.io/choi/"
});

// User Register API
function register(req, res) {
    let newUser = new User({
        fullname: req.body.fullname,
        username: req.body.username,
        email: req.body.email,
        isAdmin: false,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
    });

    newUser
        .save()
        .then(() => {
            let token = jwt.sign({ _id: newUser._id, isAdmin: newUser.isAdmin }, process.env.SECRET_KEY)
            success(res, {
                _id: newUser._id,
                fullname: newUser.fullname,
                username: req.body.username,
                email: newUser.email,
                token: token
            }, 201);
        })
        .catch(err => {
            error(res, err, 422);
        });
}

// User Login API
function login(req, res) {
    User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] })
        .then(data => {
            if (bcrypt.compareSync(req.body.password, data.password)) {
                let token = jwt.sign({ _id: data._id, isAdmin: data.isAdmin }, process.env.SECRET_KEY);
                success(res, token, 200);
            } else {
                error(res, "Password is wrong", 422);
            }
        })
        .catch(() => {
            error(res, "Email doesn't seem to be exist", 422);
        });
}

// User Update Photo API
const uploadPhoto = (req, res) => {
    imagekit
        .upload({
            file: req.file.buffer.toString("base64"),
            fileName: `IMG-${Date.now()}`
        })
        .then(data => {
            return User.findByIdAndUpdate(req.headers.authorization._id, {
                image: data.url
            }, { useFindAndModify: false })
                .select('-password -__v')
        })
        .then(data => {
            success(res, data, 200);
        })
        .catch(err => {
            error(res, err, 422);
        });
};

function update(req, res) {
    if (req.body.hasOwnProperty('password')) {
        let pass = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
        User.updateOne({ _id: req.headers.authorization._id }, { $set: { password: pass } })
            .then(() => {
                success(res, 'Your password has been changed', 200);
            })
            .catch(err => {
                error(res, err, 422);
            });
    } if (req.body.isAdmin || req.body.email) {
        return error(res, "Cannot change status or email", 422)
    } else {
        User.updateOne({ _id: req.headers.authorization._id }, { $set: req.body })
            .then(() => {
                success(res, req.body, 200);
            })
            .catch(err => {
                error(res, err, 422);
            });
    }
}

function current(req, res) {
    User.findOne({ _id: req.headers.authorization._id })
        .select('-password -__v')
        .populate({
            path: 'favorite',
            select: 'title image'
        })
        .then(data => success(res, data, 200))
}

module.exports = {
    register,
    login,
    uploadPhoto,
    update,
    current
};
