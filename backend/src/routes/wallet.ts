import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { authMiddleware } from '../middlewares/auth';
import { logger } from '../logger';

const router = Router();

// POST /api/wallet/deposit
router.post('/deposit', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = req.user!.id;

    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount < 10 || numAmount > 10000) {
      res.status(400).json({ message: 'Valor de depósito deve ser entre R$ 10 e R$ 10.000' });
      return;
    }

    // Atomically add balance
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: numAmount } },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'Usuário não encontrado' });
      return;
    }

    // Create deposit transaction
    const transaction = await Transaction.create({
      userId,
      type: 'deposit',
      amount: numAmount,
      description: `Depósito de R$ ${numAmount.toFixed(2)}`,
    });

    logger.info({ userId, amount: numAmount }, 'Depósito realizado');

    res.json({
      balance: updatedUser.balance,
      transaction,
    });
  } catch (err) {
    logger.error({ err }, 'Erro ao realizar depósito');
    throw err;
  }
});

// GET /api/wallet/transactions — list user transactions
router.get('/transactions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find({ userId: req.user!.id }).sort({
      createdAt: -1,
    });

    res.json(transactions);
  } catch (err) {
    logger.error({ err }, 'Erro ao listar transações');
    throw err;
  }
});

export default router;
