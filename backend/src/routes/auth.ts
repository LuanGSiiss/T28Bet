import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { User } from '../models/User';
import { authMiddleware } from '../middlewares/auth';
import { redisClient } from '../services/redis';
import { logger } from '../logger';

const router = Router();

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  store: new RedisStore({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendCommand: (...args: string[]) => (redisClient as any).call(...args),
  }),
  skip: () => {
    // Skip rate limiting if Redis is not available — fail open
    return false;
  },
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    const errors: { field: string; message: string }[] = [];

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Nome é obrigatório' });
    }

    if (!email || typeof email !== 'string') {
      errors.push({ field: 'email', message: 'E-mail é obrigatório' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push({ field: 'email', message: 'E-mail inválido' });
      }
    }

    if (!password || typeof password !== 'string') {
      errors.push({ field: 'password', message: 'Senha é obrigatória' });
    } else if (password.length < 6) {
      errors.push({ field: 'password', message: 'Senha deve ter no mínimo 6 caracteres' });
    }

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ message: 'E-mail já cadastrado' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // Generate JWT
    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN ?? '24h';
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      secret,
      { expiresIn } as jwt.SignOptions
    );

    logger.info({ userId: user._id }, 'Novo usuário registrado');

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Erro no registro de usuário');
    throw err;
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'Credenciais inválidas' });
      return;
    }

    // Generate JWT
    const secret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN ?? '24h';
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      secret,
      { expiresIn } as jwt.SignOptions
    );

    logger.info({ userId: user._id }, 'Login bem-sucedido');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Erro no login');
    throw err;
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('-password');
    if (!user) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    logger.error({ err }, 'Erro ao buscar perfil');
    throw err;
  }
});

export default router;
