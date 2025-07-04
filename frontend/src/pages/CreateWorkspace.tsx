import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api";

const CreateWorkspace = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const token = JSON.parse(localStorage.getItem("data") || "{}")?.token || "";

  const handleCreate = async () => {
    if (!name.trim()) {
      setMessage("Workspace name is required.");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await api.post(
        "/workspace/create",
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdWorkspace = res.data;
      localStorage.setItem("workspace", JSON.stringify(createdWorkspace));

      setCode(createdWorkspace.code);
      setMessage("Workspace created successfully!");
      
      // Navigate to workspace view after creation
      navigate(`/viewworkspace/${createdWorkspace.code}`);
    } catch (err) {
      console.error("Failed to create workspace:", err);
      setMessage("Failed to create workspace. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-sm border border-neutral-100">
      <div className="text-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-orange-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <h2 className="text-2xl font-bold text-neutral-800 mt-3">
          Create New Workspace
        </h2>
        <p className="text-neutral-500 mt-1">
          Get started by creating a new shared workspace
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Workspace Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Marketing Team"
            className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            isLoading
              ? "bg-orange-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700 shadow-md"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </span>
          ) : (
            "Create Workspace"
          )}
        </button>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm flex items-center ${
              message.includes("success")
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d={
                  message.includes("success")
                    ? "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    : "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                }
                clipRule="evenodd"
              />
            </svg>
            {message}
          </div>
        )}

        {code && (
          <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <h3 className="font-medium text-neutral-800 mb-2">
              Workspace Created!
            </h3>
            <p className="text-sm text-neutral-600 mb-3">
              Share this invite code with your team members:
            </p>
            <div className="bg-white p-3 rounded border border-neutral-200 font-mono text-center text-lg font-bold text-orange-600">
              {code}
            </div>
            <p className="text-sm text-neutral-500 mt-3">
              Or you can visit your workspace directly:{" "}
              <a
                href={`/viewworkspace/548491`}
                className="text-orange-600 hover:underline"
              >
                Go to Workspace
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateWorkspace;