require('dotenv').config()
const express = require('express');
const utils = require('./utils/utils');
const path = require("path");
const { google } = require('googleapis');

const app = express();
const port = process.env.PORT || 3000;
// use the JSON middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

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

// Google Authentication OAuth2
// const oauth2Client = new google.auth.OAuth2(
//     process.env.CLIENT_ID,
//     process.env.CLIENT_SECRET,
//     'http://localhost:3000/auth/google/callback',
// )

// const redirectUrl = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     prompt: 'consent',
//     scope: ['email', 'profile', 'openID']
// });

let auth = false;

// render the landing page!
app.get('/', (req, res) => {
    // let oauth2 = google.oath2({version: 'v2', auth: oauth2Client});
    res.render("index", { title: "Autodidact"})
});

app.get('/auth/google/callback', async function (req, res) {
    const code = req.query.code;
    if (code) {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        auth = true;
    }
    res.redirect('/');
});

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
    if (!email) {
        return res.status(400).json({message: "Failed to include JSON"});
    }

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

// POST / CREATE a Subject
app.post('/subjects', async (req, res) => {
    // get the userId from the request
    const userId = req.body.id;
    const title = req.body.title;

    console.log(`${userId} created ${title}`);

    if (!userId || !title) {
        return res.status(400).json({message: "Failed to parse userId or subject title"});
    }

    try {
        const author = await prisma.user.findFirst({
            where: {
                id: userId
            }
        })
        if (!author) {
            throw new Error("Failed to find a user with this Id");
        }

        const newSubject = await prisma.subject.create({
            data: {
                title: title,
                author: { connect: { id: userId }}
            }
        });
        if (!newSubject) {
            throw new Error('Failed to create new subject');
        }

        console.log(author);
        console.log(newSubject);

        // console.log(`Subject ${newSubject.title} successfully created for ${author.username}`);
        return res.status(200).json(newSubject);
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
    const subjectId = req.body.id;

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

// CREATE a practice
app.post('/practices', async (req, res) => {
    const subjectId = req.body.subjectId;
    let quantity = req.body.quantity;
    const description = req.body.description;

    if (!subjectId || !description) {
        return res.status(400).json({message: "Failed to include subjectId or description"});
    }
    if (quantity) {
        quantity = utils.filterInt(quantity);
        if (quantity === NaN) {
            return res.status(400).json({message: "Failed to provide integer value for quantity"});
        }
    }

    const updateObject = utils.cleanUndefinedEntries({quantity, description})
    try {
        practice = await prisma.practice.create({
            data: {
                ...updateObject,
                subject: { connect: { id: subjectId }}
            }
        });

        return res.status(200).json(practice);
    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Something went wrong"});
    }
})

// GET / READ Practices by Subject
app.get('/practices', async (req, res) => {
    subjectId = req.body.id;

    if (!subjectId) {
        return res.status(400).json({message: "Failed to provide subjectId"})
    }

    try {
        const practices = await prisma.practice.findMany({
            where: { subjectId: subjectId }
        })

        if (!practices) {
            return res.status(200).json({message: "There are no practices associated with this subject yet"});
        }
        console.log(practices);
        return res.status(200).json(practices);

    } catch (err) {
        console.log(err);
        return res.status(500).json({message: "Something went wrong"})
    }
})

// PUT / UPDATE Practices by Subject
app.put('/practices', async (req, res) => {
    const practiceId = req.body.id;
    let quantity = req.body.quantity;
    const description = req.body.description;

    if (!practiceId) {
        return res.status(400).json({ message: "Failed to provide practiceId" });
    }

    if (!description && !quantity) {
        return res.status(400).json({message: "Failed to provide new description or quantity"})
    }

    if (quantity) {
        quantity = utils.filterInt(quantity);
        if (quantity === NaN) {
            return res.status(400).json({message: "Failed to provide int for quantity"});
        }
    }

    const updateObject = utils.cleanUndefinedEntries({ quantity, description });
    try {
        let updatedPractice = await prisma.practice.update({
                where: { id: practiceId },
                data: updateObject
            });

        return res.status(200).json(updatedPractice);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
})

// DELETE / DELETE Practices by Subject
app.delete('/practices', async (req, res) => {
    practiceId = req.body.id;

    if (!practiceId) {
        return res.status(400).json({ message: "Failed to provide practiceId" });
    }

    try {
        const deletedPractice = await prisma.practice.delete({
            where: { id: practiceId },
        });

        return res.status(200).json(deletedPractice);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// CRUD for Websites
// CREATE a Website
app.post('/websites', async (req, res) => {
    const subjectId = req.body.subjectId;
    const url = req.body.url;
    const summary = req.body.summary;

    if (!subjectId || !url || !summary) {
        return res.status(400).json({ message: "Failed to include subjectId, url, or summary" });
    }

    try {
        let website = await prisma.website.create({
            data: {
                url,
                summary,
                subject: { connect: { id: subjectId }}
            }
        })

        return res.status(200).json(website);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// GET / READ Website by Subject
app.get('/websites', async (req, res) => {
    subjectId = req.body.id;

    if (!subjectId) {
        return res.status(400).json({ message: "Failed to provide subjectId" });
    }

    try {
        const websites = await prisma.websites.findMany({
            where: { subjectId: subjectId }
        });

        if (!websites) {
            return res.status(200).json({ message: "There are no websites associated with this subject yet" });
        }
        console.log(websites);
        return res.status(200).json(websites);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// PUT / UPDATE Practices by Subject
app.put('/practices', async (req, res) => {
    const websiteId = req.body.id;
    const url = req.body.url;
    const summary = req.body.summary;

    if (!websiteId) {
        return res.status(400).json({ message: "Failed to provide practiceId" });
    }

    if (!url && !summary) {
        return res.status(400).json({ message: "Failed to provide new description or quantity" });
    }

    const updateObject = utils.cleanUndefinedEntries({ url, summary });
    try {
        let updatedWebsite = await prisma.website.update({
            where: { id: practiceId },
            data: updateObject
        });

        return res.status(200).json(updatedWebsite);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// DELETE / DELETE Practices by Subject
app.delete('/practices', async (req, res) => {
    websiteId = req.body.id;

    if (!websiteId) {
        return res.status(400).json({ message: "Failed to provide practiceId" });
    }

    try {
        const deleted = await prisma.website.delete({
            where: { id: practiceId },
        });

        return res.status(200).json(deleted);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// CRUD for Notes
// POST / CREATE a Note
app.post('/notes', async (req, res) => {
    const subjectId = req.body.subjectId;
    const title  = req.body.title;
    const content = req.body.content;

    if (!subjectId || !title || !content) {
        return res.status(400).json({ message: "Failed to include subjectId, title, or content" });
    }

    const createObject = {title, content};

    try {
        let note = await prisma.note.create({
            data: {
                ...createObject,
                subject: { connect: { id: subjectId } }
            }
        });

        return res.status(200).json(note);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// GET / READ Note by Subject
app.get('/notes', async (req, res) => {
    subjectId = req.body.id;

    if (!subjectId) {
        return res.status(400).json({ message: "Failed to provide subjectId" });
    }

    try {
        const notes = await prisma.note.findMany({
            where: { subjectId: subjectId }
        });

        if (!notes) {
            return res.status(200).json({ message: "There are no websites associated with this subject yet" });
        }
        console.log(notes);
        return res.status(200).json(websites);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// PUT / UPDATE Note by Subject
app.put('/notes', async (req, res) => {
    const noteId = req.body.id;
    const title = req.body.title;
    const content = req.body.content;

    if (!noteId) {
        return res.status(400).json({ message: "Failed to provide noteId" });
    }

    if (!title && !content) {
        return res.status(400).json({ message: "Failed to provide new description or quantity" });
    }

    const updateObject = utils.cleanUndefinedEntries({ title, content });
    try {
        let updatedWebsite = await prisma.note.update({
            where: { id: noteId },
            data: updateObject
        });

        return res.status(200).json(updatedWebsite);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// DELETE / DELETE Note by Subject
app.delete('/notes', async (req, res) => {
    noteId = req.body.id;

    if (!noteId) {
        return res.status(400).json({ message: "Failed to provide noteId" });
    }

    try {
        const deleted = await prisma.note.delete({
            where: { id: noteId },
        });

        return res.status(200).json(deleted);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// CRUD for Goals
// POST / CREATE a Goal
app.post('/goals', async (req, res) => {
    const subjectId = req.body.subjectId;
    const title = req.body.title;
    const description = req.body.description;
    let eta = req.body.eta;

    if (!subjectId || !title || !description || !eta) {
        return res.status(400).json({ message: "Failed to include subjectId, title, or description, eta" });
    }

    eta = new Date(eta);

    const createObject = { title, description, eta };

    try {
        let goal = await prisma.goal.create({
            data: {
                ...createObject,
                subject: { connect: { id: subjectId } }
            }
        });

        return res.status(200).json(goal);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// GET / READ Goals by Subject
app.get('/goals', async (req, res) => {
    subjectId = req.body.id;

    if (!subjectId) {
        return res.status(400).json({ message: "Failed to provide subjectId" });
    }

    try {
        const goals = await prisma.goal.findMany({
            where: { subjectId: subjectId }
        });

        if (!goals) {
            return res.status(200).json({ message: "There are no goals associated with this subject yet" });
        }
        console.log(goals);
        return res.status(200).json(goals);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// PUT / UPDATE Goals by Subject
app.put('/goals', async (req, res) => {
    const goalId = req.body.id;
    const title = req.body.title;
    const content = req.body.content;

    if (!goalId) {
        return res.status(400).json({ message: "Failed to provide goalId" });
    }

    if (!title && !content) {
        return res.status(400).json({ message: "Failed to provide new description or quantity" });
    }

    const updateObject = utils.cleanUndefinedEntries({ title, content });
    try {
        let updatedGoal = await prisma.goal.update({
            where: { id: noteId },
            data: updateObject
        });

        return res.status(200).json(updatedGoal);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// DELETE / DELETE Note by Subject
app.delete('/goals', async (req, res) => {
    goalId = req.body.id;

    if (!goalId) {
        return res.status(400).json({ message: "Failed to provide goalId" });
    }

    try {
        const deleted = await prisma.goal.delete({
            where: { id: goalId },
        });

        return res.status(200).json(deleted);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// CRUD for Reflections
// POST / CREATE a Reflection
app.post('/reflections', async (req, res) => {
    const subjectId = req.body.subjectId;
    const title = req.body.title;
    const content = req.body.content;

    // Just realized that content could be "", should handle that across this file, put it in the tests

    if (!subjectId || !title || !content) {
        return res.status(400).json({ message: "Failed to include subjectId, title, or description, eta" });
    }


    const createObject = { title, content };

    try {
        let goal = await prisma.goal.create({
            data: {
                ...createObject,
                subject: { connect: { id: subjectId } }
            }
        });

        return res.status(200).json(goal);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// GET / READ Reflections by Subject
app.get('/reflections', async (req, res) => {
    subjectId = req.body.id;

    if (!subjectId) {
        return res.status(400).json({ message: "Failed to provide subjectId" });
    }

    try {
        const reflections = await prisma.reflection.findMany({
            where: { subjectId: subjectId }
        });

        if (!reflections) {
            return res.status(200).json({ message: "There are no reflections associated with this subject yet" });
        }
        console.log(reflections);
        return res.status(200).json(reflections);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// PUT / UPDATE reflections by Subject
app.put('/reflections', async (req, res) => {
    const reflectionId = req.body.id;
    const title = req.body.title;
    const content = req.body.content;

    if (!reflectionId) {
        return res.status(400).json({ message: "Failed to provide goalId" });
    }

    if (!title && !content) {
        return res.status(400).json({ message: "Failed to provide new title or content" });
    }

    const updateObject = utils.cleanUndefinedEntries({ title, content });

    try {
        let updated = await prisma.reflection.update({
            where: { id: noteId },
            data: updateObject
        });

        return res.status(200).json(updated);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});

// DELETE / DELETE Note by Subject
app.delete('/reflections', async (req, res) => {
    reflectionId = req.body.id;

    if (!reflectionId) {
        return res.status(400).json({ message: "Failed to provide reflectionId" });
    }

    try {
        const deleted = await prisma.reflection.delete({
            where: { id: reflectionId },
        });

        return res.status(200).json(deleted);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});



// listen on port for incoming requests
app.listen(port, () => {
    console.log(`Listening to requests on port ${ port }`);
});