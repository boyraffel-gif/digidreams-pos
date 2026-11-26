import { PrismaClient } from "@prisma/client";

// Satu instance saja agar hot reload di mode dev tidak membuka koneksi berulang.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
