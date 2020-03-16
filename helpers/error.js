exports.notFound = (req, res) => {
    res.status(404).json({
        status: false,
        errors: 'WELCOME TO M*BILE L*GEND! :D'
    })
}

exports.internalServerError = (req, res) => {
    res.status(500).json({
        status: false,
        errors: 'Our server is on maintenance, please come back some time later'
    })
}