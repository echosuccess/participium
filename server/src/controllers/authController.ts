import { Request, Response, NextFunction } from "express";
import { authenticate, getSession } from "../services/authService";
import { InvalidCredentialsError } from "../interfaces/errors/InvalidCredentialsError";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authenticate(req);

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ message: "Login successful", user });
    });

  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid username or password"
      });
    } else {
      return res.status(500).json({
        error: "InternalServerError",
        message: "An internal server error occurred"
      });
    }
  }
}

export function logout(req: Request, res: Response) {
  try {
    req.logout?.(() => {});
  } catch (e) {
    // ignore
  }

  if (req.session) {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  } else {
    res.json({ message: "Logged out" });
  }
}

export function getSessionInfo(req: Request, res: Response) {
  const user = getSession(req);
  if (!user) return res.json({ authenticated: false });
  return res.json({ authenticated: true, user });
}
