import Workspace from '../models/workspace.model';
import { Request, Response } from 'express';

export const getUserWorkspaces = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const workspaces = await Workspace.find({ members: userId }).select("name code _id");
    // console.log(workspaces);

    res.status(200).json(workspaces);
  } catch (err) {
    console.error("Error fetching user workspaces:", err);
    res.status(500).json({ message: "Server error fetching user workspaces" });
  }
};