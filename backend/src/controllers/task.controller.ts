import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task from '../models/task.model';
import Action from '../models/action.model';
import Conflict from '../models/conflict.model';
import Workspace from '../models/workspace.model';
import { io } from '../server';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

const validStatuses = ['Todo', 'In Progress', 'Done'];
const validPriorities = ['Low', 'Medium', 'High'];

export const createTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, assignedUser, status, priority, workspace } = req.body;

    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized - user not found" });
    if (!title || !workspace) return res.status(400).json({ message: "Title and workspace are required" });
    if (!isValidObjectId(workspace)) return res.status(400).json({ message: "Invalid workspace ID" });

    const workspaceDoc = await Workspace.findById(workspace);
    if (
      !workspaceDoc ||
      !workspaceDoc.members.includes(new mongoose.Types.ObjectId(req.user!.id))
    ) {
      return res.status(403).json({ message: "You are not a member of this workspace" });
    }

    const existingTitle = await Task.findOne({ title, userId: req.user.id, workspace });
    if (existingTitle) {
      return res.status(409).json({ message: "You already created a task with this title in this workspace" });
    }

    if (assignedUser && !isValidObjectId(assignedUser)) {
      return res.status(400).json({ message: "Invalid assignedUser ID" });
    }
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    const task = new Task({
      title,
      description,
      assignedUser,
      status,
      priority,
      userId: req.user.id,
      workspace,
    });

    await task.save();

    await Action.create({
      actionType: "action_task_created",
      userId: req.user.id,
      taskId: task._id,
    });

    io.emit("taskCreated", task);
    return res.status(201).json(task);
  } catch (error: any) {
    console.error("Create task error:", error.message);
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<any> => {
  try {
    const { assignedUser, status, workspace } = req.query;
    if (!workspace || !isValidObjectId(workspace as string)) {
      return res.status(400).json({ message: "Valid workspace ID is required" });
    }

    const workspaceDoc = await Workspace.findById(workspace);
    if (!workspaceDoc || !workspaceDoc.members.includes(new mongoose.Types.ObjectId(req.user!.id))) {
      return res.status(403).json({ message: "Forbidden: You are not in this workspace" });
    }

    const filter: any = { workspace };
    if (assignedUser && isValidObjectId(assignedUser as string)) filter.assignedUser = assignedUser;
    if (status && validStatuses.includes(status as string)) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('assignedUser', 'username email')
      .populate('userId', 'username email');

    return res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid task ID' });

    const updateData = req.body;
    const existingTask = await Task.findById(id);
    if (!existingTask) return res.status(404).json({ message: 'Task not found' });

    const workspaceDoc = await Workspace.findById(existingTask.workspace);
    if (!workspaceDoc?.members.includes(new mongoose.Types.ObjectId(req.user!.id))) {
      return res.status(403).json({ message: 'Forbidden: You are not in this workspace' });
    }

    if (existingTask.assignedUser && existingTask.assignedUser.toString() !== req.user?.id && existingTask.userId.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Forbidden: Not authorized to edit this task' });
    }

    if (!req.body.clientLastUpdate) {
      return res.status(400).json({ message: 'clientLastUpdate is required for conflict detection' });
    }

    const clientLastUpdate = new Date(req.body.clientLastUpdate);
    if (isNaN(clientLastUpdate.getTime())) {
      return res.status(400).json({ message: 'Invalid clientLastUpdate date format' });
    }

    if (existingTask.updatedAt.getTime() > clientLastUpdate.getTime()) {
      await Conflict.create({
        taskId: existingTask._id,
        userId: req.user!.id,
        conflictData: req.body,
      });
      return res.status(409).json({ message: "Edit conflict detected. Please refresh and try again.", conflict: true });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate('assignedUser', 'username email');

    await Action.create({
      actionType: 'action_task_updated',
      userId: req.user!.id,
      taskId: updatedTask!._id,
    });

    io.emit('taskUpdated', updatedTask);
    return res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid task ID' });

    const existingTask = await Task.findById(id);
    if (!existingTask) return res.status(404).json({ message: 'Task not found' });

    const workspaceDoc = await Workspace.findById(existingTask.workspace);
    if (!workspaceDoc?.members.includes(new mongoose.Types.ObjectId(req.user!.id))) {
      return res.status(403).json({ message: 'Forbidden: You are not in this workspace' });
    }

    if (existingTask.userId.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this task' });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    await Action.create({
      actionType: 'action_task_deleted',
      userId: req.user!.id,
      taskId: deletedTask!._id,
    });

    io.emit('taskDeleted', id);
    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
