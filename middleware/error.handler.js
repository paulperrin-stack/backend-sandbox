function errorHandler(err, req, res, next) {
    console.error(err);

    if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Record not found.' });
    }

    if (err.code === 'P2003') {
        return res.status(409).json({ error: 'Cannot delete - related records exts.' });
    }

    res.status(err.statusCode ?? 500).json({ error: err.message ?? 'Internal Server Error' });
}

module.exports = errorHandler;