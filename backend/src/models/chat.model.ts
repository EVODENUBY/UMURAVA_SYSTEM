import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChat extends Document {
  userId: Types.ObjectId;
  title: string;
  jobId?: Types.ObjectId;
  lastMessage?: string;
  lastMessageAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job'
    },
    lastMessage: {
      type: String,
      trim: true
    },
    lastMessageAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ChatSchema.index({ userId: 1, updatedAt: -1 });
ChatSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IChat>('Chat', ChatSchema);