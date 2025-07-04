import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET || "secretkey";

export const generateToken = (userId: string) => {
    return jwt.sign({id: userId}, SECRET, {expiresIn: '15d'});
};

export const verifyToken = (token: string) => {
    return jwt.verify(token,SECRET);
}