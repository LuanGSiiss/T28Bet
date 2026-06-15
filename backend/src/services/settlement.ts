import { Types } from 'mongoose';
import { Bet } from '../models/Bet';
import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { redisClient } from './redis';
import { logger } from '../logger';

export type SettlementWinner = 'home' | 'draw' | 'away';

export interface SettlementResult {
  settled: number;
  totalPrizePaid: number;
}

export async function settleMatch(
  matchId: string | Types.ObjectId,
  winner: SettlementWinner
): Promise<SettlementResult> {
  const pendingBets = await Bet.find({ matchId, status: 'pending' });

  let settled = 0;
  let totalPrizePaid = 0;

  for (const bet of pendingBets) {
    const isWinner = bet.market === winner;

    if (isWinner) {
      const actualReturn = parseFloat((bet.amount * bet.odds).toFixed(2));

      // Update bet as won
      bet.status = 'won';
      bet.actualReturn = actualReturn;
      bet.settledAt = new Date();
      await bet.save();

      // Credit user balance atomically
      const updatedUser = await User.findByIdAndUpdate(
        bet.userId,
        { $inc: { balance: actualReturn } },
        { new: true }
      );

      // Create prize transaction
      await Transaction.create({
        userId: bet.userId,
        type: 'prize',
        amount: actualReturn,
        description: `Prêmio de aposta - Retorno de R$ ${actualReturn.toFixed(2)}`,
        relatedBetId: bet._id,
      });

      // Publish balance update via Redis
      if (updatedUser) {
        try {
          await redisClient.publish(
            `balance:${bet.userId.toString()}`,
            JSON.stringify({ balance: updatedUser.balance })
          );
        } catch (err) {
          logger.error({ err }, 'Erro ao publicar balance_update no Redis');
        }
      }

      totalPrizePaid += actualReturn;
    } else {
      // Update bet as lost
      bet.status = 'lost';
      bet.settledAt = new Date();
      await bet.save();
    }

    settled++;
  }

  logger.info({ matchId, winner, settled, totalPrizePaid }, 'Apostas liquidadas');

  return { settled, totalPrizePaid };
}
