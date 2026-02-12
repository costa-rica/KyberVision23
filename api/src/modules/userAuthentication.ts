import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "kybervision23db";

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (process.env.AUTHENTIFICATION_TURNED_OFF === "true") {
    const user = await User.findOne({ where: { email: "nrodrig1@gmail.com" } });
    req.user = { id: user?.id };
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    res.status(401).json({ message: "Token is required" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, async (err, decoded) => {
    if (err) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }
    const { id } = decoded as { id: number };
    const user = await User.findByPk(id);
    req.user = user;
    next();
  });
}

export function tokenizeObject(object: any): string {
  return jwt.sign(object, process.env.JWT_SECRET!);
}

export function detokenizeObject(token: string): any {
  return jwt.verify(token, process.env.JWT_SECRET!);
}
