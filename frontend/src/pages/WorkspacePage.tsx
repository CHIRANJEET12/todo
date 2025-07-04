import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import KanbanBoard from "../components/auth/KanbanBoard";
import { Link } from "react-router-dom";
import api from "../api";

type Workspace = {
  _id: string;
  name: string;
  code?: string;
};

const WorkspacePage = () => {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = JSON.parse(localStorage.getItem("data") || "{}")?.token || "";

  useEffect(() => {
    if (!id) return;

    const joinWorkspace = async () => {
      setIsLoading(true);
      try {
        const res = await api.post(
          `/workspace/join/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWorkspace(res.data);
        localStorage.setItem("workspace", JSON.stringify(res.data));
      } catch (err) {
        console.error("Join workspace failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    joinWorkspace();
  }, [id, token]);

  return (
    <div className="min-h-screen bg-orange-50 text-orange-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Workspace Header */}
        <section className="mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-orange-200">
            {isLoading ? (
              <div className="flex items-center space-x-3 animate-pulse">
                <div className="h-9 w-9 rounded-full bg-orange-200"></div>
                <div className="h-6 w-56 rounded bg-orange-200"></div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-orange-100 mb-6">
                  {/* Create Task Button - Left */}
                  <div className="order-1 md:order-none">
                    <Link
                      to="/createtask"
                      className="inline-block px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg font-medium"
                    >
                      + Create Task
                    </Link>
                  </div>

                  {/* Workspace Title - Center */}
                  <div className="order-3 md:order-none text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-orange-800">
                      {workspace?.name || "Untitled Workspace"}
                    </h1>
                  </div>

                  {/* Workspace Code - Right */}
                  {workspace?.code && (
                    <div className="order-2 md:order-none flex items-center bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
                      <span className="text-sm font-medium text-orange-600 mr-2">Code:</span>
                      <span className="font-mono font-bold text-orange-800">
                        {workspace.code}
                      </span>
                    </div>
                  )}
                </div>

              </>
            )}
          </div>
        </section>

        {/* Kanban Board Section */}
        <section>
          <div className="bg-white rounded-xl border border-orange-200 p-6 shadow-sm">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
              </div>
            ) : workspace ? (
              <KanbanBoard workspaceId={workspace._id} />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl text-orange-700 mb-2">Workspace Not Found</h3>
                <p className="text-orange-600">
                  The requested workspace could not be loaded
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-orange-200 text-center text-orange-500 text-sm">
          Workspace ID: {id}
        </footer>
      </div>
    </div>
  );
};

export default WorkspacePage;