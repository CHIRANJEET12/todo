import { Router } from "express";
import {authenticateToken} from '../middlewares/auth.middleware';
import { register, login, getUsers, getallUser } from "../controllers/auth.controller";
import { createTask, getTasks, updateTask, deleteTask} from '../controllers/task.controller';
import { getRecentActions } from '../controllers/action.controller';
import { workspace, workspaceverify } from '../controllers/workspace.controller';
import { getSelftask } from "../controllers/getSelfTask.controller";
import { getUserWorkspaces } from "../controllers/getUserWorkspaces.controller";

//testing
// router.get("/getdash", authenticateToken, (req, res) => {
// 	res.json({ message: "Dashboard data" });
// });


const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get('/users/:id',authenticateToken,getUsers);
router.get("/users",authenticateToken,getallUser)
router.get('/getuserworkspaces/:userId',authenticateToken,getUserWorkspaces);
router.get('/getselftask/:userId',authenticateToken,getSelftask);
router.post("/createtask",authenticateToken,createTask);
router.get("/gettask",authenticateToken,getTasks);
router.patch("/updatetask/:id",authenticateToken,updateTask);
router.delete("/deletetask/:id",authenticateToken,deleteTask);
router.get("/recent",authenticateToken,getRecentActions);
router.post("/workspace/create", authenticateToken,workspace);
router.post("/workspace/join/:id",authenticateToken,workspaceverify);


export default router;
