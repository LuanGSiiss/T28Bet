import { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.isAdmin !== true) {
    res.status(403).json({ message: 'Acesso negado. Rota exclusiva para administradores.' });
    return;
  }
  next();
}
