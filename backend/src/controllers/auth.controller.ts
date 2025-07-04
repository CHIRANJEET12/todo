import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from '../models/user.model';
import Workspace from "../models/workspace.model";
import { generateToken } from "../utils/jwt";


export const register = async (req: Request, res: Response): Promise<any> => {
  const { username, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: 'User already exits' });
  }

  const hashedpass = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashedpass,
  })

  const token = generateToken(user._id.toString());
  res.json({
    token, user: {
      id: user._id,
      username,
      email,
    }
  });
}

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken(user._id.toString());
  res.json({ token, user: { id: user._id, username: user.username, email } });
}

export const getUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    // const users = await workspaceModel.find().select("-name -code -_id");
    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    const memeberids = workspace.members;

    const users = await User.find({ _id: { $in: memeberids } }).select("username");

    // console.log("data:", users);
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching workspace users:", err);
    res.status(500).json({
      message: "Could not fetch the users",
    });
  }
};


export const getallUser = async (req: Request, res: Response): Promise<any> => {
  try{
    const users = await User.find().select("-password -email");
    // console.log(users);
    res.json(users);
  }catch(error){
    console.error("Error fetching all users:", error);
    res.status(500).json({
      message: "Could not fetch the users",
    });
  }
}