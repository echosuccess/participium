import { UserRepository } from "../repositories/UserRepository";
import { User, Role } from "../entities/User";
import {randomInt} from "crypto";
import { sendVerificationEmail } from "./emailService";

const userRepository = new UserRepository();

export async function findByEmail(email: string): Promise<User | null> {
  return await userRepository.findByEmail(email);
}

export async function findById(id: number): Promise<User | null> {
  return await userRepository.findById(id);
}

export async function createUser(data: {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  salt: string;
  role: Role;
  telegram_username?: string | null;
  email_notifications_enabled?: boolean;
}): Promise<User> {
  const code = randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); //30m from now

  const nonVerifiedUser ={
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    password: data.password,
    salt: data.salt,
    role: data.role,
    telegram_username: data.telegram_username ?? null,
    email_notifications_enabled: data.email_notifications_enabled ?? true,
    isVerified: false,
    verificationToken: code,
    verificationCodeExpiresAt: expiresAt,
  }
  try{
    await sendVerificationEmail(data.email, code);
  }catch(error){
    console.error("Failed to send verification email to:", data.email);
  }
  return await userRepository.create(nonVerifiedUser);
}

export async function updateUser(id: number, data: {
  email?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  salt?: string;
  role?: Role;
  telegram_username?: string | null;
  email_notifications_enabled?: boolean;
}): Promise<User | null> {
  try {
    // Create a clean update object
    const updateData: any = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.salt !== undefined) updateData.salt = data.salt;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.telegram_username !== undefined) updateData.telegram_username = data.telegram_username;
    if (data.email_notifications_enabled !== undefined) updateData.email_notifications_enabled = data.email_notifications_enabled;
    
    return await userRepository.update(id, updateData);
  } catch (err) {
    return null;
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    return await userRepository.delete(id);
  } catch (err) {
    return false;
  }
}

export async function findUsersByRoles(roles: Role[]): Promise<User[]> {
  return await userRepository.findByRoles(roles);
}

