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

        console.log('Created default user for debugging: ', defaultUser);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
})();