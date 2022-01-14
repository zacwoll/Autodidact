require('dotenv').config()
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
// use the JSON middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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

app.get('/users/:id', (req, res) => {

})

// CRUD for users

// CREATE a user
app.post('/users', async (req, res) => {
    const user = req.body.user;
    const email = req.body.email;

    console.log(user, email);

    if (!user || !email) {
        return res.status(400).json({message: "either username or email is bad :("})
    }

    try {
        const newUser = await prisma.user.create({
            data: {
                username: user,
                email: email,
            }
        });
        return res.status(200).json({ message: "User successfully created!", ...newUser })
    } catch (err) {
        return res.status(400).json({ message: "That email is already taken." })
    }
});

// READ a user
app.get('/users', async (req, res) => {
    const email = req.body.email;
    const user = await prisma.user.findFirst({where: {email}});
    if (user === null) {
        return res.status(400).json({message: "User doesn't exist in our records"});
    }
    return res.status(200).json( user );
})

app.put('/users', async (req, res) => {
    const email = req.body.email;
    const newUser = req.body.user;
    const newEmail = req.body.newEmail;
    try {
        const updated = await prisma.user.update({
            where: { email },
            data: {
                username: newUser,
                email: newEmail
            }
        });
        return res.status(200).json({message: `The account registered to ${email} has been updated`})
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Something went wrong, unable to complete update"});
    }
})

// DELETE a user
app.delete('/users', async (req, res) => {
    const email = req.body.email;

    try {
        const deleted = await prisma.user.delete({
            where: {
                email
            }
        });
        console.log(deleted);
        return res.status(200).json({message: "user was deleted successfully"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Something went wrong"});
    }
})
// CRUD for Subjects

// CREATE a Subject
app.post('/subjects', async (req, res) => {
    // get the userId from the request
    const userId = req.body.id;
    const subject = req.body.newSubject;

    console.log(`${userId} created ${subject}`);

    if (!userId || !subject) {
        return res.status(400).json({message: "Failed to parse userId or subject"});
    }

    try {
        const author = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });
        const newSubject = await prisma.subject.create({
            data: {
                title: subject,
                author: { connect: { id: userId }}
            }
        });

        console.log(`Subject ${subject} successfully created for ${author.username}`);
        return res.status(200).json({message: "Success!"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Something went wrong"});
    }
})

// READ a Subject by it's Id
app.get('/subjects/byId', async (req, res) => {
    const subjectId = req.body.subjectId;

    if (!subjectId) {
        return res.status(400).json({message: "failed to provide subjectId"});
    }

    try {
        const subject = await prisma.subject.findFirst({
            where: {
                id: subjectId
            }
        });

        return res.status(200).json(subject);
    } catch (err) {
        return res.status(500).json({message: "Something went wrong, can't retrieve subject"});
    }
});

// GET Subject(s) by User Id
app.get('/subjects/byUser', async (req, res) => {
    const userId = req.body.userId;

    if (!userId) {
        return res.status(400).json({message: "failed to provide userId"});
    }

    try {
        const subjects = await prisma.subject.findMany({
            where: { authorId: userId }
        });

        return res.status(200).json(subjects);
    } catch (err) {
        return res.status(500).json({message: "Something went wrong, can't retrieve subjects"})
    }
})

// UPDATE a Subject
app.put('/subjects', async (req, res) => {
    const subjectId = req.body.subjectId;
    const title = req.body.newTitle

    if (!subjectId) {
        return res.status(400).json({ message: "failed to provide subjectId" });
    }

    try {
        const subject = await prisma.subject.update({
            where: {
                id: subjectId
            },
            data: {
                title: title
            }
        });

        return res.status(200).json({message: `${subject.title} has been updated`})
    } catch (err) {
        console.log(err);
        if (!subject) {
            return res.status(400).json({message: "That subject doesn't exist"});
        }
        // Catch all error
        return res.status(500).json({message: "Something went wrong, unable to complete update"});
    }
});

// DELETE a Subject
app.delete('/subjects', async (req, res) => {
    const subjectId = req.body.subjectId;

    if (!subjectId) {
        return res.status(400).json({ message: "failed to provide subjectId" });
    }

    try {
        const subject = await prisma.subject.delete({
            where: {
                id: subjectId
            }
        });

        return res.status(200).json({message: `Subject ${subject.title} has been deleted.`})
    } catch (err) {
        console.log(err);
        if (!subject) {
            return res.status(400).json({ message: "That subject doesn't exist" });
        }
        // Catch all error
        return res.status(500).json({ message: "Something went wrong, unable to complete update" });
    }
})

// CRUD for Practices

// CRUD for Websites

// CRUD for Notes

// CRUD for Goals

// CRUD for Reflections

// listen on port for incoming requests
app.listen(port, () => {
    console.log(`Listening to requests on port ${ port }`);
});