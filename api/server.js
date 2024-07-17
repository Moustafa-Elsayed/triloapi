const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');

const server = jsonServer.create();
const filePath = path.join('db.json');
const router = jsonServer.router(filePath);

const middlewares = jsonServer.defaults();

server.use(middlewares);

// Add this before server.use(router)
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id'
}));

// Middleware to parse JSON bodies
server.use(jsonServer.bodyParser);

// Middleware to handle POST requests to /users
server.post('/users', (req, res) => {
    try {
        const db = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const users = db.users;
        const newUser = {
            id: users.length ? users[users.length - 1].id + 1 : 1,
            email: req.body.email,
            password: req.body.password
        };
        users.push(newUser);
        db.users = users;
        fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error handling POST /users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running');
});

// Export the Server API
module.exports = server;
