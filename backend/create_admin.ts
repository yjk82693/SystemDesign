import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generatePublicId } from "./src/utils/idGenerator";

const prisma = new PrismaClient();

async function main() {
    const firstName = "Yooj";
    const lastName = "K";
    const email = "yooj.k@admin.com"; // Synthesized email
    const password = "testT12!";
    const dateOfBirth = "1990-01-01"; // Arbitrary date

    const hashed = await bcrypt.hash(password, 10);

    let publicId = "";
    while (true) {
        publicId = generatePublicId(firstName, lastName);
        const exists = await prisma.user.findUnique({ where: { publicId } });
        if (!exists) break;
    }

    const user = await prisma.user.create({
        data: {
            publicId,
            firstName,
            lastName,
            email,
            password: hashed,
            role: "Developer", // Just a label
            position: "ADMIN", // The important part
            dateOfBirth,
            currentGame: null
        }
    });

    console.log(`Admin Created!`);
    console.log(`Public ID: ${user.publicId}`);
    console.log(`Password: ${password}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
