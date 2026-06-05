function validateName(req, res, next) {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: '`name` is required.'});
    }

    req.body.name = name.trim();
    next();
}

function validateId(req, res, next) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id) || id < 1) {
        return res.status(400).json({ error: '`id` must be a positive integer.' });
    }

    req.id = id;
    next();
}

