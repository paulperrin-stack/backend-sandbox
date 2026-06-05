const prisma = require('../db');

async function getAll(req, res, next) {
    try {
        const items = await prisma.item.findMany();
        res.json(items);
    } catch (err) { next(err); }
}

async function getOne(req, res, next) {
    try {
        const item = await prisma.item.findUnique({ where: { id: req.id } });
        if (!item) return res.status(404).json({ error: `Item ${req.id} not found.` });
        res.json(item);
    } catch (err) { next(err); }
}

async function create(req, res, next) {
    try {
        const item = await prisma.item.create({ data: { name: req.body.name } });
        res.status(201).json(item);
    } catch (err) { next(err); }
}

async function update(req, res, next) {
    try {
        const item = await prisma.item.update({
            where: { id: req.id },
            data:  { name: req.body.name },
        });
        res.json(item);
    } catch (err) { next(err); }
}

async function remove(req, res, next) {
    try {
        const deleted = await prisma.item.delete({ where: { id: req.id } });
        res.json({ deleted });
    } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, update, remove };