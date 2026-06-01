const express = require('express');
const app = express();
const prisma = require('./db');
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes

    // GET /items - return all items
app.get('/items', async (req, res, next) => {
    try {
        const items = await prisma.item.findMany();
        res.json(items);
    } catch (err) { next(err); }
});

    // POST /items - create a new item { "name": "..." }
app.post('/items', async (req, res, next) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: '`name` is required.'});
    }
    try {
        const item = await prisma.item.create({ data: { name: name.trim() } });
        res.status(201).json(item);
    } catch (err) { next(err); }
});

    // DELETE /items/:id - remove an item by id
app.delete('/items/:id', async (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: '`id` must be an integer.' });
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

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode ?? 500).json({ error: err.message ?? 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));