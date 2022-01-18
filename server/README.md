# Server for the Autodidact project

## Instructions to start running locally
In order to run and test things locally before pushing them to deployment, you need to set a few things up first.


You need a docker container holding the postgres instance, mine is:
`docker run --rm --name autodidact -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres:13-alpine`

You need to enforce your prisma schema on your database, so run this command next
`npx prisma db push`

I have a default user I've been using for testing, seed the database with
`node prisma/seed`
and the user will be created. This has the added bonus of confirming our parts work together, The user details are printed to the console, such as the ID, making testing simple.

Then I set a few things up to test the server as I go: I use this command to enter my Docker container with psql as my postgres user
`docker exec -ti NAME_OF_CONTAINER psql -U YOUR_POSTGRES_USERNAME`

and I open a command prompt for cURL'ing my endpoints, with a few lines I'll keep here for reference

- Create a subject for the user I seeded the database with
`curl -d "id=USER_ID_&title=TITLE" -X POST localhost:3000/subjects`




### The command to run the docker container
docker run --rm --name postgres-quotes -p 5432:5432 -e POSTGRES_PASSWORD=mysecretpassword -d postgres:13-alpine

[A Prisma example](https://github.com/prisma/prisma-examples/tree/latest/javascript/rest-express)
