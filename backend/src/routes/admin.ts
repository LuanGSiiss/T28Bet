import { Router, Request, Response } from 'express';
import { Match } from '../models/Match';
import { authMiddleware } from '../middlewares/auth';
import { requireAdmin } from '../middlewares/admin';
import { redisClient } from '../services/redis';
import { sendMessage } from '../services/sqs';
import { settleMatch } from '../services/settlement';
import { logger } from '../logger';

const router = Router();

// Apply auth + admin middleware to all admin routes
router.use(authMiddleware, requireAdmin);

// PATCH /api/admin/matches/:id/odds — update match odds
router.patch('/matches/:id/odds', async (req: Request, res: Response) => {
  try {
    const { odds } = req.body;

    if (!odds || typeof odds.home !== 'number' || typeof odds.draw !== 'number' || typeof odds.away !== 'number') {
      res.status(400).json({ message: 'Odds inválidas. Forneça { home, draw, away } como números.' });
      return;
    }

    if (odds.home <= 1 || odds.draw <= 1 || odds.away <= 1) {
      res.status(400).json({ message: 'Todas as odds devem ser maiores que 1' });
      return;
    }

    const match = await Match.findByIdAndUpdate(
      req.params.id,
      {
        $set: { odds },
        $push: {
          oddsHistory: {
            odds,
            recordedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    // Invalidate Redis cache
    try {
      await redisClient.del('cache:matches');
      await redisClient.del(`cache:match:${req.params.id}`);
    } catch (cacheErr) {
      logger.error({ err: cacheErr }, 'Erro ao invalidar cache Redis');
    }

    // Publish odds update to Redis (WebSocket relay)
    try {
      await redisClient.publish('odds', JSON.stringify({ matchId: req.params.id, odds }));
    } catch (redisErr) {
      logger.error({ err: redisErr }, 'Erro ao publicar odds_update no Redis');
    }

    logger.info({ matchId: req.params.id, odds }, 'Odds atualizadas');

    res.json(match);
  } catch (err) {
    logger.error({ err }, 'Erro ao atualizar odds');
    throw err;
  }
});

// POST /api/admin/matches/:id/result — set match result and settle bets
router.post('/matches/:id/result', async (req: Request, res: Response) => {
  try {
    const { winner } = req.body;

    if (!['home', 'draw', 'away'].includes(winner)) {
      res.status(400).json({ message: 'winner deve ser "home", "draw" ou "away"' });
      return;
    }

    // Check match exists and has no result yet
    const match = await Match.findById(req.params.id);
    if (!match) {
      res.status(404).json({ message: 'Partida não encontrada' });
      return;
    }

    if (match.result) {
      res.status(409).json({ message: 'Partida já possui resultado registrado' });
      return;
    }

    // Update match with result
    await Match.findByIdAndUpdate(req.params.id, {
      $set: { result: winner, status: 'finished' },
    });

    // Invalidate caches
    try {
      await redisClient.del('cache:matches');
      await redisClient.del(`cache:match:${req.params.id}`);
    } catch (cacheErr) {
      logger.error({ err: cacheErr }, 'Erro ao invalidar cache Redis após resultado');
    }

    // Try SQS settlement queue first
    const settlementQueueUrl = process.env.SQS_SETTLEMENT_QUEUE_URL;
    if (settlementQueueUrl) {
      try {
        await sendMessage(settlementQueueUrl, { matchId: req.params.id, winner });
        logger.info({ matchId: req.params.id, winner }, 'Resultado enviado para fila SQS de liquidação');
        res.status(202).json({ message: 'Resultado registrado. Liquidação em processamento.' });
        return;
      } catch (sqsErr) {
        logger.error({ err: sqsErr }, 'Erro ao enviar para SQS — executando liquidação síncrona');
      }
    }

    // Fallback: synchronous settlement
    const matchIdStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await settleMatch(matchIdStr, winner);

    res.json({
      message: 'Resultado registrado e apostas liquidadas',
      winner,
      ...result,
    });
  } catch (err) {
    logger.error({ err }, 'Erro ao registrar resultado');
    throw err;
  }
});

export default router;
