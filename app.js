const express = require('express');
const itemRoutes = require('./routes/item.router');
const authorRoutes = require('./routes/author.router');
const errorHandler = require('./middleware/error.handler')
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Welcome to the Item API!' }));
app.use('/items', itemRoutes);
app.use('/authors', authorRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));