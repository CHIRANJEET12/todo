import Task from '../models/task.model';
import { Request, Response } from "express";

export const getSelftask = async (req: Request, res: Response): Promise<any> => {
    try {
        const userId = req.params.userId;
        const tasks = await Task.find({ "assignedUser": userId }).populate("userId", "username").populate("assignedUser", "username");
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error in getSelfTask:", error);
        res.status(500).json({ message: "Server error fetching self tasks." });
    }
}