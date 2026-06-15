import mongoose, { Document, Schema, Types } from 'mongoose';

export type BetMarket = 'home' | 'draw' | 'away';
export type BetStatus = 'pending' | 'won' | 'lost';

export interface IBet extends Document {
  userId: Types.ObjectId;
  matchId: Types.ObjectId;
  market: BetMarket;
  amount: number;
  odds: number;
  potentialReturn: number;
  status: BetStatus;
  actualReturn?: number;
  createdAt: Date;
  settledAt?: Date;
}

const BetSchema = new Schema<IBet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    market: { type: String, enum: ['home', 'draw', 'away'], required: true },
    amount: { type: Number, required: true },
    odds: { type: Number, required: true },
    potentialReturn: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'won', 'lost'], default: 'pending' },
    actualReturn: { type: Number },
    settledAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Bet = mongoose.model<IBet>('Bet', BetSchema);
