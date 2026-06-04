const prisma = require('../db');

function parseId(param) {
    const id = parseInt(param, 10);
    return isNaN(id) || id < 1 ? null : id;
}

async function getAll(req, res, next) {
    try {
        const authors = await prisma.author.findMany({
            include: { items: true },
        });
        res.json(authors);
    } catch (err) { next(err); }
}

async function getOne(req, res, next) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: '`id` must be a positive integer.' });

    try {
        const author = await prisma.author.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!author) return res.status(404).json({ error: `Author ${id} not found.` });
        res.json(author);
    } catch (err) { next(err); }
}

async function create(req, res, next) {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: '`name` is required.' });
    }
    try {
        const author = await prisma.author.create({ data: { name: name.trim() } });
        res.status(201).json(author);
    } catch (err) { next(err); }
}

async function remove(req, res, next) {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: '`id` must be a positive integer.' });

    try {
        const deleted = await prisma.author.delete({ where: { id } });
        res.json({ deleted });
    } catch (err) {
        if (err.code === 'P2025') return res.status(404).json({ error: `Author ${id} not found.` });
        next(err);
    }
}

module.exports = { getAll, getOne, create, remove };