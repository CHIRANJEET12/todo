import mongoose, { Schema, Document } from "mongoose";

export interface ConflictDoc extends Document {
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  conflictData: any;
  resolved: boolean;
  timestamp: Date;
}

const ConflictSchema = new Schema<ConflictDoc>({
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  conflictData: { type: Schema.Types.Mixed, required: true },
  resolved: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

const Conflict = mongoose.model<ConflictDoc>("Conflict", ConflictSchema);
export default Conflict;