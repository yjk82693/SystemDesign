
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JWT_SECRET } from './src/config';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Clear existing data
    await prisma.user.deleteMany({});

    // 2. Create Admin User
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await prisma.user.create({
        data: {
            publicId: 'ADMIN-001',
            firstName: 'System',
            lastName: 'Admin',
            email: 'admin@studio.os',
            password: adminPassword,
            role: 'ADMIN',
            position: 'ADMIN',
            dateOfBirth: new Date('1990-01-01').toISOString(),
        }
    });

    // 3. Create Standard Users
    const userPassword = await bcrypt.hash('User@123', 10);

    const users = [
        {
            publicId: 'USER-101',
            firstName: 'Alice',
            lastName: 'Wonder',
            email: 'alice@example.com',
            role: 'USER',
            position: 'USER',
            currentGame: 'Farnimal'
        },
        {
            publicId: 'USER-102',
            firstName: 'Bob',
            lastName: 'Builder',
            email: 'bob@example.com',
            role: 'USER',
            position: 'USER',
            currentGame: 'Broostar'
        },
        {
            publicId: 'EDIT-201',
            firstName: 'Carol',
            lastName: 'Editor',
            email: 'carol@example.com',
            role: 'EDITOR',
            position: 'EDITOR',
            currentGame: null
        }
    ];

    for (const u of users) {
        await prisma.user.create({
            data: {
                ...u,
                password: userPassword,
                dateOfBirth: new Date('1995-05-05').toISOString()
            }
        });
    }

    // 4. Generate Token for Admin (for easy login simulation)
    const token = jwt.sign(
        {
            publicId: admin.publicId,
            email: admin.email,
            role: admin.role,
            position: admin.position,
            name: `${admin.firstName} ${admin.lastName}`
        },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    console.log('--- SEED COMPLETE ---');
    console.log('Admin Token:', token);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
