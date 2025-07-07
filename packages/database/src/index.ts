// import { PrismaClient } from '@prisma/client';
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };
// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ['query'],
//   });
// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = db;
// }
// export * from '@prisma/client';
import { PrismaClient } from '../generated/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '../generated/client';
