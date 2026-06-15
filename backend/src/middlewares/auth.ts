import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../logger';

interface JwtPayload {
  id: string;
  email: string;
}

// Verifies the JWT and loads current user data from the database.
// isAdmin and other permissions always reflect the current DB state,
// not the claims baked into the token at login time.
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token não fornecido' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não configurado');

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select('email isAdmin').lean();
    if (!user) {
      res.status(401).json({ message: 'Token inválido ou expirado' });
      return;
    }

    req.user = {
      id: decoded.id,
      email: user.email,
      isAdmin: user.isAdmin ?? false,
    };

    next();
  } catch (err) {
    logger.warn({ err }, 'Token JWT inválido ou expirado');
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}
