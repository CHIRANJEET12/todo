import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Workspace from '../models/workspace.model';
import { io } from '../server';



export const workspace = async (req: Request, res: Response): Promise<any> => {
    try {
        const code = Math.random().toString().slice(2, 8);
        const existingcode = await Workspace.findOne({ code });
        if (existingcode) {
            return res.status(400).json({ message: "Code already exists" });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }
        const workspace = await Workspace.create({
            code,
            name: req.body.name || `Workspace-${code}`,
            members: [req.user.id],
        });

        io.emit("work_spoace_created", workspace);
        res.json(workspace);
    } catch (error) {
        console.log("error creating a workspace:", error);
        return res.status(500).json({
            message: error,
        })
    }
}


export const workspaceverify = async (req: Request, res: Response): Promise<any> => {
    try {
        const codeverify = req.params.id;
        // console.log("Joining workspace with code:", req.params.id);

        const workspacecode = await Workspace.findOne({ code: codeverify });

        if (!workspacecode) return res.status(404).json({ message: "Workspace not found" });
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }
        const userObjectId = new mongoose.Types.ObjectId(req.user.id);
        if (!workspacecode.members.includes(userObjectId)) {
            workspacecode.members.push(userObjectId);
            await workspacecode.save();
        }

        io.emit("useradded",workspacecode);
        res.json(workspacecode);
    } catch (error) {
        console.log("error joining a workspace:", error);
        return res.status(500).json({
            message: error,
        })
    }
}
