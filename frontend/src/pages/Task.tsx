import React, { useEffect, useState } from "react";
import api from "../api";


interface User {
  _id: string;
  username: string;
}

const validStatuses = ["Todo", "In Progress", "Done"];
const validPriorities = ["Low", "Medium", "High"];

const priorityColors = {
  Low: "bg-green-100 text-green-800",
  Medium: "bg-yellow-100 text-yellow-800",
  High: "bg-red-100 text-red-800"
};

const statusColors = {
  Todo: "bg-gray-100 text-gray-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Done: "bg-green-100 text-green-800"
};

const TaskCreatePage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUser, setAssignedUser] = useState<string>("");
  const [status, setStatus] = useState("Todo");
  const [priority, setPriority] = useState("Low");
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const token = JSON.parse(localStorage.getItem("data") || "{}")?.token || "";
  const workspace = JSON.parse(localStorage.getItem("workspace") || "{}")?._id;
  // console.log(workspace);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get(`/users/${workspace}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
    };
    fetchUsers();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!title.trim()) {
      setError("Title is required");
      setIsLoading(false);
      return;
    }
    if (!workspace) {
      setError("No workspace selected. Please join or create one first.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post(
        "/createtask",
        {
          title,
          description,
          assignedUser: assignedUser || null,
          status,
          priority,
          workspace,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(res.data);
      setSuccess("Task created successfully!");
      setTitle("");
      setDescription("");
      setAssignedUser("");
      setStatus("Todo");
      setPriority("Low");
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to create task. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-neutral-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Create New Task</h1>
          <p className="text-neutral-500">Fill in the details to create a new task</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
          {status}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition"
              placeholder="Task title"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700">Assigned To</label>
            <select
              value={assignedUser}
              onChange={(e) => setAssignedUser(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition"
            rows={4}
            placeholder="Task description (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {validStatuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${status === s 
                    ? statusColors[s as keyof typeof statusColors] + ' ring-2 ring-offset-1 ring-neutral-300'
                    : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {validPriorities.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${priority === p 
                    ? priorityColors[p as keyof typeof priorityColors] + ' ring-2 ring-offset-1 ring-neutral-300'
                    : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${isLoading 
              ? 'bg-orange-400 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 shadow-md'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskCreatePage;