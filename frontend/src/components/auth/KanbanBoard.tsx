import { useEffect, useState } from "react";
import io from "socket.io-client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../../api";
import { baseapi } from "../../api";

// Ensure baseapi is a string URL, not an Axios instance
const socket = io(typeof baseapi === "string" ? baseapi : "http://localhost:8000", { path: "/socket.io" });

interface Task {
  _id: string;
  title: string;
  status: "Todo" | "In Progress" | "Done";
  assignedUser: User | null;
  userId: User | null;
  updatedAt: string;
  priority?: "Low" | "Medium" | "High";
  workspace?: string;
}

interface User {
  _id: string;
  username: string;
}

interface KanbanBoardProps {
  workspaceId: string;
}

const statuses: Task["status"][] = ["Todo", "In Progress", "Done"];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ workspaceId }) => {
  // console.log("workdspaceid: ",workspaceId);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const token = JSON.parse(localStorage.getItem("data") || "{}")?.token || "";
  const info = JSON.parse(localStorage.getItem("data") || "{}");
  const currentUserId = info?.user?.id || "";
  const currentUserName = info?.user?.username || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, usersRes] = await Promise.all([
          api.get("/gettask", {
            headers: { Authorization: `Bearer ${token}` },
            params: { workspace: workspaceId },
          }),
          api.get(`/users/${workspaceId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      } catch (error) {
        console.error("Failed to fetch tasks or users:", error);
      }
    };
    fetchData();
  }, [token, workspaceId]);

  useEffect(() => {
    socket.on("taskCreated", (newTask: Task) => {
      if (newTask.workspace === workspaceId) {
        setTasks((prevTask) => [...prevTask, newTask]);
      }
    });

    socket.on("taskUpdated", (updateTask: Task) => {
      if (updateTask.workspace === workspaceId) {
        setTasks((prevTask) =>
          prevTask.map((task) => (task._id === updateTask._id ? updateTask : task))
        );
      }
    });

    socket.on("taskDeleted", (deletedTaskId: string) => {
      setTasks((prevTask) => prevTask.filter((task) => task._id !== deletedTaskId));
    });

    socket.on("useradded", (updatedWorkspace) => {
      console.log("New user joined workspace:", updatedWorkspace);
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
      socket.off("useradded");
    };
  }, [workspaceId]);

  const onDragEnd = async (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index)
      return;

    const movedTask = tasks.find((t) => t._id === draggableId);
    if (!movedTask) return;

    const newStatus = destination.droppableId as Task["status"];
    const updatedTask: Task = { ...movedTask, status: newStatus };

    const newTasks = tasks.map((t) => (t._id === draggableId ? updatedTask : t));
    setTasks(newTasks);

    try {
      await api.patch(
        `/updatetask/${movedTask._id}`,
        {
          status: newStatus,
          clientLastUpdate: movedTask.updatedAt,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to update task status", error);
    }
  };

  const handleUserChange = async (taskId: string, newUserId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const newAssignedUser = users.find((u) => u._id === newUserId) || null;

    const updatedTasks = tasks.map((t) =>
      t._id === taskId ? { ...t, assignedUser: newAssignedUser } : t
    );
    setTasks(updatedTasks);

    try {
      await api.patch(
        `/updatetask/${taskId}`,
        {
          assignedUser: newUserId || null,
          clientLastUpdate: task.updatedAt,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to update assigned user", error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await api.delete(`/deletetask/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (err: any) {
      console.error("Failed to delete task:", err?.response?.data?.message || err.message);
    }
  };

  const handelsmartSubmit = async (taskId: string) => {
    try {
      const userTaskCount: { [userId: string]: number } = {};

      tasks.forEach((task) => {
        const uid = task.assignedUser?._id;
        if (uid && (task.status === 'Todo' || task.status === 'In Progress')) {
          userTaskCount[uid] = (userTaskCount[uid] || 0) + 1;
        }
      });

      const leastBusyUser = users.reduce((prev, curr) => {
        const prevCount = userTaskCount[prev._id] || 0;
        const currCount = userTaskCount[curr._id] || 0;
        return currCount < prevCount ? curr : prev;
      });

      if (!leastBusyUser) {
        console.warn("No users available for smart assignment.");
        return;
      }

      return handleUserChange(taskId, leastBusyUser._id);
    } catch (error) {
      console.error("Smart assign failed:", error);
    }
  };

  return (
    <div className="flex gap-6 p-6 overflow-x-auto bg-orange-50 min-h-screen">
      <DragDropContext onDragEnd={onDragEnd}>
        {statuses.map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`w-80 flex-shrink-0 rounded-lg shadow-sm ${snapshot.isDraggingOver ? "bg-orange-100/50" : "bg-white"}`}
              >
                <div className={`p-4 rounded-t-lg ${status === "Todo" ? "bg-orange-200" :
                  status === "In Progress" ? "bg-orange-300" :
                    "bg-orange-400"
                  }`}>
                  <h3 className="font-bold text-lg text-orange-900">{status}</h3>
                </div>

                <div className="p-3 space-y-3 min-h-[400px]">
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 rounded-lg shadow-xs gap-10 border ${snapshot.isDragging ? "border-orange-500 bg-orange-50" :
                              task.userId?._id === currentUserId ? "border-green-300 bg-green-50" :
                                task.assignedUser?.username === currentUserName ? "border-red-300 bg-red-50" :
                                  "border-orange-200 bg-white"
                              }`}
                          >

                            <div className="font-semibold text-orange-900">{task.title}</div>
                            <div className="text-sm text-orange-700">Assigned by: {task.userId?.username}</div>
                            <div className="flex text-center gap-5">
                              {task.userId?._id === currentUserId && (
                                <button
                                  onClick={() => handleDelete(task._id)}
                                  className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                                >
                                  Delete Task
                                </button>
                              )}
                              <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${task.priority === "High" ? "bg-orange-100 text-orange-800" :
                                task.priority === "Medium" ? "bg-orange-50 text-orange-700" :
                                  "bg-orange-50/50 text-orange-600"
                                }`}>
                                {task.priority || "No priority"}
                              </div>
                            </div>

                            {task.assignedUser ? (
                              <select
                                value={task.assignedUser._id}
                                onChange={(e) => handleUserChange(task._id, e.target.value)}
                                className="mt-2 w-full border border-orange-200 rounded-md p-1 text-sm text-orange-800 bg-white"
                              >
                                <option value="">Unassigned</option>
                                {users.map((user) => (
                                  <option key={user._id} value={user._id}>
                                    {user.username}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-orange-500 italic">Not assigned</span>
                                <button
                                  onClick={() => handelsmartSubmit(task._id)}
                                  className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded"
                                >
                                  Smart Assign
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;