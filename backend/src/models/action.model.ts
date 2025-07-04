import mongoose, { Schema, Document } from "mongoose";

export interface ActionDoc extends Document {
    actionType: string;
    userId: mongoose.Types.ObjectId;
    taskId: mongoose.Types.ObjectId;
    timestamp: Date;
}

const ActionSchema = new Schema<ActionDoc>({
    actionType: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    timestamp: { type: Date, default: Date.now },
})

const Action = mongoose.model<ActionDoc>("Action",ActionSchema);
export default Action;