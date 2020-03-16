function success(res, data, statusCode) {
    return res.status(statusCode).json({
        status: true,
        data: data
    })
}

function error(res, err, statusCode) {
    return res.status(statusCode).json({
        status: false,
        error: err
    })
}
module.exports = {
    success,
    error
};