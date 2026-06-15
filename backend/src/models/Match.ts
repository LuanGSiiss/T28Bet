import mongoose, { Document, Schema } from 'mongoose';

export type MatchStatus = 'scheduled' | 'live' | 'finished';
export type MatchResult = 'home' | 'draw' | 'away';

export interface IOdds {
  home: number;
  draw: number;
  away: number;
}

export interface IOddsHistory {
  odds: IOdds;
  recordedAt: Date;
}

export interface IMatch extends Document {
  homeTeam: string;
  awayTeam: string;
  date: Date;
  status: MatchStatus;
  odds: IOdds;
  result?: MatchResult;
  oddsHistory: IOddsHistory[];
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

const OddsHistorySchema = new Schema<IOddsHistory>(
  {
    odds: { type: OddsSchema, required: true },
    recordedAt: { type: Date, default: () => new Date() },
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
    oddsHistory: { type: [OddsHistorySchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Match = mongoose.model<IMatch>('Match', MatchSchema);
