require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
// use the JSON middleware
app.use(express.json());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// logging middleware
prisma.$use(async (params, next) => {
    const before = Date.now();

    const result = await next(params);

    const after = Date.now();

    console.log(`Query ${ params.model }.${ params.action } took ${ after - before }ms`);

    return result;
});

// basic response on '/'
app.get('/', (req, res) => {
    res.status(200).send('hello world!');
});

// CRUD for users
app.get('/users/:id', (req, res) => {
    
})
// CRUD for Subjects

// CRUD for Practices

// CRUD for Websites

// CRUD for Notes

// CRUD for Goals

// CRUD for Reflections

// listen on port for incoming requests
app.listen(port, () => {
    console.log(`Listening to requests on port ${ port }`);
});