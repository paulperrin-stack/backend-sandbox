const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // CREATE
    const created = await prisma.item.create({
        data: { name: 'Hammer' },
    });
    console.log('Created:', created);

    // READ
    const all = await prisma.item.findMany();
    console.log('All items:', all);

    // UPDATE
    const updated = await prisma.item.update({
        where: { id: created.id },
        data: { name: 'Sledgehammer' },
    });
    console.log('Updated:', updated);

    // DELETE
    const deleted = await prisma.item.delete({
        where: { id: created.id },
    });
    console.log('Deleted:', deleted);
}

// RUN
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());