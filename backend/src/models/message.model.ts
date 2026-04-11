import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  sender: 'user' | 'ai';
  content: string;
  metadata?: {
    intent?: string;
    confidence?: number;
  };
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true
    },
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    metadata: {
      intent: { type: String },
      confidence: { type: Number, min: 0, max: 1 }
    }
  },
  {
    timestamps: true
  }
);

MessageSchema.index({ chatId: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);