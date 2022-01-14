const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async function main() {
    try {
        const defaultUser = await prisma.user.create({
            data: {
                username: "Ziggy",
                email: "Ziggy@mail"
            }
        });

        console.log('Create 1 author with 2 quotes: ', defaultUser);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
})();