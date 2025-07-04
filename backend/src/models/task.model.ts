import mongoose, { Schema, Document } from 'mongoose';

interface TaskDoc extends Document {
    title: string;
    description?: string;
    assignedUser: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    status: 'Todo' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    workspace: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<TaskDoc>({
    title: { type: String, required: true },
    description: { type: String },
    assignedUser: { type: Schema.Types.ObjectId, ref: 'User' },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
    },
}, { timestamps: true });

const Task = mongoose.model<TaskDoc>('Task', TaskSchema);
export default Task;