import { useEffect, useState } from "react";
import io from "socket.io-client";
import api from "../../api";
import { baseapi } from "../../api";

// Ensure baseapi is a string URL, not an Axios instance
const socket = io(typeof baseapi === "string" ? baseapi : "https://taskflow-3z4n.onrender.com", { path: "/socket.io" });

interface Action {
    _id: string;
    actionType: string;
    timestamp: string;
    userId: { _id: string; username: string };
    taskId: { _id: string; title: string };
}

const ActivityLogPanel = () => {
    const [actions, setActions] = useState<Action[]>([]);
    const token = JSON.parse(localStorage.getItem("data") || "{}")?.token || "";

    useEffect(() => {
        const fetchActions = async () => {
            try {
                const res = await api.get("/recent", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setActions(res.data);
            } catch (err) {
                console.error("Error fetching recent actions:", err);
            }
        };

        fetchActions();

        socket.on("newAction", (newAction: Action) => {
            setActions((prev) => [newAction, ...prev.slice(0, 19)]);
        });

        return () => {
            socket.off("newAction");
        };
    }, [token]);

    const getActionIcon = (actionType: string) => {
        switch(actionType) {
            case 'action_create':
                return (
                    <div className="p-2 rounded-full bg-green-100 text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                );
            case 'action_update':
                return (
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                );
            case 'action_delete':
                return (
                    <div className="p-2 rounded-full bg-red-100 text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-sm border border-neutral-100 w-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    Activity Log
                </h2>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    Real-time
                </span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {actions.length === 0 ? (
                    <div className="text-center py-4 text-neutral-500">
                        No activities yet
                    </div>
                ) : (
                    actions
                        .filter((a)=>a.userId?._id && a.timestamp )
                        .map((a) => {
                        const username = a.userId?.username;
                        const taskTitle = a.taskId?.title;
                        const actionText = a.actionType
                            ? a.actionType.replace("action_", "").replaceAll("_", " ")
                            : "performed an action";
                        const formattedDate = new Date(a.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return (
                            <div key={a._id || `${a.userId?._id}-${a.timestamp}`} className="flex items-start gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                                {getActionIcon(a.actionType)}
                                <div className="flex-1">
                                    <div className="flex items-baseline justify-between">
                                        <span className="font-medium text-neutral-800">{username}</span>
                                        <span className="text-xs text-neutral-400">{formattedDate}</span>
                                    </div>
                                    <p className="text-sm text-neutral-600">
                                        {actionText} on <span className="font-medium text-orange-600">{taskTitle}</span>
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ActivityLogPanel;
