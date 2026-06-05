const express      = require('express');
const { PORT }     = require('./config');
const itemRouter   = require('./routes/item.router');
const authorRouter = require('./routes/author.router');
const errorHandler = require('./middleware/errorHandler');
const app = express();

app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Welcome to the API!' }));
app.use('/items',   itemRouter);
app.use('/authors', authorRouter);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));