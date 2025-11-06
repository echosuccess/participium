import type { User as PrismaUser } from "../../prisma/generated/client";
import { PrismaClient } from "../../prisma/generated/client";

const prisma = new PrismaClient();

export async function findByEmail(email: string): Promise<PrismaUser | null> {
  const u = await prisma.user.findUnique({ where: { email } });
  if (!u) return null;
  return u;
}

export async function findById(id: number): Promise<PrismaUser | null> {
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return null;
  return u;
}

export default { findByEmail, findById };