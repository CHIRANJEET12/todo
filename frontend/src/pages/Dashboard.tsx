import { useEffect, useState } from "react";
import ActivityLogPanel from "../components/auth/ActivityLogPanel";
import api from "../api";
import { Link } from "react-router-dom";

interface Task {
  status: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
  const [userWorkspaces, setUserWorkspaces] = useState<{ _id: string; code: string; name: string }[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const token = JSON.parse(localStorage.getItem("data") || "{}")?.token || "";
  const data = JSON.parse(localStorage.getItem("data") || "{}");
  const userdata = data.user?.username || "Guest";
  const userId = data.user?.id || '';
  const [joinCode, setJoinCode] = useState("");
  
  const handleJoinWorkspace = () => {
    if (/^\d{6}$/.test(joinCode)) {
      window.location.href = `/viewworkspace/${joinCode}`;
    } else {
      alert("Please enter a valid 6-digit numeric code.");
    }
  };


  const fetchWorkspaces = async () => {
    try {
      setLoadingWorkspaces(true);
      const res = await api.get(`/getuserworkspaces/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserWorkspaces(res.data);
    } catch (error) {
      console.error("Error fetching user workspaces:", error);
    } finally {
      setLoadingWorkspaces(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const res = await api.get(`/getselftask/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tasks: Task[] = Array.isArray(res.data) ? res.data : res.data.tasks || [];

        setStats({
          total: tasks.length,
          todo: tasks.filter((t) => t.status === "Todo").length,
          inProgress: tasks.filter((t) => t.status === "In Progress").length,
          done: tasks.filter((t) => t.status === "Done").length,
        });
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setStats({ total: 0, todo: 0, inProgress: 0, done: 0 });
      } finally {
        setLoadingStats(false);
      }
    };

    if (token) {
      fetchStats();
      fetchWorkspaces();
    }
  }, [token]);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-neutral-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-orange-600">Dashboard</h1>
        <p className="text-neutral-700 mt-1">Welcome back, <span className="font-medium text-black">{userdata}</span></p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Tasks Card */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-orange-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total Tasks</p>
              {loadingStats ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              ) : (
                <p className="text-2xl font-semibold text-neutral-800">{stats.total}</p>
              )}
            </div>
          </div>
        </div>

        {/* Todo Card */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-amber-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-500">To Do</p>
              {loadingStats ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
              ) : (
                <p className="text-2xl font-semibold text-neutral-800">{stats.todo}</p>
              )}
            </div>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-500">In Progress</p>
              {loadingStats ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              ) : (
                <p className="text-2xl font-semibold text-neutral-800">{stats.inProgress}</p>
              )}
            </div>
          </div>
        </div>

        {/* Done Card */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-green-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-neutral-500">Completed</p>
              {loadingStats ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              ) : (
                <p className="text-2xl font-semibold text-neutral-800">{stats.done}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Workspaces Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-800">Your Workspaces</h2>
          <Link
            to="/createworkspace"
            className="text-sm px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Workspace
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100 mb-8">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">Join Workspace</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="w-full sm:w-1/3 px-4 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={handleJoinWorkspace}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md transition"
            >
              Join Workspace
            </button>
          </div>
        </div>


        {loadingWorkspaces ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
          </div>
        ) : userWorkspaces.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <p className="text-neutral-600 mb-4">You don't have any workspaces yet</p>
            <Link
              to="/createworkspace"
              className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Create your first workspace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userWorkspaces.map(ws => (
              <Link
                to={`/viewworkspace/${ws.code}`}
                key={ws.code}
                className="group p-4 border border-neutral-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-800 group-hover:text-orange-600 transition-colors">{ws.name}</h3>
                    <p className="text-xs text-neutral-500">Code: {ws.code}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Activity Log Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-800">Recent Activity</h2>
          <button className="text-sm text-orange-600 hover:text-orange-800 font-medium">
            View All
          </button>
        </div>
        <ActivityLogPanel />
      </div>
    </div>
  );
};

export default Dashboard;
