const express = require('express');
const app = express();
const prisma = require('./db');
const PORT = process.env.PORT || 3000;

app.use(express.json());

// GET /

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API!' });
});

// GET /ITEMS

app.get('/items', async (req, res, next) => {
  try {
    const items = await prisma.item.findMany();
    res.json(items);
  } catch (err) { next(err); }
});

// POST /ITEMS

app.post('/items', async (req, res, next) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: '`name` is required.' });
  }

  try {
    const item = await prisma.item.create({ data: { name: name.trim() } });
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// DELETE /ITEMS/:ID

app.delete('/items/:id', async (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: '`id` must be a positive integer.' });
  }

  try {
    const deleted = await prisma.item.delete({ where: { id } });
    res.json({ deleted });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: `Item ${id} not found.` });
    }
    next(err);
  }
});

// ERROR HANDLER

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode ?? 500).json({ error: err.message ?? 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});