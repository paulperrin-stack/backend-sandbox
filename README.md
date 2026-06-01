# backend-sandbox

- Why does express.json() go first?

express.json() Middleware runs in order. If it's not registered before your routes, req.body is undefined when your handler fires.

- Why 4 params on the error handler?

4 params on the error handler Express detects error handlers by counting parameters, not by name. Declare fewer than 4 and it never gets called - no warning, it just silently skips it.

- What happens on server restart?

Server restart items is a JS variable in process memory. Process dies, memory gone. That's the whole point of adding a database.

- What goes in DATABASE_URL?

A connection string tells Prisma where your database is and how to authenticate. Schema, username, password, host, port, database name - all in one string. Prisma reads it from .env so you never hardcode credentials in your code.

- What does migrate dev do?

Three things in one command: write the SQL file, runs it against your database to create or alter the tables, then regenerates the Prisma client to match your updated schema. The SQL file get committed to version control so your team can replay the exact same migrations.

- Why $disconnect()?

Prisma holds open a connection pool while it's running. In a server that's fine - you want those connections alive. In a one-off script the process would hang after main() finished because the pool is still open. $disconnect() closes it cleanly so the script actually exits.

- Why async on every route?

Prisma queries return promises. async/await is how you wait for them. Without it you'd call prisma.item.findMany() and move on before the database responds - the route send nothing back. The try/catch matters too: if you don't catch a rejected promise and pass it to next(err). Express never sees the error and the request hangs.

- What is error code P2025?

Prisma's "record not found" error. With Prisma, calling delete on a non-existent record throws instead of returning null — so you catch it and convert it to a clean 404. Without that check it'd fall through to the global error handler and return a 500, which is the wrong status code.

- Why one PrismaClient instance?

Each new PrismaClient() opens a connection pool — a set of persistent connections to Postgres. If you instantiated it per-route or per-request you'd open a new pool on every call and exhaust the database's connection limit fast. Node caches require() calls, so every file that does require('./db') gets the same instance back. One pool, shared across the whole app.