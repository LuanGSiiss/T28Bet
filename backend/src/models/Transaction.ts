import mongoose, { Document, Schema, Types } from 'mongoose';

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
