import { Request, Response } from "express";
import { authenticate, getSession } from "../services/authService";
import { BadRequestError, InternalServerError, NotFoundError } from "../utils";
import { UserRepository } from "../repositories/UserRepository";

const userRepository = new UserRepository();


export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { email, code } = req.body;
  const user = await userRepository.findByEmail(email);

  if (!user) throw new NotFoundError(`User with email ${email} not found`);
  if(user.isVerified) {
    console.log(`User with email ${email} is already verified`);
    res.status(200).json({ message: "Email already verified" });
    return;
  }
  if (user.verificationToken !== code) throw new BadRequestError("Invalid verification code");
  if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) throw new BadRequestError("Verification code has expired");

  await userRepository.update(user.id, {
    isVerified: true,
    verificationToken: null,
    verificationCodeExpiresAt: null,
  });

  res.status(200).json({ message: "Email verified successfully" });
  return;
}


export async function login(req: Request, res: Response): Promise<void> {
  if (req.isAuthenticated && req.isAuthenticated()) {
    throw new BadRequestError("Already logged in");
  }

  const user = await authenticate(req);

  req.logIn(user, (err) => {
    if (err) throw new InternalServerError("Login failed");
    res.json({ message: "Login successful", user });
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  if (!(req.isAuthenticated && req.isAuthenticated()) || !req.session) {
    throw new BadRequestError("Already logged out");
  }

  req.logout((err) => {
    if (err) throw new InternalServerError("Logout failed");
    req.session.destroy((err) => {
      if (err) throw new InternalServerError("Logout failed");
      res.json({ message: "Logged out" });
    });
  });
}

export async function getSessionInfo(req: Request, res: Response): Promise<void> {
  const user = getSession(req);
  if (!user) {
    res.json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, user });
}
