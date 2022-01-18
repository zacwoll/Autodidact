# script to set up the development environment
Import-Module .\Set-PsEnv.psm1
Set-PsEnv

# init container
docker run --rm --name $env:POSTGRES_DB_NAME -p $env:POSTGRES_HOST_PORT:$env:POSTGRES_CONTAINER_PORT -e POSTGRES_PASSWORD=$env:POSTGRES_PASSWORD -d $env:POSTGRES_CONTAINER

# set up database schema
npx prisma db push

# seed database
node prisma/seed.js