import { Router, Request, Response } from 'express';
import { Match } from '../models/Match';
import { authMiddleware } from '../middlewares/auth';
import { cacheMiddleware } from '../middlewares/cache';
import { logger } from '../logger';

const router = Router();

// GET /api/matches — list all matches
router.get(
  '/',
  authMiddleware,
  cacheMiddleware('cache:matches', 5),
  async (_req: Request, res: Response) => {
    try {
      const matches = await Match.find().sort({ date: 1 });
      res.json(matches);
    } catch (err) {
      logger.error({ err }, 'Erro ao listar partidas');
      throw err;
    }
  }
);

// GET /api/matches/:id — get single match with oddsHistory
router.get(
  '/:id',
  authMiddleware,
  cacheMiddleware((req) => `cache:match:${req.params.id}`, 5),
  async (req: Request, res: Response) => {
    try {
      const match = await Match.findById(req.params.id);
      if (!match) {
        res.status(404).json({ message: 'Partida não encontrada' });
        return;
      }

      // Return match with oddsHistory sorted descending
      const matchObj = match.toObject();
      matchObj.oddsHistory = [...matchObj.oddsHistory].sort(
        (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );

      res.json(matchObj);
    } catch (err) {
      logger.error({ err }, 'Erro ao buscar partida');
      throw err;
    }
  }
);

export default router;
