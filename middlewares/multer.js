const multer = require('multer')

const uploader = multer().single('image')
module.exports = uploader