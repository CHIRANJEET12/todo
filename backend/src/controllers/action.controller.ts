import { Request, Response } from "express";
import Action from "../models/action.model";
import { io } from '../server';

// import { timeStamp } from "console";

export const getRecentActions = async(req: Request, res: Response): Promise<any> => {
    try{
        const actions = await Action.find({})
            .sort({timestamp: -1})
            .limit(20)
            .populate("userId","username")
            .populate('taskId','title');

        io.emit("newAction", actions); // emit the full populated action
        res.json(actions);
    }catch(err){
        res.status(500).json({ message: "Error fetching actions" });
    }
}