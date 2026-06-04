const prisma = require('../db');

function parseId(param) {
  const id = parseInt(param, 10);
  return isNaN(id) || id < 1 ? null : id;
}

async function getAll(req, res, next) {
  try {
    const items = await prisma.item.findMany();
    res.json(items);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: '`id` must be a positive integer.' });

  try {
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) return res.status(404).json({ error: `Item ${id} not found.` });
    res.json(item);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: '`name` is required.' });
  }
  try {
    const item = await prisma.item.create({ data: { name: name.trim() } });
    res.status(201).json(item);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: '`id` must be a positive integer.' });

  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: '`name` is required.' });
  }

  try {
    const item = await prisma.item.update({
      where: { id },
      data:  { name: name.trim() },
    });
    res.json(item);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: `Item ${id} not found.` });
    next(err);
  }
}

async function remove(req, res, next) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: '`id` must be a positive integer.' });

  try {
    const deleted = await prisma.item.delete({ where: { id } });
    res.json({ deleted });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: `Item ${id} not found.` });
    next(err);
  }
}

module.exports = { getAll, getOne, create, update, remove };