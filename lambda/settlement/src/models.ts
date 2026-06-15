import mongoose, { Document, Schema, Types } from 'mongoose';

// ─── User ────────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  balance: number;
  isAdmin: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 1000 },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User = mongoose.model<IUser>('User', UserSchema);

// ─── Bet ─────────────────────────────────────────────────────────────────────

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

// ─── Transaction ─────────────────────────────────────────────────────────────

export type TransactionType = 'bet' | 'deposit' | 'prize';

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  description: string;
  relatedBetId?: Types.ObjectId;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['bet', 'deposit', 'prize'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    relatedBetId: { type: Schema.Types.ObjectId, ref: 'Bet' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

// ─── Match ───────────────────────────────────────────────────────────────────

export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type MatchResult = 'home' | 'draw' | 'away';

export interface IOdds {
  home: number;
  draw: number;
  away: number;
}

export interface IMatch extends Document {
  homeTeam: string;
  awayTeam: string;
  date: Date;
  status: MatchStatus;
  odds: IOdds;
  result?: MatchResult;
  createdAt: Date;
}

const OddsSchema = new Schema<IOdds>(
  {
    home: { type: Number, required: true },
    draw: { type: Number, required: true },
    away: { type: Number, required: true },
  },
  { _id: false }
);

const MatchSchema = new Schema<IMatch>(
  {
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'finished'],
      default: 'scheduled',
    },
    odds: { type: OddsSchema, required: true },
    result: {
      type: String,
      enum: ['home', 'draw', 'away'],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Match = mongoose.model<IMatch>('Match', MatchSchema);
