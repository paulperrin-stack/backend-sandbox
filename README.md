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

Three things in one command: write the SQL file, runs it against your database to create or alter the tables, then regenerates the Prisma client to match your updated schema. The SQL file gets committed to version control so your team can replay the exact same migrations.

- Why $disconnect()?

Prisma holds open a connection pool while it's running. In a server that's fine - you want those connections alive. In a one-off script the process would hang after main() finished because the pool is still open. $disconnect() closes it cleanly so the script actually exits.

- Why async on every route?

Prisma queries return promises. async/await is how you wait for them. Without it you'd call prisma.item.findMany() and move on before the database responds - the route sends nothing back. The try/catch matters too: if you don't catch a rejected promise and pass it to next(err), Express never sees the error and the request hangs.

- What is error code P2025?

Prisma's "record not found" error. With Prisma, calling delete on a non-existent record throws instead of returning null — so you catch it and convert it to a clean 404. Without that check it'd fall through to the global error handler and return a 500, which is the wrong status code.

- Why one PrismaClient instance?

Each new PrismaClient() opens a connection pool — a set of persistent connections to Postgres. If you instantiated it per-route or per-request you'd open a new pool on every call and exhaust the database's connection limit fast. Node caches require() calls, so every file that does require('./db') gets the same instance back. One pool, shared across the whole app.

- Why does findUnique check for null but delete uses P2025?

Different Prisma methods, different behaviour. findUnique returns null when the record doesn't exist — so you check the return value yourself and return 404. delete and update throw P2025 instead of returning null — so you catch the error code and convert it to a 404. Same outcome, different mechanism depending on which method you called.

- Why id < 1 in the validation check?

Auto-incremented Postgres ids start at 1. An id of 0 or negative can never exist in the database, so there's no point making the query. More importantly, Number('') returns 0 and passes isInteger — so without the < 1 guard, an empty string id would reach the database. parseInt with a radix handles this cleanly: empty string becomes NaN, floats get truncated, and id < 1 rejects zero and negatives explicitly.

- What does include do in Prisma?

include tells Prisma to JOIN and return related records in the same query. Without it you get the author but no items — you'd have to make a second query. With include: { items: true }, Prisma fetches both in one round trip and nests the items array inside the author object.

- What happens if you delete an author who still has items?

Postgres throws a foreign key constraint error — you can't delete a parent row while child rows still reference it. Prisma surfaces this as a P2003 error. Without handling it you get a 500. The fix is either cascade deletes in the schema (onDelete: Cascade on the relation, so deleting an author deletes their items too), or check for existing items first and return a 409 Conflict.

- Why is authorId required on Item, and why does that make migration harder?

The relation requires every item to belong to an author. If you already have items in the database with no author, Postgres can't add a NOT NULL foreign key column — it has nothing to put in that column for existing rows. Fix: make it optional (authorId Int?) while migrating, or clear the items table first.

- Why is the router/controller split worth it?

app.js with 20 routes and 200 lines becomes unreadable fast. The router is a map — URLs to functions. The controller is logic — what actually happens. Keeping them separate means you can find, read, and change a handler without scrolling past unrelated routes. It also makes testing easier: you can import a controller function and test it directly without spinning up the server.

- What is middleware?

A function that sits between the request and the route handler. It runs before the controller, has access to req and res, and either sends a response itself (validation failure) or calls next() to pass control forward. Express runs middleware in the order it's registered — that's why the order matters.

- Why extract validation into middleware?

The name check and id parsing were copy-pasted into every controller function. If the rule changes — say you add a max length to name — you'd have to update it in every handler. In middleware you change it once. The controller becomes pure database logic with no validation noise mixed in.

- What does req.id do?

validateId parses the id once and writes it onto the request object as req.id. Every middleware and handler in the same request cycle shares the same req — so the controller can just read req.id directly without parsing again. Same idea for req.body.name: validateName trims it once, the controller uses it clean.

- Why is middleware applied per route in the router rather than globally in app.js?

Not every route needs both validators. GET /items needs neither. POST /items needs validateName but not validateId. DELETE /items/:id needs validateId but not validateName. Applying them per route means each handler gets exactly what it needs and nothing it doesn't.

- Why centralise error handling?

P2025 and P2003 were caught inline in every controller. If the mapping changes — say P2025 should return a different message — you'd update it in every catch block. In a central error handler you change it once. Controllers become pure database logic: query, respond, or next(err). Nothing else.

- Why does getOne still handle its own 404 after centralising errors?

findUnique returns null for a missing record — it doesn't throw. The error handler only fires when something calls next(err) with an actual error. Null is a value, not a throw, so there's nothing to catch and forward. getOne has to check the return value itself and send the 404 directly.

- What is error code P2003?

Prisma's foreign key constraint error. Thrown when you try to delete a parent record that still has child records referencing it — for example, deleting an author who still has items. The central error handler maps it to a 409 Conflict, which is the correct status: the request was valid but conflicts with the current state of the data.

- What does onDelete: Cascade do?

Tells Postgres to automatically delete all child records when the parent is deleted. Without it, deleting an author with items throws a foreign key constraint error. With it, the database handles the deletion in one operation — no application code needed. The cascade happens at the database level, not in the controller.

- Why is cascade a schema change and not a code change?

The relationship between tables is a database concern, not an application concern. The application says "delete this author" — the database decides what happens to the related rows. Defining that behaviour in the schema keeps it in the right place and means it applies regardless of how the delete is triggered, whether through the API, a migration script, or directly in Postgres.

- What is the difference between onDelete: Cascade and onDelete: SetNull?

Cascade deletes the child records when the parent is deleted. SetNull sets the foreign key column to null on the child records instead of deleting them — useful when the relation is optional and you want to keep the child records but disassociate them from the parent. SetNull requires the foreign key to be nullable (authorId Int?), otherwise Postgres will reject it.

- What is config.js for?

One place that reads all environment variables, validates they exist, and exports them. Without it, missing vars fail silently deep inside a route — you get a cryptic error at runtime instead of a clear message at startup. With it, the app exits immediately on boot with a list of exactly what's missing.

- Why process.exit(1) and not throw?

A thrown error at the top level might be caught somewhere, swallowed, or produce a confusing stack trace. process.exit(1) is unambiguous — the process stops, the exit code signals failure to whatever started it (a shell script, a deployment system, a process manager). It's the right tool for "this process cannot run".

- Why include DATABASE_URL in the required list if Prisma reads it itself?

Prisma reads DATABASE_URL lazily — only when the first query runs. If it's missing you get a Prisma connection error deep inside a route handler, not at startup. Including it in config.js means the app catches the missing var immediately on boot, before any request is ever made.